import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './EnhancedAuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/enhanced-notifications';
import apiClient from '@/services/api';

// Tenant Types
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'suspended' | 'trial';
  settings: TenantSettings;
  branding: TenantBranding;
  limits: TenantLimits;
  usage: TenantUsage;
  created_at: string;
  updated_at: string;
  owner_id: number;
}

export interface TenantSettings {
  timezone: string;
  currency: string;
  language: string;
  date_format: string;
  features: {
    inventory: boolean;
    finance: boolean;
    hr: boolean;
    analytics: boolean;
    api_access: boolean;
    white_label: boolean;
    custom_domain: boolean;
    priority_support: boolean;
  };
}

export interface TenantBranding {
  logo?: string;
  favicon?: string;
  primary_color: string;
  secondary_color: string;
  company_name: string;
  support_email: string;
  custom_css?: string;
}

export interface TenantLimits {
  users: number;
  storage_gb: number;
  api_calls_per_month: number;
  custom_domains: number;
  white_label_enabled: boolean;
}

export interface TenantUsage {
  users_count: number;
  storage_used_gb: number;
  api_calls_this_month: number;
  last_reset: string;
}

export interface TenantMember {
  id: number;
  user_id: number;
  tenant_id: string;
  role: 'owner' | 'admin' | 'manager' | 'user';
  permissions: string[];
  joined_at: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
  };
}

export interface CreateTenantData {
  name: string;
  slug: string;
  plan: 'free' | 'pro' | 'enterprise';
  settings: Partial<TenantSettings>;
  branding: Partial<TenantBranding>;
}

export interface UpdateTenantData {
  name?: string;
  settings?: Partial<TenantSettings>;
  branding?: Partial<TenantBranding>;
}

// Context Type
interface TenantContextType {
  // Current tenant
  currentTenant: Tenant | null;
  isLoading: boolean;
  error: Error | null;
  
  // Tenant management
  switchTenant: (tenantId: string) => Promise<void>;
  updateTenant: (data: UpdateTenantData) => Promise<void>;
  
  // Tenant members
  members: TenantMember[];
  addMember: (email: string, role: string) => Promise<void>;
  removeMember: (memberId: number) => Promise<void>;
  updateMemberRole: (memberId: number, role: string) => Promise<void>;
  
  // Tenant features
  hasFeature: (feature: keyof TenantSettings['features']) => boolean;
  canInviteUsers: () => boolean;
  getUsagePercentage: (type: 'users' | 'storage' | 'api_calls') => number;
  
  // Multi-tenant data isolation
  getTenantHeaders: () => Record<string, string>;
  
