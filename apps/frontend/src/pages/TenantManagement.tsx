import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Settings, Users, Building, Shield, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { useTenant } from '@/contexts/TenantContext';
import { Tenant, CreateTenantData } from '@/contexts/TenantContext';

export default function TenantManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);

  const { 
    allTenants, 
    isSuperAdmin 
  } = useTenant();

  // Filter tenants based on search
  const filteredTenants = allTenants.filter(tenant =>
    tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tenant.owner_id.toString().includes(searchTerm)
  );

  // Tenant columns
  const tenantColumns = [
    {
      key: 'name',
      label: 'Tenant Name',
      render: (tenant: Tenant) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{tenant.name}</div>
            <div className="text-sm text-muted-foreground">{tenant.slug}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (tenant: Tenant) => {
        const planColors = {
          free: 'secondary',
          pro: 'default',
          enterprise: 'destructive',
        };
        return (
          <Badge variant={planColors[tenant.plan as keyof typeof planColors] || 'secondary'}>
            {tenant.plan.toUpperCase()}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      label: 'Status',
      render: (tenant: Tenant) => {
        const statusColors = {
          active: 'success',
          suspended: 'destructive',
          trial: 'warning',
        };
        const statusIcons = {
          active: CheckCircle,
          suspended: XCircle,
          trial: AlertTriangle,
        };
        const Icon = statusIcons[tenant.status as keyof typeof statusIcons] || CheckCircle;
        
        return (
          <div className="flex items-center space-x-2">
            <Icon className="h-4 w-4" />
            <Badge variant={statusColors[tenant.status as keyof typeof statusColors] || 'secondary'}>
              {tenant.status}
            </Badge>
          </div>
        );
      },
    },
    {
      key: 'created_at',
      label: 'Created',
      render: (tenant: Tenant) => new Date(tenant.created_at).toLocaleDateString(),
    },
  ];

  if (!isSuperAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Super Admin Required</h3>
            <p className="text-muted-foreground">
              Only super administrators can access tenant management features.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Tenant Management</h1>
            <p className="text-muted-foreground">Manage multi-tenant organizations, subscriptions, and usage</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Tenant
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Tenants</p>
                  <p className="text-2xl font-bold">{allTenants.length}</p>
                </div>
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Tenants</p>
                  <p className="text-2xl font-bold">
                    {allTenants.filter(t => t.status === 'active').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-4 w-4 text-success" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Enterprise</p>
                  <p className="text-2xl font-bold">
                    {allTenants.filter(t => t.plan === 'enterprise').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center">
                  <Shield className="h-4 w-4 text-destructive" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Suspended</p>
                  <p className="text-2xl font-bold">
                    {allTenants.filter(t => t.status === 'suspended').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tenants Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Tenants</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={tenantColumns}
              data={filteredTenants}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
