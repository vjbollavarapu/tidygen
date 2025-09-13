import { useState } from "react";
import { Plus, FileText, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock invoice data
const invoiceData = [
  {
    id: 1,
    invoiceNumber: "INV-2024-001",
    client: "ABC Corporation",
    amount: 2400.00,
    dueDate: "2024-01-30",
    issueDate: "2024-01-15",
    status: "Paid",
    services: ["Deep Cleaning", "Regular Maintenance"],
    paymentDate: "2024-01-28",
  },
  {
    id: 2,
    invoiceNumber: "INV-2024-002",
    client: "Downtown Restaurant",
    amount: 1800.00,
    dueDate: "2024-02-05",
    issueDate: "2024-01-20",
    status: "Pending",
    services: ["Kitchen Deep Clean", "Dining Area"],
    paymentDate: null,
  },
  {
    id: 3,
    invoiceNumber: "INV-2024-003",
    client: "Johnson Family",
    amount: 480.00,
    dueDate: "2024-01-25",
    issueDate: "2024-01-10",
    status: "Overdue",
    services: ["Weekly House Cleaning"],
    paymentDate: null,
  },
  {
    id: 4,
    invoiceNumber: "INV-2024-004",
    client: "Tech Startup Office",
    amount: 1200.00,
    dueDate: "2024-02-10",
    issueDate: "2024-01-25",
    status: "Draft",
    services: ["Office Cleaning", "Carpet Cleaning"],
    paymentDate: null,
  },
];

// Mock expense data
const expenseData = [
  {
    id: 1,
    description: "Cleaning Supplies Restock",
    category: "Supplies",
    amount: 450.00,
    date: "2024-01-15",
    vendor: "CleanCorp Inc",
    status: "Approved",
  },
  {
    id: 2,
    description: "Vehicle Fuel",
    category: "Transportation",
    amount: 125.00,
    date: "2024-01-18",
    vendor: "Gas Station",
    status: "Approved",
  },
  {
    id: 3,
    description: "Equipment Maintenance",
    category: "Maintenance",
    amount: 300.00,
    date: "2024-01-20",
    vendor: "Equipment Services",
    status: "Pending",
  },
];

const invoiceColumns: Column[] = [
  {
    key: "invoiceNumber",
    label: "Invoice #",
    sortable: true,
    render: (value, row) => (
      <div>
        <div className="font-medium">{value}</div>
        <div className="text-sm text-muted-foreground">{row.client}</div>
      </div>
    ),
  },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
    render: (value) => `$${value.toFixed(2)}`,
  },
  {
    key: "dueDate",
    label: "Due Date",
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge
        variant={
          value === "Paid"
            ? "default"
            : value === "Pending"
            ? "secondary"
            : value === "Overdue"
            ? "destructive"
            : "outline"
        }
      >
        {value}
      </Badge>
    ),
  },
];

const expenseColumns: Column[] = [
  {
    key: "description",
    label: "Description",
    sortable: true,
  },
  {
    key: "category",
    label: "Category",
    sortable: true,
  },
  {
    key: "amount",
    label: "Amount",
    sortable: true,
    render: (value) => `$${value.toFixed(2)}`,
  },
  {
    key: "date",
    label: "Date",
    sortable: true,
    render: (value) => new Date(value).toLocaleDateString(),
  },
  {
    key: "vendor",
    label: "Vendor",
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge variant={value === "Approved" ? "default" : "secondary"}>
        {value}
      </Badge>
    ),
  },
];

export default function FinanceManagement() {
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);

  // Calculate financial stats
  const totalRevenue = invoiceData.filter(inv => inv.status === "Paid").reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoiceData.filter(inv => inv.status === "Pending").reduce((sum, inv) => sum + inv.amount, 0);
  const overdueAmount = invoiceData.filter(inv => inv.status === "Overdue").reduce((sum, inv) => sum + inv.amount, 0);
  const totalExpenses = expenseData.reduce((sum, exp) => sum + exp.amount, 0);

  const handleView = (item: any) => {
    console.log("View item:", item);
  };

  const handleEdit = (item: any) => {
    console.log("Edit item:", item);
  };

  const handleDelete = (item: any) => {
    console.log("Delete item:", item);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Finance & Invoicing</h1>
          <p className="text-muted-foreground">
            Manage invoices, payments, and business finances
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Financial Report
          </Button>
          <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-enterprise">
                <Plus className="h-4 w-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
                <DialogDescription>
                  Generate a new invoice for your cleaning services.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select client" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="abc-corp">ABC Corporation</SelectItem>
                        <SelectItem value="restaurant">Downtown Restaurant</SelectItem>
                        <SelectItem value="johnson">Johnson Family</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input id="dueDate" type="date" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="services">Services</Label>
                  <Textarea id="services" placeholder="List the services provided" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tax">Tax (%)</Label>
                    <Input id="tax" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Additional notes or terms" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsInvoiceDialogOpen(false)}>
                  Create Invoice
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Revenue</p>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pending Payments</p>
              <p className="text-2xl font-bold">${pendingAmount.toFixed(0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-destructive/10 rounded-lg">
              <XCircle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Overdue</p>
              <p className="text-2xl font-bold">${overdueAmount.toFixed(0)}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Expenses</p>
              <p className="text-2xl font-bold">${totalExpenses.toFixed(0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for Invoices and Expenses */}
      <Tabs defaultValue="invoices" className="space-y-4">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Management</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={invoiceData}
                columns={invoiceColumns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Expense Tracking</CardTitle>
              <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Expense
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Expense</DialogTitle>
                    <DialogDescription>
                      Record a new business expense.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="expenseDesc">Description</Label>
                      <Input id="expenseDesc" placeholder="What was this expense for?" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expenseCategory">Category</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="supplies">Supplies</SelectItem>
                            <SelectItem value="transportation">Transportation</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                            <SelectItem value="office">Office</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="expenseAmount">Amount</Label>
                        <Input id="expenseAmount" type="number" step="0.01" placeholder="0.00" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expenseDate">Date</Label>
                        <Input id="expenseDate" type="date" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="vendor">Vendor</Label>
                        <Input id="vendor" placeholder="Who did you pay?" />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsExpenseDialogOpen(false)}>
                      Add Expense
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <DataTable
                data={expenseData}
                columns={expenseColumns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}