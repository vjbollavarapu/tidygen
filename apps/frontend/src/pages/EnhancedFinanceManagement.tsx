import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Upload, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/enhanced-data-table';
import { PageLayout, CardLayout, GridLayout } from '@/components/layout/EnhancedMainLayout';
import { useInvoices, useCreateInvoice, useUpdateInvoice } from '@/hooks/useFinanceApi';
import { useCustomers, useCreateCustomer } from '@/hooks/useFinanceApi';
import { usePayments, useCreatePayment } from '@/hooks/useFinanceApi';
import { useExpenses, useCreateExpense } from '@/hooks/useFinanceApi';
import { InvoiceForm } from '@/components/finance/InvoiceForm';
import { PaymentForm } from '@/components/finance/PaymentForm';
import { ExpenseForm } from '@/components/finance/ExpenseForm';
import { FormModal } from '@/components/ui/enhanced-modal';
import { Invoice, Customer, Payment, Expense } from '@/services/api';
import { ColumnDef } from '@tanstack/react-table';
import { usePermissions } from '@/contexts/EnhancedAuthContext';

export default function EnhancedFinanceManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('invoices');
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { canCreate, canEdit, canDelete } = usePermissions();

  // Data fetching
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({ search: searchTerm });
  const { data: customersData, isLoading: customersLoading } = useCustomers();
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments();
  const { data: expensesData, isLoading: expensesLoading } = useExpenses();

  // Mutations
  const createInvoiceMutation = useCreateInvoice();
  const updateInvoiceMutation = useUpdateInvoice();
  const createCustomerMutation = useCreateCustomer();
  const createPaymentMutation = useCreatePayment();
  const createExpenseMutation = useCreateExpense();

  // Calculate financial metrics
  const totalInvoices = invoicesData?.results?.length || 0;
  const totalRevenue = invoicesData?.results?.reduce((sum, invoice) => sum + invoice.total_amount, 0) || 0;
  const totalPaid = invoicesData?.results?.reduce((sum, invoice) => sum + invoice.paid_amount, 0) || 0;
  const totalOutstanding = totalRevenue - totalPaid;
  const totalExpenses = expensesData?.results?.reduce((sum, expense) => sum + expense.amount, 0) || 0;
  const netProfit = totalPaid - totalExpenses;

  // Invoice columns
  const invoiceColumns: ColumnDef<Invoice>[] = [
    {
      accessorKey: 'invoice_number',
      header: 'Invoice #',
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue('invoice_number')}</div>
      ),
    },
    {
      accessorKey: 'customer_name',
      header: 'Customer',
    },
    {
      accessorKey: 'issue_date',
      header: 'Issue Date',
      cell: ({ row }) => new Date(row.getValue('issue_date')).toLocaleDateString(),
    },
    {
      accessorKey: 'due_date',
      header: 'Due Date',
      cell: ({ row }) => new Date(row.getValue('due_date')).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusColors = {
          DRAFT: 'secondary',
          SENT: 'default',
          PAID: 'success',
          OVERDUE: 'destructive',
          CANCELLED: 'secondary',
        };
        return (
          <Badge variant={statusColors[status as keyof typeof statusColors] || 'secondary'}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Amount',
      cell: ({ row }) => `$${row.getValue('total_amount')}`,
    },
    {
      accessorKey: 'paid_amount',
      header: 'Paid Amount',
      cell: ({ row }) => {
        const paid = row.getValue('paid_amount') as number;
        const total = row.original.total_amount;
        const percentage = total > 0 ? (paid / total) * 100 : 0;
        
        return (
          <div className="flex items-center space-x-2">
            <span>${paid}</span>
            <div className="w-16 bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full" 
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {canEdit('finance') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingItem(row.original);
                setIsInvoiceModalOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {row.original.paid_amount < row.original.total_amount && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingItem(row.original);
                setIsPaymentModalOpen(true);
              }}
            >
              Record Payment
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Customer columns
  const customerColumns: ColumnDef<Customer>[] = [
    {
      accessorKey: 'name',
      header: 'Customer Name',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.getValue('email') || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.getValue('phone') || '-',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
          {row.getValue('is_active') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  // Payment columns
  const paymentColumns: ColumnDef<Payment>[] = [
    {
      accessorKey: 'invoice_number',
      header: 'Invoice #',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `$${row.getValue('amount')}`,
    },
    {
      accessorKey: 'payment_date',
      header: 'Payment Date',
      cell: ({ row }) => new Date(row.getValue('payment_date')).toLocaleDateString(),
    },
    {
      accessorKey: 'payment_method',
      header: 'Method',
      cell: ({ row }) => {
        const method = row.getValue('payment_method') as string;
        return <Badge variant="outline">{method.replace('_', ' ')}</Badge>;
      },
    },
    {
      accessorKey: 'reference_number',
      header: 'Reference',
      cell: ({ row }) => row.getValue('reference_number') || '-',
    },
  ];

  // Expense columns
  const expenseColumns: ColumnDef<Expense>[] = [
    {
      accessorKey: 'category',
      header: 'Category',
    },
    {
      accessorKey: 'description',
      header: 'Description',
    },
    {
      accessorKey: 'amount',
      header: 'Amount',
      cell: ({ row }) => `$${row.getValue('amount')}`,
    },
    {
      accessorKey: 'expense_date',
      header: 'Date',
      cell: ({ row }) => new Date(row.getValue('expense_date')).toLocaleDateString(),
    },
    {
      accessorKey: 'vendor',
      header: 'Vendor',
      cell: ({ row }) => row.getValue('vendor') || '-',
    },
    {
      accessorKey: 'is_billable',
      header: 'Billable',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_billable') ? 'default' : 'secondary'}>
          {row.getValue('is_billable') ? 'Yes' : 'No'}
        </Badge>
      ),
    },
  ];

  const handleInvoiceSubmit = async (data: Partial<Invoice>) => {
    if (editingItem) {
      await updateInvoiceMutation.mutateAsync({ id: editingItem.id, data });
    } else {
      await createInvoiceMutation.mutateAsync(data);
    }
    setIsInvoiceModalOpen(false);
    setEditingItem(null);
  };

  const handlePaymentSubmit = async (data: Partial<Payment>) => {
    await createPaymentMutation.mutateAsync(data);
    setIsPaymentModalOpen(false);
    setEditingItem(null);
  };

  const handleExpenseSubmit = async (data: Partial<Expense>) => {
    await createExpenseMutation.mutateAsync(data);
    setIsExpenseModalOpen(false);
  };

  const actions = (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search finance records..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-64"
        />
      </div>
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
    </div>
  );

  return (
    <PageLayout
      title="Finance Management"
      subtitle="Manage invoices, payments, expenses, and financial reports"
      actions={actions}
    >
      {/* Financial Overview Cards */}
      <GridLayout cols={4} gap="md">
        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
          </div>
        </CardLayout>

        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Outstanding</p>
              <p className="text-2xl font-bold">${totalOutstanding.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-warning" />
            </div>
          </div>
        </CardLayout>

        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
            </div>
            <div className="h-8 w-8 bg-destructive/10 rounded-lg flex items-center justify-center">
              <TrendingDown className="h-4 w-4 text-destructive" />
            </div>
          </div>
        </CardLayout>

        <CardLayout>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Profit</p>
              <p className={`text-2xl font-bold ${netProfit >= 0 ? 'text-success' : 'text-destructive'}`}>
                ${netProfit.toLocaleString()}
              </p>
            </div>
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
              netProfit >= 0 ? 'bg-success/10' : 'bg-destructive/10'
            }`}>
              {netProfit >= 0 ? (
                <TrendingUp className="h-4 w-4 text-success" />
              ) : (
                <TrendingDown className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
        </CardLayout>
      </GridLayout>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices" className="space-y-6">
          <CardLayout
            title="Invoices"
            actions={
              canCreate('finance') && (
                <Button onClick={() => setIsInvoiceModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              )
            }
          >
            <DataTable
              columns={invoiceColumns}
              data={invoicesData?.results || []}
              loading={invoicesLoading}
              searchKey="invoice_number"
              searchPlaceholder="Search invoices..."
              showSearch={false}
              showExport={true}
              onExport={() => console.log('Export invoices')}
            />
          </CardLayout>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <CardLayout
            title="Customers"
            actions={
              canCreate('finance') && (
                <Button onClick={() => console.log('Add customer')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Customer
                </Button>
              )
            }
          >
            <DataTable
              columns={customerColumns}
              data={customersData?.results || []}
              loading={customersLoading}
              searchKey="name"
              searchPlaceholder="Search customers..."
              showSearch={false}
            />
          </CardLayout>
        </TabsContent>

        <TabsContent value="payments" className="space-y-6">
          <CardLayout
            title="Payments"
            actions={
              canCreate('finance') && (
                <Button onClick={() => setIsPaymentModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              )
            }
          >
            <DataTable
              columns={paymentColumns}
              data={paymentsData?.results || []}
              loading={paymentsLoading}
              searchKey="invoice_number"
              searchPlaceholder="Search payments..."
              showSearch={false}
            />
          </CardLayout>
        </TabsContent>

        <TabsContent value="expenses" className="space-y-6">
          <CardLayout
            title="Expenses"
            actions={
              canCreate('finance') && (
                <Button onClick={() => setIsExpenseModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              )
            }
          >
            <DataTable
              columns={expenseColumns}
              data={expensesData?.results || []}
              loading={expensesLoading}
              searchKey="description"
              searchPlaceholder="Search expenses..."
              showSearch={false}
            />
          </CardLayout>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <FormModal
        open={isInvoiceModalOpen}
        onOpenChange={setIsInvoiceModalOpen}
        onSubmit={handleInvoiceSubmit}
        title={editingItem ? 'Edit Invoice' : 'Create Invoice'}
        description={editingItem ? 'Update invoice information' : 'Create a new invoice'}
        loading={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
        size="lg"
      >
        <InvoiceForm
          invoice={editingItem}
          customers={customersData?.results || []}
        />
      </FormModal>

      <FormModal
        open={isPaymentModalOpen}
        onOpenChange={setIsPaymentModalOpen}
        onSubmit={handlePaymentSubmit}
        title="Record Payment"
        description="Record a payment for an invoice"
        loading={createPaymentMutation.isPending}
      >
        <PaymentForm
          invoice={editingItem}
        />
      </FormModal>

      <FormModal
        open={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
        onSubmit={handleExpenseSubmit}
        title="Add Expense"
        description="Record a new expense"
        loading={createExpenseMutation.isPending}
      >
        <ExpenseForm />
      </FormModal>
    </PageLayout>
  );
}
