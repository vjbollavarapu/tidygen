import React, { useState, useEffect } from 'react';
import { 
  Download, 
  Calendar, 
  Filter, 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Eye,
  FileText,
  BarChart3,
  PieChart,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/enhanced-data-table';
import { PageLayout, CardLayout, GridLayout } from '@/components/layout/EnhancedMainLayout';
import { usePartner, Commission } from '@/contexts/PartnerContext';
import { ColumnDef } from '@tanstack/react-table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Pie, Cell } from 'recharts';

export default function CommissionReports() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<Commission[]>([]);

  const { 
    commissions, 
    getCommissionReport,
    currentPartner,
    isLoading: partnerLoading 
  } = usePartner();

  // Set default date range (last 30 days)
  useEffect(() => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    
    setEndDate(end.toISOString().split('T')[0]);
    setStartDate(start.toISOString().split('T')[0]);
  }, []);

  // Load report data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      loadReportData();
    }
  }, [startDate, endDate]);

  const loadReportData = async () => {
    if (!startDate || !endDate) return;
    
    setIsLoading(true);
    try {
      const data = await getCommissionReport(startDate, endDate);
      setReportData(data);
    } catch (error) {
      console.error('Failed to load commission report:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportReport = () => {
    // Generate CSV export
    const csvContent = generateCSV(reportData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `commission-report-${startDate}-to-${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateCSV = (data: Commission[]) => {
    const headers = ['Date', 'Customer', 'Amount', 'Commission Rate', 'Commission Amount', 'Status'];
    const rows = data.map(commission => [
      new Date(commission.created_at).toLocaleDateString(),
      commission.customer_id,
      commission.amount.toFixed(2),
      (commission.commission_rate * 100).toFixed(1) + '%',
      commission.commission_amount.toFixed(2),
      commission.status
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  // Filter commissions based on status
  const filteredCommissions = reportData.filter(commission => {
    return statusFilter === 'all' || commission.status === statusFilter;
  });

  // Calculate summary statistics
  const totalCommissions = filteredCommissions.reduce((sum, c) => sum + c.commission_amount, 0);
  const totalRevenue = filteredCommissions.reduce((sum, c) => sum + c.amount, 0);
  const averageCommissionRate = filteredCommissions.length > 0 
    ? filteredCommissions.reduce((sum, c) => sum + c.commission_rate, 0) / filteredCommissions.length 
    : 0;

  // Group commissions by month for chart
  const monthlyData = reportData.reduce((acc, commission) => {
    const month = new Date(commission.created_at).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short' 
    });
    
    if (!acc[month]) {
      acc[month] = { month, amount: 0, commission: 0, count: 0 };
    }
    
    acc[month].amount += commission.amount;
    acc[month].commission += commission.commission_amount;
    acc[month].count += 1;
    
    return acc;
  }, {} as Record<string, { month: string; amount: number; commission: number; count: number }>);

  const chartData = Object.values(monthlyData).sort((a, b) => 
    new Date(a.month).getTime() - new Date(b.month).getTime()
  );

  // Status distribution for pie chart
  const statusData = [
    { name: 'Paid', value: filteredCommissions.filter(c => c.status === 'paid').length, color: '#10B981' },
    { name: 'Pending', value: filteredCommissions.filter(c => c.status === 'pending').length, color: '#F59E0B' },
    { name: 'Approved', value: filteredCommissions.filter(c => c.status === 'approved').length, color: '#3B82F6' },
    { name: 'Disputed', value: filteredCommissions.filter(c => c.status === 'disputed').length, color: '#EF4444' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'default';
      case 'approved':
        return 'secondary';
      case 'pending':
        return 'outline';
      case 'disputed':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'approved':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'pending':
        return <RefreshCw className="h-4 w-4 text-yellow-600" />;
      case 'disputed':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600" />;
    }
  };

  // Commission columns
  const commissionColumns: ColumnDef<Commission>[] = [
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('created_at')).toLocaleDateString(),
    },
    {
      accessorKey: 'customer_id',
      header: 'Customer',
      cell: ({ row }) => (
        <div className="font-medium">
          Customer #{row.getValue('customer_id')}
        </div>
      ),
    },
    {
      accessorKey: 'amount',
      header: 'Revenue',
      cell: ({ row }) => (
        <div className="text-right font-medium">
          ${(row.getValue('amount') as number).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'commission_rate',
      header: 'Rate',
      cell: ({ row }) => (
        <div className="text-right">
          {((row.getValue('commission_rate') as number) * 100).toFixed(1)}%
        </div>
      ),
    },
    {
      accessorKey: 'commission_amount',
      header: 'Commission',
      cell: ({ row }) => (
        <div className="text-right font-medium text-green-600">
          ${(row.getValue('commission_amount') as number).toLocaleString()}
        </div>
      ),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <div className="flex items-center space-x-2">
            {getStatusIcon(status)}
            <Badge variant={getStatusColor(status)}>
              {status}
            </Badge>
          </div>
        );
      },
    },
    {
      accessorKey: 'payment_date',
      header: 'Payment Date',
      cell: ({ row }) => {
        const paymentDate = row.getValue('payment_date') as string;
        return paymentDate ? new Date(paymentDate).toLocaleDateString() : '-';
      },
    },
  ];

  const actions = (
    <div className="flex items-center space-x-2">
      <div className="flex items-center space-x-2">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40"
        />
        <span className="text-muted-foreground">to</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40"
        />
      </div>
      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="px-3 py-2 border rounded-md"
      >
        <option value="all">All Status</option>
        <option value="paid">Paid</option>
        <option value="approved">Approved</option>
        <option value="pending">Pending</option>
        <option value="disputed">Disputed</option>
      </select>
      <Button variant="outline" size="sm" onClick={loadReportData} disabled={isLoading}>
        <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
        Refresh
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportReport}>
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );

  if (partnerLoading) {
    return (
      <PageLayout title="Commission Reports" subtitle="Loading commission data...">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title="Commission Reports"
      subtitle="Track your earnings and commission history"
      actions={actions}
    >
      {/* Summary Cards */}
      <GridLayout cols={4} gap="md" className="mb-6">
        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Commissions</p>
              <p className="text-2xl font-bold">${totalCommissions.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-success" />
            </div>
          </div>
        </CardLayout>

        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
          </div>
        </CardLayout>

        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Commission Rate</p>
              <p className="text-2xl font-bold">{(averageCommissionRate * 100).toFixed(1)}%</p>
            </div>
            <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <BarChart3 className="h-4 w-4 text-warning" />
            </div>
          </div>
        </CardLayout>

        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Transactions</p>
              <p className="text-2xl font-bold">{filteredCommissions.length}</p>
            </div>
            <div className="h-8 w-8 bg-info/10 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-info" />
            </div>
          </div>
        </CardLayout>
      </GridLayout>

      {/* Charts */}
      <GridLayout cols={2} gap="lg" className="mb-6">
        <CardLayout title="Commission Trend">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="commission" stroke="#10B981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardLayout>

        <CardLayout title="Status Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <RechartsPieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </RechartsPieChart>
          </ResponsiveContainer>
        </CardLayout>
      </GridLayout>

      {/* Commission Details Table */}
      <CardLayout
        title="Commission Details"
        actions={
          <Button variant="outline" size="sm" onClick={handleExportReport}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
        }
      >
        <DataTable
          columns={commissionColumns}
          data={filteredCommissions}
          searchKey="customer_id"
          searchPlaceholder="Search commissions..."
          showSearch={false}
          showExport={false}
        />
      </CardLayout>

      {/* Commission Summary */}
      <CardLayout title="Commission Summary">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              ${filteredCommissions.filter(c => c.status === 'paid').reduce((sum, c) => sum + c.commission_amount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Paid Commissions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              ${filteredCommissions.filter(c => c.status === 'approved').reduce((sum, c) => sum + c.commission_amount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Approved Commissions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-yellow-600">
              ${filteredCommissions.filter(c => c.status === 'pending').reduce((sum, c) => sum + c.commission_amount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Pending Commissions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              ${filteredCommissions.filter(c => c.status === 'disputed').reduce((sum, c) => sum + c.commission_amount, 0).toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Disputed Commissions</p>
          </div>
        </div>
      </CardLayout>
    </PageLayout>
  );
}
