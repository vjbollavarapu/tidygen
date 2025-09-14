import React, { createContext, useContext, useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/components/ui/enhanced-notifications';
import apiClient from '@/services/api';

// Partner Types
export interface Partner {
  id: string;
  name: string;
  email: string;
  company: string;
  website?: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  status: 'pending' | 'active' | 'suspended' | 'terminated';
  commission_rate: number;
  white_label_enabled: boolean;
  custom_domain?: string;
  branding: PartnerBranding;
  limits: PartnerLimits;
  performance: PartnerPerformance;
  created_at: string;
  updated_at: string;
  approved_by?: string;
  approved_at?: string;
}

export interface PartnerBranding {
  logo?: string;
  favicon?: string;
  primary_color: string;
  secondary_color: string;
  company_name: string;
  support_email: string;
  support_phone?: string;
  custom_domain?: string;
  custom_css?: string;
  remove_tidygen_branding: boolean;
  footer_text?: string;
  privacy_policy_url?: string;
  terms_of_service_url?: string;
}

export interface PartnerLimits {
  max_customers: number;
  max_tenants_per_customer: number;
  max_users_per_tenant: number;
  storage_limit_gb: number;
  api_calls_per_month: number;
  custom_domains: number;
  white_label_enabled: boolean;
  priority_support: boolean;
  dedicated_account_manager: boolean;
}

export interface PartnerPerformance {
  total_customers: number;
  active_tenants: number;
  total_revenue: number;
  commission_earned: number;
  monthly_recurring_revenue: number;
  customer_satisfaction_score: number;
  last_month_commissions: number;
  year_to_date_commissions: number;
  conversion_rate: number;
  churn_rate: number;
}

export interface PartnerCustomer {
  id: string;
  partner_id: string;
  customer_name: string;
  customer_email: string;
  company: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'trial' | 'suspended' | 'cancelled';
  monthly_revenue: number;
  commission_rate: number;
  created_at: string;
  last_payment: string;
  next_billing: string;
}

export interface Commission {
  id: string;
  partner_id: string;
  customer_id: string;
  tenant_id: string;
  amount: number;
  commission_rate: number;
  commission_amount: number;
  period_start: string;
  period_end: string;
  status: 'pending' | 'approved' | 'paid' | 'disputed';
  payment_date?: string;
  created_at: string;
}

export interface PartnerTier {
  id: string;
  name: string;
  display_name: string;
  commission_rate: number;
  limits: PartnerLimits;
  benefits: string[];
  requirements: {
    min_customers?: number;
    min_revenue?: number;
    min_tenure_months?: number;
  };
  color: string;
  icon: string;
}

// Context Type
interface PartnerContextType {
  // Current partner
  currentPartner: Partner | null;
  isLoading: boolean;
  error: Error | null;
  
  // Partner management
  updatePartner: (data: Partial<Partner>) => Promise<any>;
  updateBranding: (branding: Partial<PartnerBranding>) => Promise<any>;
  
  // Customer management
  customers: PartnerCustomer[];
  addCustomer: (customerData: Omit<PartnerCustomer, 'id' | 'partner_id' | 'created_at'>) => Promise<any>;
  updateCustomer: (customerId: string, data: Partial<PartnerCustomer>) => Promise<any>;
  removeCustomer: (customerId: string) => Promise<any>;
  
  // Commission management
  commissions: Commission[];
  getCommissionReport: (startDate: string, endDate: string) => Promise<any>;
  
  // Performance metrics
  getPerformanceMetrics: () => PartnerPerformance;
  getTierBenefits: () => string[];
  canUpgradeTier: () => boolean;
  
  // White-label features
  isWhiteLabelEnabled: boolean;
  getBrandingConfig: () => PartnerBranding;
  
  // Admin functions (for super admins)
  isSuperAdmin: boolean;
  allPartners: Partner[];
  approvePartner: (partnerId: string) => Promise<any>;
  suspendPartner: (partnerId: string) => Promise<any>;
  updateCommissionRate: (partnerId: string, rate: number) => Promise<any>;
}

const PartnerContext = createContext<PartnerContextType | undefined>(undefined);

// API Functions
const partnerApi = {
  getCurrentPartner: () => apiClient.get<Partner>('/partners/current/'),
  getPartnerCustomers: (partnerId: string) => apiClient.get<PartnerCustomer[]>(`/partners/${partnerId}/customers/`),
  getPartnerCommissions: (partnerId: string) => apiClient.get<Commission[]>(`/partners/${partnerId}/commissions/`),
  updatePartner: (partnerId: string, data: Partial<Partner>) => 
    apiClient.patch(`/partners/${partnerId}/`, data),
  updateBranding: (partnerId: string, branding: Partial<PartnerBranding>) =>
    apiClient.patch(`/partners/${partnerId}/branding/`, branding),
  addCustomer: (partnerId: string, customerData: any) =>
    apiClient.post(`/partners/${partnerId}/customers/`, customerData),
  updateCustomer: (partnerId: string, customerId: string, data: Partial<PartnerCustomer>) =>
    apiClient.patch(`/partners/${partnerId}/customers/${customerId}/`, data),
  removeCustomer: (partnerId: string, customerId: string) =>
    apiClient.delete(`/partners/${partnerId}/customers/${customerId}/`),
  getCommissionReport: (partnerId: string, startDate: string, endDate: string) =>
    apiClient.get(`/partners/${partnerId}/commissions/report/?start=${startDate}&end=${endDate}`),
  
  // Admin functions
  getAllPartners: () => apiClient.get<Partner[]>('/admin/partners/'),
  approvePartner: (partnerId: string) => apiClient.post(`/admin/partners/${partnerId}/approve/`),
  suspendPartner: (partnerId: string) => apiClient.post(`/admin/partners/${partnerId}/suspend/`),
  updateCommissionRate: (partnerId: string, rate: number) =>
    apiClient.patch(`/admin/partners/${partnerId}/commission-rate/`, { rate }),
};

// Partner Tiers Configuration
const PARTNER_TIERS: PartnerTier[] = [
  {
    id: 'bronze',
    name: 'bronze',
    display_name: 'Bronze Partner',
    commission_rate: 0.15, // 15%
    limits: {
      max_customers: 10,
      max_tenants_per_customer: 1,
      max_users_per_tenant: 25,
      storage_limit_gb: 10,
      api_calls_per_month: 10000,
      custom_domains: 1,
      white_label_enabled: false,
      priority_support: false,
      dedicated_account_manager: false,
    },
    benefits: [
      '15% commission rate',
      'Up to 10 customers',
      'Standard support',
      'Basic reporting',
      'Partner portal access',
    ],
    requirements: {
      min_customers: 0,
      min_revenue: 0,
      min_tenure_months: 0,
    },
    color: '#CD7F32',
    icon: '🥉',
  },
  {
    id: 'silver',
    name: 'silver',
    display_name: 'Silver Partner',
    commission_rate: 0.20, // 20%
    limits: {
      max_customers: 50,
      max_tenants_per_customer: 3,
      max_users_per_tenant: 100,
      storage_limit_gb: 50,
      api_calls_per_month: 50000,
      custom_domains: 3,
      white_label_enabled: true,
      priority_support: true,
      dedicated_account_manager: false,
    },
    benefits: [
      '20% commission rate',
      'Up to 50 customers',
      'Priority support',
      'White-label branding',
      'Advanced reporting',
      'Custom domains',
      'Marketing materials',
    ],
    requirements: {
      min_customers: 5,
      min_revenue: 1000,
      min_tenure_months: 3,
    },
    color: '#C0C0C0',
    icon: '🥈',
  },
  {
    id: 'gold',
    name: 'gold',
    display_name: 'Gold Partner',
    commission_rate: 0.25, // 25%
    limits: {
      max_customers: 200,
      max_tenants_per_customer: 10,
      max_users_per_tenant: 500,
      storage_limit_gb: 200,
      api_calls_per_month: 200000,
      custom_domains: 10,
      white_label_enabled: true,
      priority_support: true,
      dedicated_account_manager: true,
    },
    benefits: [
      '25% commission rate',
      'Up to 200 customers',
      'Dedicated account manager',
      'Full white-label branding',
      'Custom integrations',
      'Co-marketing opportunities',
      'Training and certification',
      'Early access to features',
    ],
    requirements: {
      min_customers: 20,
      min_revenue: 10000,
      min_tenure_months: 6,
    },
    color: '#FFD700',
    icon: '🥇',
  },
  {
    id: 'platinum',
    name: 'platinum',
    display_name: 'Platinum Partner',
    commission_rate: 0.30, // 30%
    limits: {
      max_customers: -1, // Unlimited
      max_tenants_per_customer: -1, // Unlimited
      max_users_per_tenant: -1, // Unlimited
      storage_limit_gb: -1, // Unlimited
      api_calls_per_month: -1, // Unlimited
      custom_domains: -1, // Unlimited
      white_label_enabled: true,
      priority_support: true,
      dedicated_account_manager: true,
    },
    benefits: [
      '30% commission rate',
      'Unlimited customers',
      'VIP support',
      'Custom development',
      'Revenue sharing',
      'Strategic partnership',
      'Joint go-to-market',
      'Executive relationship',
    ],
    requirements: {
      min_customers: 100,
      min_revenue: 100000,
      min_tenure_months: 12,
    },
    color: '#E5E4E2',
    icon: '💎',
  },
];

interface PartnerProviderProps {
  children: React.ReactNode;
}

export function PartnerProvider({ children }: PartnerProviderProps) {
  const queryClient = useQueryClient();
  
  // Current partner state
  const [currentPartnerId, setCurrentPartnerId] = useState<string | null>(null);
  
  // Fetch current partner
  const { 
    data: currentPartner, 
    isLoading: partnerLoading, 
    error: partnerError 
  } = useQuery({
    queryKey: ['partner', 'current'],
    queryFn: async () => {
      const response = await partnerApi.getCurrentPartner();
      setCurrentPartnerId(response.data.id);
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
  
  // Fetch partner customers
  const { data: customers = [] } = useQuery({
    queryKey: ['partner', 'customers', currentPartnerId],
    queryFn: async () => {
      const response = await partnerApi.getPartnerCustomers(currentPartnerId!);
      return response.data;
    },
    enabled: !!currentPartnerId,
  });
  
  // Fetch partner commissions
  const { data: commissions = [] } = useQuery({
    queryKey: ['partner', 'commissions', currentPartnerId],
    queryFn: async () => {
      const response = await partnerApi.getPartnerCommissions(currentPartnerId!);
      return response.data;
    },
    enabled: !!currentPartnerId,
  });
  
  // Fetch all partners (for super admins)
  const { data: allPartners = [] } = useQuery({
    queryKey: ['admin', 'partners'],
    queryFn: async () => {
      const response = await partnerApi.getAllPartners();
      return response.data;
    },
    enabled: false, // Only fetch when needed
  });
  
  // Mutations
  const updatePartnerMutation = useMutation({
    mutationFn: ({ partnerId, data }: { partnerId: string; data: Partial<Partner> }) =>
      partnerApi.updatePartner(partnerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      toast.success('Partner Updated', 'Partner information updated successfully');
    },
    onError: (error: any) => {
      toast.error('Update Failed', error.response?.data?.detail || 'Failed to update partner');
    },
  });
  
  const updateBrandingMutation = useMutation({
    mutationFn: ({ partnerId, branding }: { partnerId: string; branding: Partial<PartnerBranding> }) =>
      partnerApi.updateBranding(partnerId, branding),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner'] });
      toast.success('Branding Updated', 'Partner branding updated successfully');
    },
    onError: (error: any) => {
      toast.error('Update Failed', error.response?.data?.detail || 'Failed to update branding');
    },
  });
  
  const addCustomerMutation = useMutation({
    mutationFn: ({ customerData }: { customerData: any }) =>
      partnerApi.addCustomer(currentPartnerId!, customerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partner', 'customers'] });
      toast.success('Customer Added', 'Customer added successfully');
    },
    onError: (error: any) => {
      toast.error('Add Failed', error.response?.data?.detail || 'Failed to add customer');
    },
  });
  
  const approvePartnerMutation = useMutation({
    mutationFn: partnerApi.approvePartner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'partners'] });
      toast.success('Partner Approved', 'Partner has been approved successfully');
    },
    onError: (error: any) => {
      toast.error('Approval Failed', error.response?.data?.detail || 'Failed to approve partner');
    },
  });
  
  // Helper functions
  const getPerformanceMetrics = (): PartnerPerformance => {
    return currentPartner?.performance || {
      total_customers: 0,
      active_tenants: 0,
      total_revenue: 0,
      commission_earned: 0,
      monthly_recurring_revenue: 0,
      customer_satisfaction_score: 0,
      last_month_commissions: 0,
      year_to_date_commissions: 0,
      conversion_rate: 0,
      churn_rate: 0,
    };
  };
  
  const getTierBenefits = (): string[] => {
    if (!currentPartner) return [];
    const tier = PARTNER_TIERS.find(t => t.id === currentPartner.tier);
    return tier?.benefits || [];
  };
  
  const canUpgradeTier = (): boolean => {
    if (!currentPartner) return false;
    const currentTierIndex = PARTNER_TIERS.findIndex(t => t.id === currentPartner.tier);
    const nextTier = PARTNER_TIERS[currentTierIndex + 1];
    
    if (!nextTier) return false;
    
    const performance = getPerformanceMetrics();
    const requirements = nextTier.requirements;
    
    return (
      performance.total_customers >= (requirements.min_customers || 0) &&
      performance.total_revenue >= (requirements.min_revenue || 0)
    );
  };
  
  const getBrandingConfig = (): PartnerBranding => {
    return currentPartner?.branding || {
      primary_color: '#3B82F6',
      secondary_color: '#64748B',
      company_name: '',
      support_email: '',
      remove_tidygen_branding: false,
    };
  };
  
  // Context value
  const value: PartnerContextType = {
    currentPartner,
    isLoading: partnerLoading,
    error: partnerError as Error | null,
    
    updatePartner: (data) => updatePartnerMutation.mutateAsync({ partnerId: currentPartnerId!, data }),
    updateBranding: (branding) => updateBrandingMutation.mutateAsync({ partnerId: currentPartnerId!, branding }),
    
    customers,
    addCustomer: (customerData) => addCustomerMutation.mutateAsync({ customerData }),
    updateCustomer: (customerId, data) => partnerApi.updateCustomer(currentPartnerId!, customerId, data),
    removeCustomer: (customerId) => partnerApi.removeCustomer(currentPartnerId!, customerId),
    
    commissions,
    getCommissionReport: async (startDate, endDate) => {
      const response = await partnerApi.getCommissionReport(currentPartnerId!, startDate, endDate);
      return response.data;
    },
    
    getPerformanceMetrics,
    getTierBenefits,
    canUpgradeTier,
    
    isWhiteLabelEnabled: currentPartner?.white_label_enabled || false,
    getBrandingConfig,
    
    isSuperAdmin: false, // This would be determined by user role
    allPartners,
    approvePartner: (partnerId) => approvePartnerMutation.mutateAsync(partnerId),
    suspendPartner: (partnerId) => partnerApi.suspendPartner(partnerId),
    updateCommissionRate: (partnerId, rate) => partnerApi.updateCommissionRate(partnerId, rate),
  };
  
  return (
    <PartnerContext.Provider value={value}>
      {children}
    </PartnerContext.Provider>
  );
}

export function usePartner() {
  const context = useContext(PartnerContext);
  if (context === undefined) {
    throw new Error('usePartner must be used within a PartnerProvider');
  }
  return context;
}

// Export partner tiers for use in other components
export { PARTNER_TIERS };

export default PartnerProvider;
