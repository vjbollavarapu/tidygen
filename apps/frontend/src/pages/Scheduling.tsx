import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Calendar, Clock, Users, MapPin, AlertTriangle, CheckCircle, XCircle, Edit, Eye, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { schedulingService, Appointment, ServiceTemplate, Team, ScheduleConflict, ScheduleSummary } from "@/services/schedulingService";
import { AppointmentForm } from "@/components/scheduling/AppointmentForm";
import { ServiceTemplateForm } from "@/components/scheduling/ServiceTemplateForm";
import { TeamForm } from "@/components/scheduling/TeamForm";
import { AppointmentDetailsModal } from "@/components/scheduling/AppointmentDetailsModal";
import { ScheduleCalendar } from "@/components/scheduling/ScheduleCalendar";

export default function Scheduling() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("appointments");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [isAppointmentFormOpen, setIsAppointmentFormOpen] = useState(false);
  const [isServiceTemplateFormOpen, setIsServiceTemplateFormOpen] = useState(false);
  const [isTeamFormOpen, setIsTeamFormOpen] = useState(false);
  const [isAppointmentDetailsOpen, setIsAppointmentDetailsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");

  // Fetch data from backend
  const { data: scheduleSummary, loading: summaryLoading, refetch: refetchSummary } = useApi<ScheduleSummary>(
    () => schedulingService.getScheduleSummary()
  );

  const { data: appointments, loading: appointmentsLoading, refetch: refetchAppointments } = useApi<Appointment[]>(
    () => schedulingService.getAppointments({ search: searchTerm, page_size: 100 })
  );

  const { data: serviceTemplates, loading: templatesLoading, refetch: refetchTemplates } = useApi<ServiceTemplate[]>(
    () => schedulingService.getServiceTemplates({ page_size: 100 })
  );

  const { data: teams, loading: teamsLoading, refetch: refetchTeams } = useApi<Team[]>(
    () => schedulingService.getTeams({ page_size: 100 })
  );

  const { data: conflicts, loading: conflictsLoading, refetch: refetchConflicts } = useApi<ScheduleConflict[]>(
    () => schedulingService.getScheduleConflicts({ resolved: false, page_size: 50 })
  );

  const isLoading = summaryLoading || appointmentsLoading || templatesLoading || teamsLoading || conflictsLoading;

  // Appointment columns
  const appointmentColumns = [
    {
      key: "appointment_number",
      header: "Appointment",
      render: (row: Appointment) => (
        <div>
          <div className="font-medium">{row.appointment_number}</div>
          <div className="text-sm text-muted-foreground">{row.client_name}</div>
        </div>
      ),
    },
    {
      key: "service_type",
      header: "Service",
      render: (row: Appointment) => (
        <div>
          <div className="font-medium text-sm">{row.service_type}</div>
          <div className="text-xs text-muted-foreground">{row.service_description}</div>
        </div>
      ),
    },
    {
      key: "scheduled_date",
      header: "Date & Time",
      render: (row: Appointment) => (
        <div>
          <div className="font-medium text-sm">{new Date(row.scheduled_date).toLocaleDateString()}</div>
          <div className="text-xs text-muted-foreground">{row.scheduled_time}</div>
        </div>
      ),
    },
    {
      key: "estimated_duration",
      header: "Duration",
      render: (row: Appointment) => `${row.estimated_duration} min`,
    },
    {
      key: "assigned_team_names",
      header: "Team",
      render: (row: Appointment) => (
        <div className="flex flex-wrap gap-1">
          {row.assigned_team_names?.map((team, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {team}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "priority",
      header: "Priority",
      render: (row: Appointment) => (
        <Badge variant={
          row.priority === 'urgent' ? 'destructive' :
          row.priority === 'high' ? 'default' :
          row.priority === 'medium' ? 'secondary' : 'outline'
        }>
          {row.priority}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row: Appointment) => (
        <Badge variant={
          row.status === 'completed' ? 'default' :
          row.status === 'in_progress' ? 'secondary' :
          row.status === 'scheduled' ? 'outline' :
          row.status === 'cancelled' ? 'destructive' : 'secondary'
        }>
          {row.status.replace('_', ' ')}
        </Badge>
      ),
    },
    {
      key: "estimated_cost",
      header: "Cost",
      render: (row: Appointment) => `$${row.estimated_cost.toFixed(2)}`,
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Appointment) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAppointment(row);
              setIsAppointmentDetailsOpen(true);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedAppointment(row);
              setIsAppointmentFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          {row.status === 'scheduled' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Handle start appointment
                console.log("Start appointment:", row.id);
              }}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {row.status === 'in_progress' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Handle complete appointment
                console.log("Complete appointment:", row.id);
              }}
            >
              <CheckCircle className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleFormSuccess = () => {
    setIsAppointmentFormOpen(false);
    setIsServiceTemplateFormOpen(false);
    setIsTeamFormOpen(false);
    setSelectedAppointment(null);
    refetchAppointments();
    refetchTemplates();
    refetchTeams();
    refetchConflicts();
    refetchSummary();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading scheduling data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scheduling</h1>
          <p className="text-muted-foreground">
            Manage appointments, service templates, and team assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setViewMode(viewMode === "list" ? "calendar" : "list")}
          >
            <Calendar className="mr-2 h-4 w-4" />
            {viewMode === "list" ? "Calendar View" : "List View"}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          {activeTab === "appointments" && (
            <Button size="sm" onClick={() => setIsAppointmentFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Schedule Appointment
            </Button>
          )}
        </div>
      </div>

      {/* Schedule Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleSummary?.total_appointments || 0}</div>
            <p className="text-xs text-muted-foreground">+{scheduleSummary?.scheduled_today || 0} today</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleSummary?.completed_today || 0}</div>
            <p className="text-xs text-muted-foreground">Out of {scheduleSummary?.scheduled_today || 0} scheduled</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Utilization</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{scheduleSummary?.team_utilization?.toFixed(1) || 0}%</div>
            <p className="text-xs text-muted-foreground">Average utilization</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${scheduleSummary?.revenue_today?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">From completed services</p>
          </CardContent>
        </Card>
      </div>

      {/* Schedule Conflicts Alert */}
      {conflicts && conflicts.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {conflicts.length} unresolved schedule conflicts that require attention.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      {viewMode === "list" ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="appointments">Appointments</TabsTrigger>
            <TabsTrigger value="templates">Service Templates</TabsTrigger>
            <TabsTrigger value="teams">Teams</TabsTrigger>
            <TabsTrigger value="conflicts">Conflicts</TabsTrigger>
          </TabsList>

          <TabsContent value="appointments" className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
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

            {/* Appointments Table */}
            <Card>
              <CardHeader>
                <CardTitle>Appointments</CardTitle>
              </CardHeader>
              <CardContent>
                <DataTable data={appointments || []} columns={appointmentColumns} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Service Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Service templates feature coming soon...</p>
                  </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teams" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Teams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Team management feature coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="conflicts" className="space-y-4">
      <Card>
        <CardHeader>
                <CardTitle>Schedule Conflicts</CardTitle>
        </CardHeader>
        <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Conflict management feature coming soon...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Calendar View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Calendar view feature coming soon...</p>
          </div>
        </CardContent>
      </Card>
      )}

      {/* Forms */}
      <AppointmentForm
        open={isAppointmentFormOpen}
        onOpenChange={setIsAppointmentFormOpen}
        appointment={selectedAppointment}
        onSuccess={handleFormSuccess}
      />

      <AppointmentDetailsModal
        open={isAppointmentDetailsOpen}
        onOpenChange={setIsAppointmentDetailsOpen}
        appointment={selectedAppointment}
      />
    </div>
  );
}