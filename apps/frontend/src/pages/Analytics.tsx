import { BarChart3, TrendingUp, Target, Users } from "lucide-react";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// Mock analytics data
const performanceData = [
  { name: "Jan", revenue: 18000, expenses: 12000, profit: 6000 },
  { name: "Feb", revenue: 22000, expenses: 14000, profit: 8000 },
  { name: "Mar", revenue: 25000, expenses: 15000, profit: 10000 },
  { name: "Apr", revenue: 28000, expenses: 16000, profit: 12000 },
  { name: "May", revenue: 31000, expenses: 18000, profit: 13000 },
  { name: "Jun", revenue: 29000, expenses: 17000, profit: 12000 },
];

const clientRetentionData = [
  { name: "Q1", value: 88 },
  { name: "Q2", value: 92 },
  { name: "Q3", value: 89 },
  { name: "Q4", value: 94 },
];

const serviceEfficiencyData = [
  { name: "Deep Cleaning", value: 94 },
  { name: "Regular Cleaning", value: 97 },
  { name: "Carpet Cleaning", value: 91 },
  { name: "Window Cleaning", value: 89 },
  { name: "Floor Polishing", value: 93 },
];

const teamPerformanceData = [
  { name: "Team A", completionRate: 96, customerSatisfaction: 94, efficiency: 92 },
  { name: "Team B", completionRate: 94, customerSatisfaction: 91, efficiency: 89 },
  { name: "Team C", completionRate: 98, customerSatisfaction: 96, efficiency: 95 },
  { name: "Team D", completionRate: 92, customerSatisfaction: 88, efficiency: 87 },
];

export default function Analytics() {
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
        <div className="flex gap-2">
          <Select defaultValue="last-6-months">
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Revenue Growth</p>
              <p className="text-2xl font-bold">+23%</p>
              <p className="text-xs text-success">vs last period</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Target className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Service Quality</p>
              <p className="text-2xl font-bold">94.2%</p>
              <p className="text-xs text-success">+2.1% improvement</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Users className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Client Retention</p>
              <p className="text-2xl font-bold">91.8%</p>
              <p className="text-xs text-success">+1.5% increase</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <BarChart3 className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Profit Margin</p>
              <p className="text-2xl font-bold">42.1%</p>
              <p className="text-xs text-success">+3.2% growth</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Financial Performance */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-2">
          <CardHeader>
            <CardTitle>Financial Performance Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis 
                    className="text-xs fill-muted-foreground"
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    name="Revenue"
                    dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="profit"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    name="Profit"
                    dot={{ fill: "hsl(var(--success))", strokeWidth: 2, r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="expenses"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    name="Expenses"
                    dot={{ fill: "hsl(var(--destructive))", strokeWidth: 2, r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Metrics */}
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardChart
          title="Client Retention Rate"
          data={clientRetentionData}
          type="bar"
          dataKey="value"
          color="hsl(var(--success))"
        />
        <DashboardChart
          title="Service Efficiency by Type"
          data={serviceEfficiencyData}
          type="bar"
          dataKey="value"
          color="hsl(var(--accent))"
        />
      </div>

      {/* Team Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {teamPerformanceData.map((team) => (
              <div key={team.name} className="grid grid-cols-4 gap-4 p-4 rounded-lg bg-muted/30">
                <div>
                  <h4 className="font-medium">{team.name}</h4>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Completion Rate</p>
                  <p className="text-lg font-semibold">{team.completionRate}%</p>
                  <Badge variant={team.completionRate >= 95 ? "default" : "secondary"}>
                    {team.completionRate >= 95 ? "Excellent" : "Good"}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                  <p className="text-lg font-semibold">{team.customerSatisfaction}%</p>
                  <Badge variant={team.customerSatisfaction >= 93 ? "default" : "secondary"}>
                    {team.customerSatisfaction >= 93 ? "High" : "Medium"}
                  </Badge>
                </div>
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">Efficiency</p>
                  <p className="text-lg font-semibold">{team.efficiency}%</p>
                  <Badge variant={team.efficiency >= 90 ? "default" : "secondary"}>
                    {team.efficiency >= 90 ? "Optimal" : "Fair"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights and Recommendations */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Key Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Revenue Growth Acceleration</p>
                  <p className="text-sm text-muted-foreground">
                    Monthly revenue increased by 23% compared to the same period last year.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Team C Leading Performance</p>
                  <p className="text-sm text-muted-foreground">
                    Team C shows the highest completion rate and customer satisfaction scores.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-warning mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Service Quality Improvement</p>
                  <p className="text-sm text-muted-foreground">
                    Overall service quality ratings improved by 2.1% this quarter.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recommendations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Expand Team C's Best Practices</p>
                  <p className="text-sm text-muted-foreground">
                    Share Team C's methods with other teams to improve overall performance.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-success mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Focus on Window Cleaning Efficiency</p>
                  <p className="text-sm text-muted-foreground">
                    Window cleaning shows the lowest efficiency. Consider additional training.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div>
                  <p className="font-medium text-sm">Optimize Resource Allocation</p>
                  <p className="text-sm text-muted-foreground">
                    Current profit margins suggest room for operational optimization.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}