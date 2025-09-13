import React, { useState } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  Edit, 
  Trash2, 
  UserPlus,
  Building,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/common/DataTable';
import { usePartner, PartnerCustomer } from '@/contexts/PartnerContext';

export default function ResellerManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<PartnerCustomer | null>(null);

  const { 
    customers, 
    addCustomer, 
    updateCustomer, 
    removeCustomer,
    currentPartner,
    isLoading 
  } = usePartner();

  // Filter customers based on search and status
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.customer_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.company.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || customer.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateCustomer = async (customerData: any) => {
    await addCustomer(customerData);
    setIsCreateModalOpen(false);
  };

  const handleUpdateCustomer = async (customerId: string, data: any) => {
    await updateCustomer(customerId, data);
    setIsDetailsModalOpen(false);
  };

  const handleDeleteCustomer = async (customerId: string) => {
    if (confirm('Are you sure you want to remove this customer?')) {
      await removeCustomer(customerId);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'trial':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'cancelled':
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'trial':
        return 'secondary';
      case 'suspended':
        return 'destructive';
      case 'cancelled':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'enterprise':
        return 'destructive';
      case 'pro':
        return 'default';
      case 'free':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Customer columns
  const customerColumns = [
    {
      key: 'customer_name',
      label: 'Customer',
      render: (customer: PartnerCustomer) => (
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Building className="h-4 w-4 text-primary" />
          </div>
          <div>
            <div className="font-medium">{customer.customer_name}</div>
            <div className="text-sm text-muted-foreground">{customer.company}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'customer_email',
      label: 'Contact',
      render: (customer: PartnerCustomer) => (
        <div>
          <div className="flex items-center space-x-1">
            <Mail className="h-3 w-3 text-muted-foreground" />
            <span className="text-sm">{customer.customer_email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'plan',
      label: 'Plan',
      render: (customer: PartnerCustomer) => (
        <Badge variant={getPlanColor(customer.plan)}>
          {customer.plan.toUpperCase()}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (customer: PartnerCustomer) => (
        <div className="flex items-center space-x-2">
          {getStatusIcon(customer.status)}
          <Badge variant={getStatusColor(customer.status)}>
            {customer.status}
          </Badge>
        </div>
      ),
    },
    {
      key: 'monthly_revenue',
      label: 'Monthly Revenue',
      render: (customer: PartnerCustomer) => (
        <div className="text-right">
          <div className="font-medium">${customer.monthly_revenue.toLocaleString()}</div>
          <div className="text-sm text-muted-foreground">
            {(customer.commission_rate * 100).toFixed(1)}% commission
          </div>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Onboarded',
      render: (customer: PartnerCustomer) => new Date(customer.created_at).toLocaleDateString(),
    },
  ];

  const actions = (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-64"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="trial">Trial</option>
        <option value="suspended">Suspended</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button onClick={() => setIsCreateModalOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Add Customer
      </Button>
    </div>
  );

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Customer Management</h1>
            <p className="text-muted-foreground">Manage your customers and track their usage</p>
          </div>
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
                  <p className="text-2xl font-bold">{customers.length}</p>
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
                  <p className="text-sm font-medium text-muted-foreground">Active Customers</p>
                  <p className="text-2xl font-bold">
                    {customers.filter(c => c.status === 'active').length}
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
                  <p className="text-sm font-medium text-muted-foreground">Trial Customers</p>
                  <p className="text-2xl font-bold">
                    {customers.filter(c => c.status === 'trial').length}
                  </p>
                </div>
                <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Clock className="h-4 w-4 text-warning" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
                  <p className="text-2xl font-bold">
                    ${customers.reduce((sum, c) => sum + c.monthly_revenue, 0).toLocaleString()}
                  </p>
                </div>
                <div className="h-8 w-8 bg-info/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-info" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={customerColumns}
              data={filteredCustomers}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
