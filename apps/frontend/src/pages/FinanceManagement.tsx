import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Upload, DollarSign, FileText, Clock, CheckCircle, XCircle, TrendingUp, TrendingDown, Receipt, CreditCard, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useInvoices, usePayments, useExpenses } from "@/hooks/useFinanceApi";
import { financeService, FinancialSummary, RevenueReport, ExpenseReport } from "@/services/financeService";
import { Invoice, Payment, Expense } from "@/services/api";
import { InvoiceForm } from "@/components/finance/InvoiceForm";
import { PaymentForm } from "@/components/finance/PaymentForm";
import { ExpenseForm } from "@/components/finance/ExpenseForm";
import { InvoiceDetailsModal } from "@/components/finance/InvoiceDetailsModal";
import { FinancialReportsModal } from "@/components/finance/FinancialReportsModal";

export default function FinanceManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("invoices");
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isInvoiceFormOpen, setIsInvoiceFormOpen] = useState(false);
  const [isPaymentFormOpen, setIsPaymentFormOpen] = useState(false);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [isInvoiceDetailsOpen, setIsInvoiceDetailsOpen] = useState(false);
  const [isReportsModalOpen, setIsReportsModalOpen] = useState(false);

  // Fetch data from backend using React Query hooks
  const { data: invoicesData, isLoading: invoicesLoading } = useInvoices({ search: searchTerm });
  const { data: paymentsData, isLoading: paymentsLoading } = usePayments();
  const { data: expensesData, isLoading: expensesLoading } = useExpenses();

  // Extract data from paginated responses
  const invoices = invoicesData?.results || [];
  const payments = paymentsData?.results || [];
  const expenses = expensesData?.results || [];

  // Mock data for reports (to be replaced with actual API calls)
  const financialSummary: FinancialSummary = {
    total_revenue: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
    total_expenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    net_profit: invoices.reduce((sum, inv) => sum + inv.total_amount, 0) - expenses.reduce((sum, exp) => sum + exp.amount, 0),
    outstanding_invoices: invoices.filter(inv => inv.status !== 'PAID').length,
    overdue_invoices: invoices.filter(inv => inv.status === 'OVERDUE').length,
    monthly_revenue: 0,
    monthly_expenses: 0,
    profit_margin: 0,
    average_invoice_amount: 0,
    payment_collection_rate: 0,
  };

  const revenueReport: RevenueReport = {
    period: 'monthly',
    total_revenue: invoices.reduce((sum, inv) => sum + inv.total_amount, 0),
    invoice_count: invoices.length,
    paid_invoices: invoices.filter(inv => inv.status === 'PAID').length,
    outstanding_amount: invoices.filter(inv => inv.status !== 'PAID').reduce((sum, inv) => sum + inv.total_amount, 0),
    breakdown: [],
  };

  const expenseReport: ExpenseReport = {
    period: 'monthly',
    total_expenses: expenses.reduce((sum, exp) => sum + exp.amount, 0),
    expense_count: expenses.length,
    breakdown: [],
  };

  const isLoading = invoicesLoading || paymentsLoading || expensesLoading;

  // Invoice columns
  const invoiceColumns = [
    {
      key: "invoice_number",
      label: "Invoice #",
      render: (row: Invoice) => (
        <div>
          <div className="font-medium">{row.invoice_number}</div>
          <div className="text-sm text-muted-foreground">{row.customer_name}</div>
        </div>
      ),
    },
    {
      key: "issue_date",
      label: "Issue Date",
      render: (row: Invoice) => new Date(row.issue_date).toLocaleDateString(),
    },
    {
      key: "due_date",
      label: "Due Date",
      render: (row: Invoice) => new Date(row.due_date).toLocaleDateString(),
    },
    {
      key: "total_amount",
      label: "Amount",
      render: (row: Invoice) => `$${row.total_amount.toFixed(2)}`,
    },
    {
      key: "status",
      label: "Status",
      render: (row: Invoice) => (
        <Badge variant={
          row.status === 'PAID' ? 'default' :
          row.status === 'SENT' ? 'secondary' :
          row.status === 'OVERDUE' ? 'destructive' :
          row.status === 'CANCELLED' ? 'outline' : 'secondary'
        }>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: Invoice) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedInvoice(row);
              setIsInvoiceDetailsOpen(true);
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedInvoice(row);
              setIsInvoiceFormOpen(true);
            }}
          >
            <CheckCircle className="h-4 w-4" />
          </Button>
          {row.status !== 'PAID' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedInvoice(row);
                setIsPaymentFormOpen(true);
              }}
            >
              <CreditCard className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Payment columns
  const paymentColumns = [
    {
      key: "invoice",
      label: "Invoice",
      render: (row: Payment) => `#${row.invoice}`,
  },
  {
    key: "amount",
    label: "Amount",
      render: (row: Payment) => `$${row.amount.toFixed(2)}`,
    },
    {
      key: "payment_date",
      label: "Payment Date",
      render: (row: Payment) => new Date(row.payment_date).toLocaleDateString(),
    },
    {
      key: "payment_method",
      label: "Method",
      render: (row: Payment) => (
        <Badge variant="outline">
          {row.payment_method.replace('_', ' ')}
      </Badge>
    ),
    },
    {
      key: "reference_number",
      label: "Reference",
  },
];

  // Expense columns
  const expenseColumns = [
  {
    key: "description",
    label: "Description",
  },
  {
    key: "category",
    label: "Category",
      render: (row: Expense) => (
        <Badge variant="outline">
          {row.category}
        </Badge>
      ),
  },
  {
    key: "amount",
    label: "Amount",
      render: (row: Expense) => `$${row.amount.toFixed(2)}`,
  },
  {
      key: "expense_date",
    label: "Date",
      render: (row: Expense) => new Date(row.expense_date).toLocaleDateString(),
  },
  {
    key: "vendor",
    label: "Vendor",
  },
  {
    key: "is_billable",
      label: "Billable",
      render: (row: Expense) => (
        <Badge variant={row.is_billable ? 'default' : 'secondary'}>
          {row.is_billable ? 'Yes' : 'No'}
      </Badge>
    ),
  },
    {
      key: "actions",
      label: "Actions",
      render: (row: Expense) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Handle view expense
              console.log("View expense:", row.id);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
    ),
  },
];

  const handleFormSuccess = () => {
    setIsInvoiceFormOpen(false);
    setIsPaymentFormOpen(false);
    setIsExpenseFormOpen(false);
    setSelectedInvoice(null);
    // Data will be automatically refetched by React Query
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance Management</h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, expenses, and financial reporting
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsReportsModalOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Reports
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          {activeTab === "invoices" && (
            <Button size="sm" onClick={() => setIsInvoiceFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
                Create Invoice
              </Button>
          )}
          {activeTab === "payments" && (
            <Button size="sm" onClick={() => setIsPaymentFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
                </Button>
          )}
          {activeTab === "expenses" && (
            <Button size="sm" onClick={() => setIsExpenseFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Expense
                </Button>
          )}
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary?.total_revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">All time revenue</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary?.outstanding_invoices?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Pending payments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary?.overdue_invoices?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Overdue invoices</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary?.net_profit?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">{financialSummary?.profit_margin?.toFixed(1) || 0}% margin</p>
          </CardContent>
        </Card>
            </div>

      {/* Monthly Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary?.monthly_revenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${financialSummary?.monthly_expenses?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialSummary?.payment_collection_rate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Payment collection</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Invoices Table */}
          <Card>
            <CardHeader>
              <CardTitle>Invoices</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={invoices || []} columns={invoiceColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={payments || []} columns={paymentColumns} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expense Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={expenses || []} columns={expenseColumns} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      {/* Forms are handled by modals - these components are for direct form usage */}
      {/* <InvoiceForm
        invoice={selectedInvoice}
        customers={[]}
        onSubmit={handleFormSuccess}
      />

      <PaymentForm
        invoice={selectedInvoice}
        onSubmit={handleFormSuccess}
      />

      <ExpenseForm
        onSubmit={handleFormSuccess}
      /> */}

      {/* <InvoiceDetailsModal
        open={isInvoiceDetailsOpen}
        onOpenChange={setIsInvoiceDetailsOpen}
        invoice={selectedInvoice}
      /> */}

      <FinancialReportsModal
        open={isReportsModalOpen}
        onOpenChange={setIsReportsModalOpen}
        revenueReport={revenueReport}
        expenseReport={expenseReport}
      />
    </div>
  );
}