import React, { useState } from 'react';
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Building, 
  Award, 
  Target,
  Calendar,
  Download,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Star,
  Trophy,
  Zap,
  Shield
} from 'lucide-react';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageLayout, CardLayout, GridLayout } from '@/components/layout/EnhancedMainLayout';
import { usePartner, PARTNER_TIERS } from '@/contexts/PartnerContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

export default function PartnerDashboard() {
  const { 
    currentPartner, 
    customers, 
    commissions, 
    getPerformanceMetrics,
    getTierBenefits,
    canUpgradeTier,
    isLoading 
  } = usePartner();

  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  if (isLoading) {
    return (
      <PageLayout title="Partner Dashboard" subtitle="Loading your partner information...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  if (!currentPartner) {
    return (
      <PageLayout title="Partner Dashboard" subtitle="Partner information not found">
        <CardLayout>
          <div className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Partner Access Required</h3>
            <p className="text-muted-foreground">
              You need to be registered as a partner to access this dashboard.
            </p>
          </div>
        </CardLayout>
      </PageLayout>
    );
  }

  const performance = getPerformanceMetrics();
  const currentTier = PARTNER_TIERS.find(t => t.id === currentPartner.tier);
  const tierBenefits = getTierBenefits();

  // Mock data for charts
  const revenueData = [
    { month: 'Jan', revenue: 12000, commission: 1800 },
    { month: 'Feb', revenue: 15000, commission: 2250 },
    { month: 'Mar', revenue: 18000, commission: 2700 },
    { month: 'Apr', revenue: 22000, commission: 3300 },
    { month: 'May', revenue: 25000, commission: 3750 },
    { month: 'Jun', revenue: 28000, commission: 4200 },
  ];

  const customerData = [
    { name: 'Active', value: performance.total_customers, color: '#10B981' },
    { name: 'Trial', value: customers.filter(c => c.status === 'trial').length, color: '#F59E0B' },
    { name: 'Suspended', value: customers.filter(c => c.status === 'suspended').length, color: '#EF4444' },
  ];

  const commissionData = [
    { month: 'Jan', amount: 1800 },
    { month: 'Feb', amount: 2250 },
    { month: 'Mar', amount: 2700 },
    { month: 'Apr', amount: 3300 },
    { month: 'May', amount: 3750 },
    { month: 'Jun', amount: 4200 },
  ];

  const actions = (
    <div className="flex items-center space-x-2">
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export Report
      </Button>
      <Button variant="outline" size="sm">
        <Calendar className="h-4 w-4 mr-2" />
        {selectedPeriod}
      </Button>
    </div>
  );

  return (
    <PageLayout
      title="Partner Dashboard"
      subtitle={`Welcome back, ${currentPartner.name}`}
      actions={actions}
    >
      {/* Partner Status & Tier */}
      <div className="mb-6">
        <CardLayout>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">{currentPartner.company}</h2>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {currentTier?.icon} {currentTier?.display_name}
                  </Badge>
                  <Badge variant={currentPartner.status === 'active' ? 'default' : 'secondary'}>
                    {currentPartner.status}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Commission Rate</p>
              <p className="text-2xl font-bold">{(currentPartner.commission_rate * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardLayout>
      </div>

      {/* Key Metrics */}
      <GridLayout cols={4} gap="md" className="mb-6">
        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Customers</p>
              <p className="text-2xl font-bold">{performance.total_customers}</p>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +12% from last month
              </p>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardLayout>

        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Monthly Revenue</p>
              <p className="text-2xl font-bold">${performance.monthly_recurring_revenue.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +8% from last month
              </p>
            </div>
            <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
          </div>
        </CardLayout>

        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Commission Earned</p>
              <p className="text-2xl font-bold">${performance.commission_earned.toLocaleString()}</p>
              <p className="text-xs text-green-600 flex items-center">
                <ArrowUpRight className="h-3 w-3 mr-1" />
                +15% from last month
              </p>
            </div>
            <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-warning" />
            </div>
          </div>
        </CardLayout>

        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Satisfaction Score</p>
              <p className="text-2xl font-bold">{performance.customer_satisfaction_score.toFixed(1)}</p>
              <p className="text-xs text-green-600 flex items-center">
                <Star className="h-3 w-3 mr-1" />
                Excellent
              </p>
            </div>
            <div className="h-8 w-8 bg-info/10 rounded-lg flex items-center justify-center">
              <Star className="h-4 w-4 text-info" />
            </div>
          </div>
        </CardLayout>
      </GridLayout>

      {/* Charts and Analytics */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <GridLayout cols={2} gap="lg">
            <CardLayout title="Revenue Trend">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={2} />
                  <Line type="monotone" dataKey="commission" stroke="#10B981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardLayout>

            <CardLayout title="Customer Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={customerData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {customerData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardLayout>
          </GridLayout>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <CardLayout title="Revenue Analytics">
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="revenue" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardLayout>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <GridLayout cols={2} gap="lg">
            <CardLayout title="Recent Customers">
              <div className="space-y-4">
                {customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{customer.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{customer.company}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                        {customer.status}
                      </Badge>
                      <p className="text-sm text-muted-foreground">${customer.monthly_revenue}/mo</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardLayout>

            <CardLayout title="Customer Metrics">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Conversion Rate</span>
                  <span className="font-semibold">{(performance.conversion_rate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Churn Rate</span>
                  <span className="font-semibold">{(performance.churn_rate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Avg. Revenue per Customer</span>
                  <span className="font-semibold">
                    ${performance.total_customers > 0 ? (performance.total_revenue / performance.total_customers).toFixed(0) : 0}
                  </span>
                </div>
              </div>
            </CardLayout>
          </GridLayout>
        </TabsContent>

        <TabsContent value="commissions" className="space-y-6">
          <CardLayout title="Commission History">
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={commissionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={3} />
              </LineChart>
            </ResponsiveContainer>
          </CardLayout>
        </TabsContent>
      </Tabs>

      {/* Tier Benefits & Upgrade */}
      {canUpgradeTier() && (
        <CardLayout title="Tier Upgrade Available" className="border-warning">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-warning">Ready for the next tier?</h3>
              <p className="text-sm text-muted-foreground">
                You've met the requirements for a tier upgrade. Contact your account manager to upgrade.
              </p>
            </div>
            <Button variant="outline" className="border-warning text-warning">
              <Trophy className="h-4 w-4 mr-2" />
              Upgrade Tier
            </Button>
          </div>
        </CardLayout>
      )}

      {/* Current Tier Benefits */}
      <CardLayout title={`${currentTier?.display_name} Benefits`}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {tierBenefits.map((benefit, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div className="h-2 w-2 bg-primary rounded-full"></div>
              <span className="text-sm">{benefit}</span>
            </div>
          ))}
        </div>
      </CardLayout>
    </PageLayout>
  );
}
