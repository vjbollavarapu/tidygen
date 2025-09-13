import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCurrentUser, useLogin, useLogout } from '@/hooks/useApi';
import { User, LoginCredentials } from '@/services/api';
import { toast } from '@/components/ui/enhanced-notifications';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function EnhancedAuthProvider({ children }: AuthProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  const { data: user, isLoading: userLoading, error: userError } = useCurrentUser();
  const loginMutation = useLogin();
  const logoutMutation = useLogout();

  const isAuthenticated = !!user && !userError;
  const isLoading = userLoading || !isInitialized;

  // Initialize auth state
  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setIsInitialized(true);
    }
  }, []);

  // Handle user data changes
  useEffect(() => {
    if (user || userError) {
      setIsInitialized(true);
    }
  }, [user, userError]);

  // Handle authentication errors
  useEffect(() => {
    if (userError && userError.status === 401) {
      // Token is invalid, redirect to login
      navigate('/login', { 
        state: { from: location },
        replace: true 
      });
    }
  }, [userError, navigate, location]);

  const login = async (credentials: LoginCredentials) => {
    try {
      await loginMutation.mutateAsync(credentials);
      // Navigation will be handled by the login mutation success callback
    } catch (error) {
      // Error is already handled by the mutation
      throw error;
    }
  };

  const logout = async () => {
    try {
      await logoutMutation.mutateAsync();
      navigate('/login', { replace: true });
    } catch (error) {
      // Even if logout fails on server, clear local state
      navigate('/login', { replace: true });
    }
  };

  const hasRole = (role: string): boolean => {
    if (!user) return false;
    
    // Check if user has the specified role
    // This would need to be implemented based on your role system
    return user.is_staff || user.is_superuser || false;
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Superusers have all permissions
    if (user.is_superuser) return true;
    
    // Staff users have most permissions
    if (user.is_staff) return true;
    
    // Regular users have limited permissions
    const userPermissions = [
      'view_own_profile',
      'edit_own_profile',
      'view_inventory',
      'view_finance',
    ];
    
    return userPermissions.includes(permission);
  };

  const value: AuthContextType = {
    user: user || null,
    isAuthenticated,
    isLoading,
    login,
    logout,
    hasRole,
    hasPermission,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for role-based access
interface WithRoleProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: React.ReactNode;
}

export function WithRole({ children, roles = [], permissions = [], fallback = null }: WithRoleProps) {
  const { isAuthenticated, hasRole, hasPermission } = useAuth();

  if (!isAuthenticated) {
    return <>{fallback}</>;
  }

  // Check roles
  if (roles.length > 0 && !roles.some(role => hasRole(role))) {
    return <>{fallback}</>;
  }

  // Check permissions
  if (permissions.length > 0 && !permissions.some(permission => hasPermission(permission))) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Hook for checking specific permissions
export function usePermissions() {
  const { hasPermission, hasRole } = useAuth();

  return {
    canView: (resource: string) => hasPermission(`view_${resource}`),
    canCreate: (resource: string) => hasPermission(`add_${resource}`),
    canEdit: (resource: string) => hasPermission(`change_${resource}`),
    canDelete: (resource: string) => hasPermission(`delete_${resource}`),
    hasRole,
    hasPermission,
  };
}

export default EnhancedAuthProvider;
