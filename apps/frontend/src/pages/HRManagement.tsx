import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Upload, Users, DollarSign, Calendar, Clock, UserCheck, FileText, Star, Edit, Eye, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { hrService, Employee, Attendance, Payroll, PerformanceReview, LeaveRequest, HRSummary } from "@/services/hrService";
import { EmployeeForm } from "@/components/hr/EmployeeForm";
import { AttendanceForm } from "@/components/hr/AttendanceForm";
import { PayrollForm } from "@/components/hr/PayrollForm";
import { PerformanceReviewForm } from "@/components/hr/PerformanceReviewForm";
import { LeaveRequestForm } from "@/components/hr/LeaveRequestForm";
import { EmployeeDetailsModal } from "@/components/hr/EmployeeDetailsModal";

export default function HRManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("employees");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeFormOpen, setIsEmployeeFormOpen] = useState(false);
  const [isAttendanceFormOpen, setIsAttendanceFormOpen] = useState(false);
  const [isPayrollFormOpen, setIsPayrollFormOpen] = useState(false);
  const [isPerformanceReviewFormOpen, setIsPerformanceReviewFormOpen] = useState(false);
  const [isLeaveRequestFormOpen, setIsLeaveRequestFormOpen] = useState(false);
  const [isEmployeeDetailsOpen, setIsEmployeeDetailsOpen] = useState(false);

  // Fetch data from backend
  const { data: hrSummaryResponse, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['hrSummary'],
    queryFn: () => hrService.getHRSummary()
  });

  const { data: employeesResponse, isLoading: employeesLoading, refetch: refetchEmployees } = useQuery({
    queryKey: ['employees', searchTerm],
    queryFn: () => hrService.getEmployees({ search: searchTerm, page_size: 100 })
  });

  const { data: attendanceResponse, isLoading: attendanceLoading, refetch: refetchAttendance } = useQuery({
    queryKey: ['attendance'],
    queryFn: () => hrService.getAttendance({ page_size: 50 })
  });

  const { data: payrollResponse, isLoading: payrollLoading, refetch: refetchPayroll } = useQuery({
    queryKey: ['payroll'],
    queryFn: () => hrService.getPayroll({ page_size: 50 })
  });

  const { data: performanceReviewsResponse, isLoading: reviewsLoading, refetch: refetchReviews } = useQuery({
    queryKey: ['performanceReviews'],
    queryFn: () => hrService.getPerformanceReviews({ page_size: 50 })
  });

  const { data: leaveRequestsResponse, isLoading: leaveLoading, refetch: refetchLeaveRequests } = useQuery({
    queryKey: ['leaveRequests'],
    queryFn: () => hrService.getLeaveRequests({ page_size: 50 })
  });

  const hrSummary = hrSummaryResponse?.data;
  const employees = employeesResponse?.data;
  const attendance = attendanceResponse?.data;
  const payroll = payrollResponse?.data;
  const performanceReviews = performanceReviewsResponse?.data;
  const leaveRequests = leaveRequestsResponse?.data;

  const isLoading = summaryLoading || employeesLoading || attendanceLoading || payrollLoading || reviewsLoading || leaveLoading;

  // Employee columns
  const employeeColumns = [
    {
      key: "name",
      header: "Employee",
      render: (row: Employee) => (
        <div>
          <div className="font-medium">{row.first_name} {row.last_name}</div>
          <div className="text-sm text-muted-foreground">{row.employee_id}</div>
        </div>
      ),
    },
    {
      key: "position",
      header: "Position",
      render: (row: Employee) => (
        <div>
          <div className="font-medium text-sm">{row.position}</div>
          <div className="text-xs text-muted-foreground">{row.department}</div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (row: Employee) => (
        <div>
          <div className="font-medium text-sm">{row.email}</div>
          <div className="text-xs text-muted-foreground">{row.phone}</div>
        </div>
      ),
    },
    {
      key: "employment_type",
      header: "Type",
      render: (row: Employee) => (
        <Badge variant="outline">
          {row.employment_type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Employee) => (
        <Badge variant={
          row.status === 'active' ? 'default' :
          row.status === 'on_leave' ? 'secondary' :
          row.status === 'terminated' ? 'destructive' : 'outline'
        }>
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: "salary",
      header: "Salary",
      render: (row: Employee) => `$${row.salary.toLocaleString()}`,
    },
    {
      key: "hire_date",
      header: "Hire Date",
      render: (row: Employee) => new Date(row.hire_date).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Employee) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedEmployee(row);
              setIsEmployeeDetailsOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedEmployee(row);
              setIsEmployeeFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Attendance columns
  const attendanceColumns = [
    {
      key: "employee_name",
      header: "Employee",
    },
    {
      key: "date",
      header: "Date",
      render: (row: Attendance) => new Date(row.date).toLocaleDateString(),
    },
    {
      key: "check_in_time",
      header: "Check In",
      render: (row: Attendance) => row.check_in_time || "N/A",
    },
    {
      key: "check_out_time",
      header: "Check Out",
      render: (row: Attendance) => row.check_out_time || "N/A",
    },
    {
      key: "total_hours",
      header: "Hours",
      render: (row: Attendance) => row.total_hours ? `${row.total_hours}h` : "N/A",
    },
    {
      key: "status",
      header: "Status",
      render: (row: Attendance) => (
        <Badge variant={
          row.status === 'present' ? 'default' :
          row.status === 'late' ? 'secondary' :
          row.status === 'absent' ? 'destructive' : 'outline'
        }>
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
  ];

  // Payroll columns
  const payrollColumns = [
    {
      key: "employee_name",
      header: "Employee",
    },
    {
      key: "pay_period_start",
      header: "Pay Period",
      render: (row: Payroll) => (
        <div>
          <div className="text-sm">{new Date(row.pay_period_start).toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">to {new Date(row.pay_period_end).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: "gross_salary",
      header: "Gross Pay",
      render: (row: Payroll) => `$${row.gross_salary.toFixed(2)}`,
    },
    {
      key: "deductions",
      header: "Deductions",
      render: (row: Payroll) => `$${row.deductions.toFixed(2)}`,
    },
    {
      key: "net_salary",
      header: "Net Pay",
      render: (row: Payroll) => `$${row.net_salary.toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (row: Payroll) => (
        <Badge variant={
          row.status === 'paid' ? 'default' :
          row.status === 'approved' ? 'secondary' :
          row.status === 'draft' ? 'outline' : 'destructive'
        }>
          {row.status}
        </Badge>
      ),
    },
  ];

  // Performance Review columns
  const performanceReviewColumns = [
    {
      key: "employee_name",
      header: "Employee",
    },
    {
      key: "review_period_start",
      header: "Review Period",
      render: (row: PerformanceReview) => (
        <div>
          <div className="text-sm">{new Date(row.review_period_start).toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">to {new Date(row.review_period_end).toLocaleDateString()}</div>
        </div>
      ),
    },
    {
      key: "overall_rating",
      header: "Rating",
      render: (row: PerformanceReview) => (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="font-medium">{row.overall_rating}/5</span>
        </div>
      ),
    },
    {
      key: "goals_achieved",
      header: "Goals",
      render: (row: PerformanceReview) => `${row.goals_achieved}/${row.goals_total}`,
    },
    {
      key: "status",
      header: "Status",
      render: (row: PerformanceReview) => (
        <Badge variant={
          row.status === 'completed' ? 'default' :
          row.status === 'approved' ? 'secondary' :
          row.status === 'submitted' ? 'outline' : 'secondary'
        }>
          {row.status}
        </Badge>
      ),
    },
  ];

  // Leave Request columns
  const leaveRequestColumns = [
    {
      key: "employee_name",
      header: "Employee",
    },
    {
      key: "leave_type",
      header: "Leave Type",
      render: (row: LeaveRequest) => (
        <Badge variant="outline">
          {row.leave_type.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: "start_date",
      header: "Start Date",
      render: (row: LeaveRequest) => new Date(row.start_date).toLocaleDateString(),
    },
    {
      key: "end_date",
      header: "End Date",
      render: (row: LeaveRequest) => new Date(row.end_date).toLocaleDateString(),
    },
    {
      key: "total_days",
      header: "Days",
      render: (row: LeaveRequest) => `${row.total_days} days`,
    },
    {
      key: "status",
      header: "Status",
      render: (row: LeaveRequest) => (
        <Badge variant={
          row.status === 'approved' ? 'default' :
          row.status === 'pending' ? 'secondary' :
          row.status === 'rejected' ? 'destructive' : 'outline'
        }>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: LeaveRequest) => (
        <div className="flex items-center gap-2">
          {row.status === 'pending' && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Handle approve leave request
                  console.log("Approve leave request:", row.id);
                }}
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // Handle reject leave request
                  console.log("Reject leave request:", row.id);
                }}
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  const handleFormSuccess = () => {
    setIsEmployeeFormOpen(false);
    setIsAttendanceFormOpen(false);
    setIsPayrollFormOpen(false);
    setIsPerformanceReviewFormOpen(false);
    setIsLeaveRequestFormOpen(false);
    setSelectedEmployee(null);
    refetchEmployees();
    refetchAttendance();
    refetchPayroll();
    refetchReviews();
    refetchLeaveRequests();
    refetchSummary();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading HR data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">HR Management</h1>
          <p className="text-muted-foreground">
            Manage employees, attendance, payroll, and performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          {activeTab === "employees" && (
            <Button size="sm" onClick={() => setIsEmployeeFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          )}
          {activeTab === "attendance" && (
            <Button size="sm" onClick={() => setIsAttendanceFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Attendance
            </Button>
          )}
          {activeTab === "payroll" && (
            <Button size="sm" onClick={() => setIsPayrollFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Process Payroll
            </Button>
          )}
          {activeTab === "performance" && (
            <Button size="sm" onClick={() => setIsPerformanceReviewFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Review
            </Button>
          )}
          {activeTab === "leave" && (
            <Button size="sm" onClick={() => setIsLeaveRequestFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Request Leave
            </Button>
          )}
        </div>
      </div>

      {/* HR Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrSummary?.total_employees || 0}</div>
            <p className="text-xs text-muted-foreground">+{hrSummary?.new_employees_this_month || 0} this month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Employees</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrSummary?.active_employees || 0}</div>
            <p className="text-xs text-muted-foreground">Currently active</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrSummary?.attendance_rate?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payroll</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${hrSummary?.total_payroll_cost?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Monthly cost</p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrSummary?.employees_on_leave || 0}</div>
            <p className="text-xs text-muted-foreground">Currently on leave</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrSummary?.pending_leave_requests || 0}</div>
            <p className="text-xs text-muted-foreground">Leave requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reviews Due</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{hrSummary?.performance_reviews_due || 0}</div>
            <p className="text-xs text-muted-foreground">Performance reviews</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="leave">Leave Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search employees..."
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

          {/* Employees Table */}
          <Card>
            <CardHeader>
              <CardTitle>Employee Management</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={employees || []} columns={employeeColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="attendance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Attendance Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={attendance || []} columns={attendanceColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Processing</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={payroll || []} columns={payrollColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Reviews</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={performanceReviews || []} columns={performanceReviewColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leave" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Leave Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={leaveRequests || []} columns={leaveRequestColumns} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <EmployeeForm
        open={isEmployeeFormOpen}
        onOpenChange={setIsEmployeeFormOpen}
        employee={selectedEmployee}
        onSuccess={handleFormSuccess}
      />

      <AttendanceForm
        open={isAttendanceFormOpen}
        onOpenChange={setIsAttendanceFormOpen}
        employee={selectedEmployee}
        onSuccess={handleFormSuccess}
      />

      <PayrollForm
        open={isPayrollFormOpen}
        onOpenChange={setIsPayrollFormOpen}
        employee={selectedEmployee}
        onSuccess={handleFormSuccess}
      />

      <PerformanceReviewForm
        open={isPerformanceReviewFormOpen}
        onOpenChange={setIsPerformanceReviewFormOpen}
        employee={selectedEmployee}
        onSuccess={handleFormSuccess}
      />

      <LeaveRequestForm
        open={isLeaveRequestFormOpen}
        onOpenChange={setIsLeaveRequestFormOpen}
        employee={selectedEmployee}
        onSuccess={handleFormSuccess}
      />

      <EmployeeDetailsModal
        open={isEmployeeDetailsOpen}
        onOpenChange={setIsEmployeeDetailsOpen}
        employee={selectedEmployee}
      />
    </div>
  );
}