  // Admin functions (for super admins)
  isSuperAdmin: boolean;
  allTenants: Tenant[];
  createTenant: (data: CreateTenantData) => Promise<Tenant>;
  suspendTenant: (tenantId: string) => Promise<void>;
  activateTenant: (tenantId: string) => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

// API Functions
const tenantApi = {
  getCurrentTenant: () => apiClient.get<Tenant>('/tenants/current/'),
  getTenantMembers: (tenantId: string) => apiClient.get<TenantMember[]>(`/tenants/${tenantId}/members/`),
  switchTenant: (tenantId: string) => apiClient.post(`/tenants/${tenantId}/switch/`),
  updateTenant: (tenantId: string, data: UpdateTenantData) => 
    apiClient.patch(`/tenants/${tenantId}/`, data),
  addMember: (tenantId: string, email: string, role: string) =>
    apiClient.post(`/tenants/${tenantId}/members/`, { email, role }),
  removeMember: (tenantId: string, memberId: number) =>
    apiClient.delete(`/tenants/${tenantId}/members/${memberId}/`),
  updateMemberRole: (tenantId: string, memberId: number, role: string) =>
    apiClient.patch(`/tenants/${tenantId}/members/${memberId}/`, { role }),
  
  // Admin functions
  getAllTenants: () => apiClient.get<Tenant[]>('/admin/tenants/'),
  createTenant: (data: CreateTenantData) => apiClient.post<Tenant>('/admin/tenants/', data),
  suspendTenant: (tenantId: string) => apiClient.post(`/admin/tenants/${tenantId}/suspend/`),
  activateTenant: (tenantId: string) => apiClient.post(`/admin/tenants/${tenantId}/activate/`),
};

interface TenantProviderProps {
  children: React.ReactNode;
}

export function TenantProvider({ children }: TenantProviderProps) {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  
  // Current tenant state
  const [currentTenantId, setCurrentTenantId] = useState<string | null>(null);
  
  // Fetch current tenant
  const { 
    data: currentTenant, 
    isLoading: tenantLoading, 
    error: tenantError 
  } = useQuery({
    queryKey: ['tenant', 'current'],
    queryFn: async () => {
      const response = await tenantApi.getCurrentTenant();
      setCurrentTenantId(response.data.id);
      return response.data;
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch tenant members
  const { data: members = [] } = useQuery({
    queryKey: ['tenant', 'members', currentTenantId],
    queryFn: () => tenantApi.getTenantMembers(currentTenantId!),
    enabled: !!currentTenantId,
  });
  
  // Fetch all tenants (for super admins)
  const { data: allTenants = [] } = useQuery({
    queryKey: ['admin', 'tenants'],
    queryFn: () => tenantApi.getAllTenants(),
    enabled: isAuthenticated && user?.is_superuser,
  });
  
  // Mutations
  const switchTenantMutation = useMutation({
    mutationFn: tenantApi.switchTenant,
    onSuccess: (_, tenantId) => {
      setCurrentTenantId(tenantId);
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Tenant Switched', 'Successfully switched to new tenant');
    },
    onError: (error: any) => {
      toast.error('Switch Failed', error.message || 'Failed to switch tenant');
    },
  });
  
  const updateTenantMutation = useMutation({
    mutationFn: ({ tenantId, data }: { tenantId: string; data: UpdateTenantData }) =>
      tenantApi.updateTenant(tenantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Tenant Updated', 'Tenant settings updated successfully');
    },
    onError: (error: any) => {
      toast.error('Update Failed', error.message || 'Failed to update tenant');
    },
  });
  
  const addMemberMutation = useMutation({
    mutationFn: ({ email, role }: { email: string; role: string }) =>
      tenantApi.addMember(currentTenantId!, email, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'members'] });
      toast.success('Member Added', 'User added to tenant successfully');
    },
    onError: (error: any) => {
      toast.error('Add Failed', error.message || 'Failed to add member');
    },
  });
  
  const removeMemberMutation = useMutation({
    mutationFn: (memberId: number) => tenantApi.removeMember(currentTenantId!, memberId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'members'] });
      toast.success('Member Removed', 'User removed from tenant');
    },
    onError: (error: any) => {
      toast.error('Remove Failed', error.message || 'Failed to remove member');
    },
  });
  
  const createTenantMutation = useMutation({
    mutationFn: tenantApi.createTenant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'tenants'] });
      toast.success('Tenant Created', 'New tenant created successfully');
    },
    onError: (error: any) => {
      toast.error('Creation Failed', error.message || 'Failed to create tenant');
    },
  });
  
  // Helper functions
  const hasFeature = (feature: keyof TenantSettings['features']): boolean => {
    return currentTenant?.settings.features[feature] || false;
  };
  
  const canInviteUsers = (): boolean => {
    if (!currentTenant) return false;
    return currentTenant.usage.users_count < currentTenant.limits.users;
  };
  
  const getUsagePercentage = (type: 'users' | 'storage' | 'api_calls'): number => {
    if (!currentTenant) return 0;
    
    switch (type) {
      case 'users':
        return (currentTenant.usage.users_count / currentTenant.limits.users) * 100;
      case 'storage':
        return (currentTenant.usage.storage_used_gb / currentTenant.limits.storage_gb) * 100;
      case 'api_calls':
        return (currentTenant.usage.api_calls_this_month / currentTenant.limits.api_calls_per_month) * 100;
      default:
        return 0;
    }
  };
  
  const getTenantHeaders = (): Record<string, string> => {
    if (!currentTenantId) return {};
    return {
      'X-Tenant-ID': currentTenantId,
    };
  };
  
  // Context value
  const value: TenantContextType = {
    currentTenant,
    isLoading: tenantLoading,
    error: tenantError as Error | null,
    
    switchTenant: switchTenantMutation.mutateAsync,
    updateTenant: (data) => updateTenantMutation.mutateAsync({ tenantId: currentTenantId!, data }),
    
    members,
    addMember: (email, role) => addMemberMutation.mutateAsync({ email, role }),
    removeMember: removeMemberMutation.mutateAsync,
    updateMemberRole: (memberId, role) => 
      tenantApi.updateMemberRole(currentTenantId!, memberId, role),
    
    hasFeature,
    canInviteUsers,
    getUsagePercentage,
    getTenantHeaders,
    
    isSuperAdmin: user?.is_superuser || false,
    allTenants,
    createTenant: createTenantMutation.mutateAsync,
    suspendTenant: (tenantId) => tenantApi.suspendTenant(tenantId),
    activateTenant: (tenantId) => tenantApi.activateTenant(tenantId),
  };
  
  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}

// HOC for tenant-specific features
interface WithTenantFeatureProps {
  children: React.ReactNode;
  feature: keyof TenantSettings['features'];
  fallback?: React.ReactNode;
}

export function WithTenantFeature({ children, feature, fallback = null }: WithTenantFeatureProps) {
  const { hasFeature } = useTenant();
  
  if (!hasFeature(feature)) {
    return <>{fallback}</>;
  }
  
  return <>{children}</>;
}

export default TenantProvider;
