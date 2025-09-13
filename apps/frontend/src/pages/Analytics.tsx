import { useState, useEffect } from "react";
import { Plus, Download, Filter, Calendar, TrendingUp, Users, DollarSign, Target, BarChart3, PieChart, Activity, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { analyticsService, RevenueAnalytics, ClientAnalytics, OperationalAnalytics, FinancialAnalytics, EmployeeAnalytics, InventoryAnalytics, KPIDashboard, CustomReport } from "@/services/analyticsService";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { CustomReportForm } from "@/components/analytics/CustomReportForm";
import { ReportViewer } from "@/components/analytics/ReportViewer";

export default function Analytics() {
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedPeriod, setSelectedPeriod] = useState("monthly");
  const [isCustomReportFormOpen, setIsCustomReportFormOpen] = useState(false);
  const [isReportViewerOpen, setIsReportViewerOpen] = useState(false);
  const [selectedReport, setSelectedReport] = useState<CustomReport | null>(null);

  // Fetch analytics data
  const { data: kpiDashboard, loading: kpiLoading, refetch: refetchKPI } = useApi<KPIDashboard>(
    () => analyticsService.getKPIDashboard()
  );

  const { data: revenueAnalytics, loading: revenueLoading, refetch: refetchRevenue } = useApi<RevenueAnalytics>(
    () => analyticsService.getRevenueAnalytics({ period: selectedPeriod as any })
  );

  const { data: clientAnalytics, loading: clientLoading, refetch: refetchClient } = useApi<ClientAnalytics>(
    () => analyticsService.getClientAnalytics({ period: selectedPeriod as any })
  );

  const { data: operationalAnalytics, loading: operationalLoading, refetch: refetchOperational } = useApi<OperationalAnalytics>(
    () => analyticsService.getOperationalAnalytics({ period: selectedPeriod as any })
  );

  const { data: financialAnalytics, loading: financialLoading, refetch: refetchFinancial } = useApi<FinancialAnalytics>(
    () => analyticsService.getFinancialAnalytics({ period: selectedPeriod as any })
  );

  const { data: employeeAnalytics, loading: employeeLoading, refetch: refetchEmployee } = useApi<EmployeeAnalytics>(
    () => analyticsService.getEmployeeAnalytics({ period: selectedPeriod as any })
  );

  const { data: inventoryAnalytics, loading: inventoryLoading, refetch: refetchInventory } = useApi<InventoryAnalytics>(
    () => analyticsService.getInventoryAnalytics({ period: selectedPeriod as any })
  );

  const { data: customReports, loading: reportsLoading, refetch: refetchReports } = useApi<CustomReport[]>(
    () => analyticsService.getCustomReports({ page_size: 100 })
  );

  const isLoading = kpiLoading || revenueLoading || clientLoading || operationalLoading || financialLoading || employeeLoading || inventoryLoading || reportsLoading;

  // Custom Report columns
  const customReportColumns = [
    {
      key: "name",
      header: "Report Name",
    },
    {
      key: "description",
      header: "Description",
    },
    {
      key: "report_type",
      header: "Type",
      render: (row: CustomReport) => (
        <Badge variant="outline">
          {row.report_type}
        </Badge>
      ),
    },
    {
      key: "is_public",
      header: "Visibility",
      render: (row: CustomReport) => (
        <Badge variant={row.is_public ? "default" : "secondary"}>
          {row.is_public ? "Public" : "Private"}
        </Badge>
      ),
    },
    {
      key: "created_by_name",
      header: "Created By",
    },
    {
      key: "created",
      header: "Created",
      render: (row: CustomReport) => new Date(row.created).toLocaleDateString(),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: CustomReport) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedReport(row);
              setIsReportViewerOpen(true);
            }}
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              // Handle edit report
              console.log("Edit report:", row.id);
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const handleFormSuccess = () => {
    setIsCustomReportFormOpen(false);
    refetchReports();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics & Reports</h1>
          <p className="text-muted-foreground">
            Business intelligence and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
              <SelectItem value="quarterly">Quarterly</SelectItem>
              <SelectItem value="yearly">Yearly</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {activeTab === "reports" && (
            <Button size="sm" onClick={() => setIsCustomReportFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Report
            </Button>
          )}
        </div>
      </div>

      {/* KPI Dashboard */}
      {kpiDashboard && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpiDashboard.revenue_kpis.monthly_revenue.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {kpiDashboard.revenue_kpis.revenue_growth > 0 ? '+' : ''}{kpiDashboard.revenue_kpis.revenue_growth.toFixed(1)}% growth
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiDashboard.operational_kpis.appointment_completion_rate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Appointments completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Client Satisfaction</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiDashboard.operational_kpis.client_satisfaction.toFixed(1)}/5</div>
              <p className="text-xs text-muted-foreground">Average rating</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profit Margin</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{kpiDashboard.financial_kpis.profit_margin.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Net profit margin</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="financial">Financial</TabsTrigger>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="reports">Custom Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {revenueAnalytics && (
              <DashboardChart
                title="Revenue Trend"
                data={revenueAnalytics.monthly_revenue_trend.map(item => ({
                  name: item.month,
                  value: item.revenue,
                  growth: item.growth
                }))}
                type="line"
                dataKey="value"
                color="hsl(var(--primary))"
              />
            )}
            {clientAnalytics && (
              <DashboardChart
                title="Client Distribution"
                data={clientAnalytics.clients_by_type.map(item => ({
                  name: item.client_type,
                  value: item.count
                }))}
                type="pie"
                dataKey="value"
              />
            )}
          </div>
          
          {operationalAnalytics && (
            <DashboardChart
              title="Service Efficiency"
              data={operationalAnalytics.service_efficiency.map(item => ({
                name: item.service_type,
                value: item.efficiency_score
              }))}
              type="bar"
              dataKey="value"
              color="hsl(var(--success))"
            />
          )}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          {revenueAnalytics && (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${revenueAnalytics.total_revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">
                      {revenueAnalytics.revenue_growth > 0 ? '+' : ''}{revenueAnalytics.revenue_growth.toFixed(1)}% growth
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Revenue/Client</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${revenueAnalytics.average_revenue_per_client.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Per client</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Top Client Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${revenueAnalytics.top_clients[0]?.revenue.toLocaleString() || 0}</div>
                    <p className="text-xs text-muted-foreground">{revenueAnalytics.top_clients[0]?.client_name || 'N/A'}</p>
                  </CardContent>
                </Card>
              </div>

              <DashboardChart
                title="Revenue by Service Type"
                data={revenueAnalytics.revenue_by_service_type.map(item => ({
                  name: item.service_type,
                  value: item.revenue
                }))}
                type="bar"
                dataKey="value"
                color="hsl(var(--primary))"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="clients" className="space-y-4">
          {clientAnalytics && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientAnalytics.total_clients}</div>
                    <p className="text-xs text-muted-foreground">+{clientAnalytics.new_clients_this_month} this month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientAnalytics.client_retention_rate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Client retention</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Lifetime Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${clientAnalytics.average_client_lifetime_value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Per client</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Satisfaction Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{clientAnalytics.client_satisfaction_score.toFixed(1)}/5</div>
                    <p className="text-xs text-muted-foreground">Average rating</p>
                  </CardContent>
                </Card>
              </div>

              <DashboardChart
                title="Client Acquisition Trend"
                data={clientAnalytics.client_acquisition_trend.map(item => ({
                  name: item.month,
                  value: item.new_clients
                }))}
                type="line"
                dataKey="value"
                color="hsl(var(--success))"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          {operationalAnalytics && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{operationalAnalytics.total_appointments}</div>
                    <p className="text-xs text-muted-foreground">{operationalAnalytics.completed_appointments} completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{operationalAnalytics.completion_rate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Appointments completed</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{operationalAnalytics.team_utilization.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Average utilization</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{operationalAnalytics.average_appointment_duration} min</div>
                    <p className="text-xs text-muted-foreground">Per appointment</p>
                  </CardContent>
                </Card>
              </div>

              <DashboardChart
                title="Team Performance"
                data={operationalAnalytics.team_performance.map(item => ({
                  name: item.team_name,
                  value: item.utilization_rate
                }))}
                type="bar"
                dataKey="value"
                color="hsl(var(--accent))"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="financial" className="space-y-4">
          {financialAnalytics && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${financialAnalytics.total_revenue.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total income</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${financialAnalytics.total_expenses.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total costs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${financialAnalytics.net_profit.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">{financialAnalytics.profit_margin.toFixed(1)}% margin</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${financialAnalytics.cash_flow.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Available cash</p>
                  </CardContent>
                </Card>
              </div>

              <DashboardChart
                title="Expense Breakdown"
                data={financialAnalytics.expense_breakdown.map(item => ({
                  name: item.category,
                  value: item.amount
                }))}
                type="pie"
                dataKey="value"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="employees" className="space-y-4">
          {employeeAnalytics && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{employeeAnalytics.total_employees}</div>
                    <p className="text-xs text-muted-foreground">{employeeAnalytics.active_employees} active</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{employeeAnalytics.employee_turnover_rate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Annual turnover</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg Tenure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{employeeAnalytics.average_employee_tenure.toFixed(1)} months</div>
                    <p className="text-xs text-muted-foreground">Average tenure</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{employeeAnalytics.attendance_analytics.average_attendance_rate.toFixed(1)}%</div>
                    <p className="text-xs text-muted-foreground">Average attendance</p>
                  </CardContent>
                </Card>
              </div>

              <DashboardChart
                title="Employee Productivity"
                data={employeeAnalytics.productivity_metrics.map(item => ({
                  name: item.employee_name,
                  value: item.productivity_score
                }))}
                type="bar"
                dataKey="value"
                color="hsl(var(--warning))"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="inventory" className="space-y-4">
          {inventoryAnalytics && (
            <>
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${inventoryAnalytics.total_inventory_value.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Total value</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inventoryAnalytics.inventory_turnover_rate.toFixed(1)}x</div>
                    <p className="text-xs text-muted-foreground">Annual turnover</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inventoryAnalytics.low_stock_items}</div>
                    <p className="text-xs text-muted-foreground">Need restocking</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Overstock Items</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{inventoryAnalytics.overstock_items}</div>
                    <p className="text-xs text-muted-foreground">Excess inventory</p>
                  </CardContent>
                </Card>
              </div>

              <DashboardChart
                title="Top Consumed Items"
                data={inventoryAnalytics.top_consumed_items.map(item => ({
                  name: item.item_name,
                  value: item.quantity_used
                }))}
                type="bar"
                dataKey="value"
                color="hsl(var(--info))"
              />
            </>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={customReports || []} columns={customReportColumns} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <CustomReportForm
        open={isCustomReportFormOpen}
        onOpenChange={setIsCustomReportFormOpen}
        onSuccess={handleFormSuccess}
      />

      <ReportViewer
        open={isReportViewerOpen}
        onOpenChange={setIsReportViewerOpen}
        report={selectedReport}
      />
    </div>
  );
}