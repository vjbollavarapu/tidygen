/**
 * Report viewer component for displaying custom reports
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { analyticsService, CustomReport, RevenueAnalytics, ClientAnalytics, OperationalAnalytics, FinancialAnalytics, EmployeeAnalytics, InventoryAnalytics } from "@/services/analyticsService";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { Loader2, Download, Share, Calendar, User, Settings, FileText } from "lucide-react";

interface ReportViewerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: CustomReport | null;
}

export function ReportViewer({ open, onOpenChange, report }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [reportData, setReportData] = useState<any>(null);

  // Fetch report data based on report type
  const { data: revenueResponse, isLoading: revenueLoading } = useQuery({
    queryKey: ['revenueAnalytics', report?.id],
    queryFn: () => report?.report_type === "revenue" ? analyticsService.getRevenueAnalytics() : Promise.resolve({ data: null }),
    enabled: report?.report_type === "revenue"
  });

  const { data: clientResponse, isLoading: clientLoading } = useQuery({
    queryKey: ['clientAnalytics', report?.id],
    queryFn: () => report?.report_type === "operational" ? analyticsService.getClientAnalytics() : Promise.resolve({ data: null }),
    enabled: report?.report_type === "operational"
  });

  const { data: operationalResponse, isLoading: operationalLoading } = useQuery({
    queryKey: ['operationalAnalytics', report?.id],
    queryFn: () => report?.report_type === "operational" ? analyticsService.getOperationalAnalytics() : Promise.resolve({ data: null }),
    enabled: report?.report_type === "operational"
  });

  const { data: financialResponse, isLoading: financialLoading } = useQuery({
    queryKey: ['financialAnalytics', report?.id],
    queryFn: () => report?.report_type === "financial" ? analyticsService.getFinancialAnalytics() : Promise.resolve({ data: null }),
    enabled: report?.report_type === "financial"
  });

  const { data: employeeResponse, isLoading: employeeLoading } = useQuery({
    queryKey: ['employeeAnalytics', report?.id],
    queryFn: () => report?.report_type === "employee" ? analyticsService.getEmployeeAnalytics() : Promise.resolve({ data: null }),
    enabled: report?.report_type === "employee"
  });

  const { data: inventoryResponse, isLoading: inventoryLoading } = useQuery({
    queryKey: ['inventoryAnalytics', report?.id],
    queryFn: () => report?.report_type === "inventory" ? analyticsService.getInventoryAnalytics() : Promise.resolve({ data: null }),
    enabled: report?.report_type === "inventory"
  });

  const revenueData = revenueResponse?.data;
  const clientData = clientResponse?.data;
  const operationalData = operationalResponse?.data;
  const financialData = financialResponse?.data;
  const employeeData = employeeResponse?.data;
  const inventoryData = inventoryResponse?.data;

  // Set report data based on type
  useEffect(() => {
    if (report) {
      switch (report.report_type) {
        case "revenue":
          setReportData(revenueData);
          break;
        case "operational":
          setReportData({ client: clientData, operational: operationalData });
          break;
        case "financial":
          setReportData(financialData);
          break;
        case "employee":
          setReportData(employeeData);
          break;
        case "inventory":
          setReportData(inventoryData);
          break;
        default:
          setReportData(null);
      }
    }
  }, [report, revenueData, clientData, operationalData, financialData, employeeData, inventoryData]);

  const isLoading = revenueLoading || clientLoading || operationalLoading || financialLoading || employeeLoading || inventoryLoading;

  if (!report) return null;

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case "revenue": return "Revenue Analytics";
      case "operational": return "Operational Analytics";
      case "financial": return "Financial Analytics";
      case "employee": return "Employee Analytics";
      case "inventory": return "Inventory Analytics";
      case "custom": return "Custom Report";
      default: return type;
    }
  };

  const renderRevenueReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.total_revenue?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">
                {reportData.revenue_growth > 0 ? '+' : ''}{reportData.revenue_growth?.toFixed(1) || 0}% growth
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Revenue/Client</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.average_revenue_per_client?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Per client</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Period</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.period || 'N/A'}</div>
              <p className="text-xs text-muted-foreground">Reporting period</p>
            </CardContent>
          </Card>
        </div>

        {reportData.revenue_by_service_type && (
          <DashboardChart
            title="Revenue by Service Type"
            data={reportData.revenue_by_service_type.map((item: any) => ({
              name: item.service_type,
              value: item.revenue
            }))}
            type="bar"
            dataKey="value"
            color="hsl(var(--primary))"
          />
        )}

        {reportData.monthly_revenue_trend && (
          <DashboardChart
            title="Monthly Revenue Trend"
            data={reportData.monthly_revenue_trend.map((item: any) => ({
              name: item.month,
              value: item.revenue
            }))}
            type="line"
            dataKey="value"
            color="hsl(var(--success))"
          />
        )}
      </div>
    );
  };

  const renderOperationalReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.operational?.total_appointments || 0}</div>
              <p className="text-xs text-muted-foreground">{reportData.operational?.completed_appointments || 0} completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.operational?.completion_rate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">Appointments completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.operational?.team_utilization?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">Average utilization</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.client?.total_clients || 0}</div>
              <p className="text-xs text-muted-foreground">+{reportData.client?.new_clients_this_month || 0} this month</p>
            </CardContent>
          </Card>
        </div>

        {reportData.operational?.service_efficiency && (
          <DashboardChart
            title="Service Efficiency"
            data={reportData.operational.service_efficiency.map((item: any) => ({
              name: item.service_type,
              value: item.efficiency_score
            }))}
            type="bar"
            dataKey="value"
            color="hsl(var(--success))"
          />
        )}

        {reportData.client?.clients_by_type && (
          <DashboardChart
            title="Client Distribution"
            data={reportData.client.clients_by_type.map((item: any) => ({
              name: item.client_type,
              value: item.count
            }))}
            type="pie"
            dataKey="value"
          />
        )}
      </div>
    );
  };

  const renderFinancialReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.total_revenue?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Total income</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.total_expenses?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Total costs</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.net_profit?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">{reportData.profit_margin?.toFixed(1) || 0}% margin</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.cash_flow?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Available cash</p>
            </CardContent>
          </Card>
        </div>

        {reportData.expense_breakdown && (
          <DashboardChart
            title="Expense Breakdown"
            data={reportData.expense_breakdown.map((item: any) => ({
              name: item.category,
              value: item.amount
            }))}
            type="pie"
            dataKey="value"
          />
        )}

        {reportData.profitability_trend && (
          <DashboardChart
            title="Profitability Trend"
            data={reportData.profitability_trend.map((item: any) => ({
              name: item.month,
              value: item.profit
            }))}
            type="line"
            dataKey="value"
            color="hsl(var(--success))"
          />
        )}
      </div>
    );
  };

  const renderEmployeeReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.total_employees || 0}</div>
              <p className="text-xs text-muted-foreground">{reportData.active_employees || 0} active</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.employee_turnover_rate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">Annual turnover</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Tenure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.average_employee_tenure?.toFixed(1) || 0} months</div>
              <p className="text-xs text-muted-foreground">Average tenure</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.attendance_analytics?.average_attendance_rate?.toFixed(1) || 0}%</div>
              <p className="text-xs text-muted-foreground">Average attendance</p>
            </CardContent>
          </Card>
        </div>

        {reportData.productivity_metrics && (
          <DashboardChart
            title="Employee Productivity"
            data={reportData.productivity_metrics.map((item: any) => ({
              name: item.employee_name,
              value: item.productivity_score
            }))}
            type="bar"
            dataKey="value"
            color="hsl(var(--warning))"
          />
        )}
      </div>
    );
  };

  const renderInventoryReport = () => {
    if (!reportData) return null;

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${reportData.total_inventory_value?.toLocaleString() || 0}</div>
              <p className="text-xs text-muted-foreground">Total value</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Turnover Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.inventory_turnover_rate?.toFixed(1) || 0}x</div>
              <p className="text-xs text-muted-foreground">Annual turnover</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.low_stock_items || 0}</div>
              <p className="text-xs text-muted-foreground">Need restocking</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overstock Items</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{reportData.overstock_items || 0}</div>
              <p className="text-xs text-muted-foreground">Excess inventory</p>
            </CardContent>
          </Card>
        </div>

        {reportData.top_consumed_items && (
          <DashboardChart
            title="Top Consumed Items"
            data={reportData.top_consumed_items.map((item: any) => ({
              name: item.item_name,
              value: item.quantity_used
            }))}
            type="bar"
            dataKey="value"
            color="hsl(var(--info))"
          />
        )}
      </div>
    );
  };

  const renderReportContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading report data...</p>
          </div>
        </div>
      );
    }

    switch (report.report_type) {
      case "revenue":
        return renderRevenueReport();
      case "operational":
        return renderOperationalReport();
      case "financial":
        return renderFinancialReport();
      case "employee":
        return renderEmployeeReport();
      case "inventory":
        return renderInventoryReport();
      default:
        return (
          <div className="text-center py-12 text-muted-foreground">
            <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Custom report content not available</p>
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                {report.name}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {getReportTypeLabel(report.report_type)} • Created by {report.created_by_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={report.is_public ? "default" : "secondary"}>
                {report.is_public ? "Public" : "Private"}
              </Badge>
              {report.schedule && (
                <Badge variant="outline">
                  <Calendar className="h-3 w-3 mr-1" />
                  {report.schedule.frequency}
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="parameters">Parameters</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {renderReportContent()}
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Report Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Created By:</span>
                    <span className="text-sm">{report.created_by_name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Created:</span>
                    <span className="text-sm">{new Date(report.created).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Last Updated:</span>
                    <span className="text-sm">{new Date(report.updated).toLocaleString()}</span>
                  </div>
                  {report.schedule && (
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Next Run:</span>
                      <span className="text-sm">{new Date(report.schedule.next_run).toLocaleString()}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="parameters" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Report Parameters</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(report.parameters || {}).length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(report.parameters || {}).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-2 bg-muted/30 rounded">
                        <span className="text-sm font-medium">{key}:</span>
                        <span className="text-sm">{String(value)}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No parameters configured for this report.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
