import { useState } from "react";
import { Plus, Users, DollarSign, Calendar, Clock } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Mock employee data
const employeeData = [
  {
    id: 1,
    name: "Sarah Johnson",
    position: "Team Leader",
    department: "Operations",
    email: "sarah.j@ineat.com",
    phone: "+1 (555) 123-4567",
    hireDate: "2023-03-15",
    salary: 45000,
    status: "Active",
    hoursThisWeek: 40,
    team: "Team A",
  },
  {
    id: 2,
    name: "Mike Rodriguez",
    position: "Cleaner",
    department: "Operations",
    email: "mike.r@ineat.com",
    phone: "+1 (555) 234-5678",
    hireDate: "2023-06-20",
    salary: 32000,
    status: "Active",
    hoursThisWeek: 38,
    team: "Team A",
  },
  {
    id: 3,
    name: "Lisa Chen",
    position: "Quality Inspector",
    department: "Quality Control",
    email: "lisa.c@ineat.com",
    phone: "+1 (555) 345-6789",
    hireDate: "2023-01-10",
    salary: 40000,
    status: "Active",
    hoursThisWeek: 40,
    team: "QC Team",
  },
  {
    id: 4,
    name: "David Wilson",
    position: "Driver",
    department: "Transportation",
    email: "david.w@ineat.com",
    phone: "+1 (555) 456-7890",
    hireDate: "2023-08-05",
    salary: 35000,
    status: "On Leave",
    hoursThisWeek: 0,
    team: "Transport",
  },
];

// Mock payroll data
const payrollData = [
  {
    id: 1,
    employeeName: "Sarah Johnson",
    period: "2024-01-01 to 2024-01-15",
    hoursWorked: 80,
    hourlyRate: 21.63,
    grossPay: 1730.40,
    deductions: 346.08,
    netPay: 1384.32,
    status: "Processed",
  },
  {
    id: 2,
    employeeName: "Mike Rodriguez",
    period: "2024-01-01 to 2024-01-15",
    hoursWorked: 76,
    hourlyRate: 15.38,
    grossPay: 1168.88,
    deductions: 233.78,
    netPay: 935.10,
    status: "Processed",
  },
  {
    id: 3,
    employeeName: "Lisa Chen",
    period: "2024-01-01 to 2024-01-15",
    hoursWorked: 80,
    hourlyRate: 19.23,
    grossPay: 1538.40,
    deductions: 307.68,
    netPay: 1230.72,
    status: "Pending",
  },
];

const employeeColumns: Column[] = [
  {
    key: "name",
    label: "Employee",
    sortable: true,
    render: (value, row) => (
      <div>
        <div className="font-medium">{value}</div>
        <div className="text-sm text-muted-foreground">{row.position}</div>
      </div>
    ),
  },
  {
    key: "department",
    label: "Department",
    sortable: true,
  },
  {
    key: "email",
    label: "Contact",
    render: (value, row) => (
      <div>
        <div className="text-sm">{value}</div>
        <div className="text-xs text-muted-foreground">{row.phone}</div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge
        variant={
          value === "Active"
            ? "default"
            : value === "On Leave"
            ? "secondary"
            : "outline"
        }
      >
        {value}
      </Badge>
    ),
  },
  {
    key: "hoursThisWeek",
    label: "Hours This Week",
    sortable: true,
  },
  {
    key: "salary",
    label: "Annual Salary",
    sortable: true,
    render: (value) => `$${value.toLocaleString()}`,
  },
];

const payrollColumns: Column[] = [
  {
    key: "employeeName",
    label: "Employee",
    sortable: true,
  },
  {
    key: "period",
    label: "Pay Period",
    sortable: true,
  },
  {
    key: "hoursWorked",
    label: "Hours",
    sortable: true,
  },
  {
    key: "grossPay",
    label: "Gross Pay",
    sortable: true,
    render: (value) => `$${value.toFixed(2)}`,
  },
  {
    key: "netPay",
    label: "Net Pay",
    sortable: true,
    render: (value) => `$${value.toFixed(2)}`,
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge variant={value === "Processed" ? "default" : "secondary"}>
        {value}
      </Badge>
    ),
  },
];

export default function HRManagement() {
  const [isEmployeeDialogOpen, setIsEmployeeDialogOpen] = useState(false);

  // Calculate HR stats
  const totalEmployees = employeeData.length;
  const activeEmployees = employeeData.filter(emp => emp.status === "Active").length;
  const totalHoursThisWeek = employeeData.reduce((sum, emp) => sum + emp.hoursThisWeek, 0);
  const totalPayroll = payrollData.reduce((sum, pay) => sum + pay.netPay, 0);

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
          <h1 className="text-3xl font-bold text-foreground">HR & Payroll</h1>
          <p className="text-muted-foreground">
            Manage employees, attendance, and payroll processing
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Generate Report
          </Button>
          <Dialog open={isEmployeeDialogOpen} onOpenChange={setIsEmployeeDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-enterprise">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>
                  Add a new employee to your team.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="employeeName">Full Name</Label>
                    <Input id="employeeName" placeholder="Enter employee name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="position">Position</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select position" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="team-leader">Team Leader</SelectItem>
                        <SelectItem value="cleaner">Cleaner</SelectItem>
                        <SelectItem value="driver">Driver</SelectItem>
                        <SelectItem value="inspector">Quality Inspector</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="operations">Operations</SelectItem>
                        <SelectItem value="quality-control">Quality Control</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="administration">Administration</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="team">Team</Label>
                    <Input id="team" placeholder="e.g., Team A" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="employee@ineat.com" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input id="phone" placeholder="+1 (555) 123-4567" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hireDate">Hire Date</Label>
                    <Input id="hireDate" type="date" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="salary">Annual Salary</Label>
                    <Input id="salary" type="number" placeholder="35000" />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsEmployeeDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsEmployeeDialogOpen(false)}>
                  Add Employee
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
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Employees</p>
              <p className="text-2xl font-bold">{totalEmployees}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Employees</p>
              <p className="text-2xl font-bold">{activeEmployees}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Clock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Hours This Week</p>
              <p className="text-2xl font-bold">{totalHoursThisWeek}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <DollarSign className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Payroll</p>
              <p className="text-2xl font-bold">${totalPayroll.toFixed(0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs for Employees and Payroll */}
      <Tabs defaultValue="employees" className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="employees">
          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable
                data={employeeData}
                columns={employeeColumns}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                searchable
                filterable
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="payroll">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Payroll Processing</CardTitle>
              <Button variant="outline">
                <Calendar className="h-4 w-4 mr-2" />
                Process Payroll
              </Button>
            </CardHeader>
            <CardContent>
              <DataTable
                data={payrollData}
                columns={payrollColumns}
                onView={handleView}
                onEdit={handleEdit}
                searchable
                filterable
                actions={false}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attendance">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Attendance tracking feature coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}