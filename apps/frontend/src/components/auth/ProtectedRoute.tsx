import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: React.ReactNode;
}

export function ProtectedRoute({ 
  children, 
  roles = [], 
  permissions = [], 
  fallback 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin mb-4" />
            <p className="text-muted-foreground">Checking authentication...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role-based access
  if (roles.length > 0 && !roles.some(role => hasRole(role))) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have the required role to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check permission-based access
  if (permissions.length > 0 && !permissions.some(permission => hasPermission(permission))) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="flex flex-col items-center justify-center p-8 text-center">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have the required permissions to access this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}

// Specific route components for different access levels
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={['admin', 'superuser']}>
      {children}
    </ProtectedRoute>
  );
}

export function StaffRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute roles={['staff', 'admin', 'superuser']}>
      {children}
    </ProtectedRoute>
  );
}

export function InventoryRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute permissions={['view_inventory']}>
      {children}
    </ProtectedRoute>
  );
}

export function FinanceRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute permissions={['view_finance']}>
      {children}
    </ProtectedRoute>
  );
}

export function HRRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute permissions={['view_hr']}>
      {children}
    </ProtectedRoute>
  );
}

export default ProtectedRoute;