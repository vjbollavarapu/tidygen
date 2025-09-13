/**
 * Financial reports modal component for viewing comprehensive financial reports
 */

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RevenueReport, ExpenseReport } from "@/services/financeService";
import { DollarSign, TrendingUp, TrendingDown, FileText, Download, BarChart3 } from "lucide-react";

interface FinancialReportsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  revenueReport?: RevenueReport;
  expenseReport?: ExpenseReport;
}

export function FinancialReportsModal({ open, onOpenChange, revenueReport, expenseReport }: FinancialReportsModalProps) {
  const [activeTab, setActiveTab] = useState("revenue");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Financial Reports
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="revenue">Revenue Report</TabsTrigger>
            <TabsTrigger value="expenses">Expense Report</TabsTrigger>
            <TabsTrigger value="summary">Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="revenue" className="space-y-4">
            {revenueReport ? (
              <>
                {/* Revenue Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue Overview - {revenueReport.period}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold">${revenueReport.total_revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{revenueReport.invoice_count}</div>
                        <div className="text-sm text-muted-foreground">Total Invoices</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{revenueReport.paid_invoices}</div>
                        <div className="text-sm text-muted-foreground">Paid Invoices</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">${revenueReport.outstanding_amount.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Outstanding</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Service Type Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Revenue by Service Type</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {revenueReport.breakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              <DollarSign className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium">{item.service_type}</p>
                              <p className="text-sm text-muted-foreground">{item.count} invoices</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {((item.amount / revenueReport.total_revenue) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No revenue data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="expenses" className="space-y-4">
            {expenseReport ? (
              <>
                {/* Expense Overview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Expense Overview - {expenseReport.period}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="text-center">
                        <div className="text-2xl font-bold">${expenseReport.total_expenses.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Expenses</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold">{expenseReport.expense_count}</div>
                        <div className="text-sm text-muted-foreground">Total Expenses</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Category Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Expenses by Category</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {expenseReport.breakdown.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-destructive/10 rounded-lg">
                              <TrendingDown className="h-4 w-4 text-destructive" />
                            </div>
                            <div>
                              <p className="font-medium">{item.category}</p>
                              <p className="text-sm text-muted-foreground">{item.count} expenses</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${item.amount.toLocaleString()}</p>
                            <p className="text-sm text-muted-foreground">
                              {((item.amount / expenseReport.total_expenses) * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No expense data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="summary" className="space-y-4">
            {revenueReport && expenseReport ? (
              <>
                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Financial Summary - {revenueReport.period}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="text-center p-4 bg-success/10 rounded-lg">
                        <TrendingUp className="h-8 w-8 text-success mx-auto mb-2" />
                        <div className="text-2xl font-bold text-success">${revenueReport.total_revenue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Revenue</div>
                      </div>
                      <div className="text-center p-4 bg-destructive/10 rounded-lg">
                        <TrendingDown className="h-8 w-8 text-destructive mx-auto mb-2" />
                        <div className="text-2xl font-bold text-destructive">${expenseReport.total_expenses.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Total Expenses</div>
                      </div>
                      <div className="text-center p-4 bg-primary/10 rounded-lg">
                        <DollarSign className="h-8 w-8 text-primary mx-auto mb-2" />
                        <div className="text-2xl font-bold text-primary">
                          ${(revenueReport.total_revenue - expenseReport.total_expenses).toLocaleString()}
                        </div>
                        <div className="text-sm text-muted-foreground">Net Profit</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Key Metrics */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Key Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Profit Margin</span>
                          <Badge variant="outline">
                            {(((revenueReport.total_revenue - expenseReport.total_expenses) / revenueReport.total_revenue) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Average Invoice Amount</span>
                          <span className="text-sm">${(revenueReport.total_revenue / revenueReport.invoice_count).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Payment Collection Rate</span>
                          <Badge variant="outline">
                            {((revenueReport.paid_invoices / revenueReport.invoice_count) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Outstanding Amount</span>
                          <span className="text-sm">${revenueReport.outstanding_amount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Average Expense Amount</span>
                          <span className="text-sm">${(expenseReport.total_expenses / expenseReport.expense_count).toFixed(2)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Expense Ratio</span>
                          <Badge variant="outline">
                            {((expenseReport.total_expenses / revenueReport.total_revenue) * 100).toFixed(1)}%
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            ) : (
              <Card>
                <CardContent className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No financial data available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
