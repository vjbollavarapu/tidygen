import {
  Users,
  Calendar,
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
} from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
import { DashboardChart } from "@/components/dashboard/DashboardChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Mock data for charts
const revenueData = [
  { name: "Jan", value: 4000 },
  { name: "Feb", value: 3000 },
  { name: "Mar", value: 5000 },
  { name: "Apr", value: 4500 },
  { name: "May", value: 6000 },
  { name: "Jun", value: 5500 },
];

const serviceDistribution = [
  { name: "Deep Cleaning", value: 35 },
  { name: "Regular Cleaning", value: 45 },
  { name: "Carpet Cleaning", value: 15 },
  { name: "Window Cleaning", value: 5 },
];

const teamProductivity = [
  { name: "Team A", value: 92 },
  { name: "Team B", value: 87 },
  { name: "Team C", value: 94 },
  { name: "Team D", value: 89 },
];

const recentActivities = [
  {
    id: 1,
    action: "New client registration",
    client: "ABC Corp",
    time: "2 hours ago",
    type: "client",
  },
  {
    id: 2,
    action: "Service completed",
    client: "XYZ Office",
    time: "4 hours ago",
    type: "service",
  },
  {
    id: 3,
    action: "Invoice paid",
    client: "123 Restaurant",
    time: "6 hours ago",
    type: "payment",
  },
  {
    id: 4,
    action: "Equipment maintenance",
    client: "Vacuum Cleaner #12",
    time: "1 day ago",
    type: "maintenance",
  },
];

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your cleaning service.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Clients"
          value="247"
          change="+12%"
          changeType="positive"
          icon={Users}
          description="Active cleaning contracts"
        />
        <KPICard
          title="Monthly Revenue"
          value="$24,500"
          change="+8%"
          changeType="positive"
          icon={DollarSign}
          description="Revenue this month"
        />
        <KPICard
          title="Scheduled Services"
          value="89"
          change="-3%"
          changeType="negative"
          icon={Calendar}
          description="Services this week"
        />
        <KPICard
          title="Inventory Items"
          value="156"
          change="+2%"
          changeType="positive"
          icon={Package}
          description="Items in stock"
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <DashboardChart
          title="Monthly Revenue Trend"
          data={revenueData}
          type="line"
          dataKey="value"
          color="hsl(var(--primary))"
        />
        <DashboardChart
          title="Service Distribution"
          data={serviceDistribution}
          type="pie"
          dataKey="value"
        />
      </div>

      {/* Bottom Row */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Team Productivity */}
        <DashboardChart
          title="Team Productivity"
          data={teamProductivity}
          type="bar"
          dataKey="value"
          color="hsl(var(--accent))"
        />

        {/* Recent Activity */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.action}</p>
                    <p className="text-muted-foreground text-xs">
                      {activity.client}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={
                        activity.type === "payment"
                          ? "default"
                          : activity.type === "client"
                          ? "secondary"
                          : "outline"
                      }
                      className="text-xs"
                    >
                      {activity.type}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Today's Jobs</p>
              <p className="text-2xl font-bold">12</p>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Active Staff</p>
              <p className="text-2xl font-bold">28</p>
            </div>
            <Users className="h-8 w-8 text-primary" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Completion Rate</p>
              <p className="text-2xl font-bold">94%</p>
            </div>
            <TrendingUp className="h-8 w-8 text-success" />
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
              <p className="text-2xl font-bold">3</p>
            </div>
            <TrendingDown className="h-8 w-8 text-warning" />
          </div>
        </Card>
      </div>
    </div>
  );
}