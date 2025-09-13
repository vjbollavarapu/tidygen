import { useState } from "react";
import { Calendar, Clock, MapPin, Users, Plus, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

// Mock scheduling data
const scheduledJobs = [
  {
    id: 1,
    client: "ABC Corporation",
    service: "Deep Cleaning",
    date: "2024-01-22",
    time: "09:00 AM",
    duration: "4 hours",
    team: "Team A",
    status: "Confirmed",
    priority: "High",
    address: "123 Business Ave, City",
  },
  {
    id: 2,
    client: "Downtown Restaurant",
    service: "Kitchen Deep Clean",
    date: "2024-01-22",
    time: "06:00 AM",
    duration: "3 hours",
    team: "Team B",
    status: "Confirmed",
    priority: "High",
    address: "456 Main St, Downtown",
  },
  {
    id: 3,
    client: "Johnson Family",
    service: "Weekly House Cleaning",
    date: "2024-01-22",
    time: "10:00 AM",
    duration: "2 hours",
    team: "Team C",
    status: "Confirmed",
    priority: "Normal",
    address: "789 Oak Street, Suburbs",
  },
  {
    id: 4,
    client: "Office Complex",
    service: "Regular Maintenance",
    date: "2024-01-22",
    time: "02:00 PM",
    duration: "5 hours",
    team: "Team A",
    status: "Pending",
    priority: "Normal",
    address: "321 Corporate Drive",
  },
  {
    id: 5,
    client: "Medical Center",
    service: "Sanitization",
    date: "2024-01-23",
    time: "08:00 AM",
    duration: "6 hours",
    team: "Team D",
    status: "Confirmed",
    priority: "Critical",
    address: "555 Health Plaza",
  },
];

const teams = [
  { id: "team-a", name: "Team A", members: 4, lead: "Sarah Johnson" },
  { id: "team-b", name: "Team B", members: 3, lead: "Mike Rodriguez" },
  { id: "team-c", name: "Team C", members: 3, lead: "Lisa Chen" },
  { id: "team-d", name: "Team D", members: 5, lead: "David Wilson" },
];

export default function Scheduling() {
  const [selectedDate, setSelectedDate] = useState("2024-01-22");
  const [selectedTeam, setSelectedTeam] = useState("all");

  const filteredJobs = scheduledJobs.filter(job => {
    const dateMatch = job.date === selectedDate;
    const teamMatch = selectedTeam === "all" || job.team.toLowerCase().replace(" ", "-") === selectedTeam;
    return dateMatch && teamMatch;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Confirmed":
        return <Badge variant="default">Confirmed</Badge>;
      case "Pending":
        return <Badge variant="secondary">Pending</Badge>;
      case "In Progress":
        return <Badge className="bg-warning text-warning-foreground">In Progress</Badge>;
      case "Completed":
        return <Badge className="bg-success text-success-foreground">Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "Critical":
        return <Badge variant="destructive">Critical</Badge>;
      case "High":
        return <Badge className="bg-warning text-warning-foreground">High</Badge>;
      case "Normal":
        return <Badge variant="outline">Normal</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Scheduling</h1>
          <p className="text-muted-foreground">
            Manage service appointments and team assignments
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Calendar View
          </Button>
          <Button className="btn-enterprise">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Service
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-48"
          />
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.id} value={team.id}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
      </div>

      {/* Daily Stats */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Calendar className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Jobs</p>
              <p className="text-2xl font-bold">{filteredJobs.length}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Users className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Teams Active</p>
              <p className="text-2xl font-bold">
                {new Set(filteredJobs.map(job => job.team)).size}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Hours</p>
              <p className="text-2xl font-bold">
                {filteredJobs.reduce((total, job) => total + parseInt(job.duration), 0)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <MapPin className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Locations</p>
              <p className="text-2xl font-bold">
                {new Set(filteredJobs.map(job => job.address)).size}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Team Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {teams.map((team) => {
          const teamJobs = filteredJobs.filter(job => job.team === team.name);
          return (
            <Card key={team.id} className="enterprise-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{team.name}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Lead: {team.lead} • {team.members} members
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Jobs Today:</span>
                    <span className="font-medium">{teamJobs.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Hours:</span>
                    <span className="font-medium">
                      {teamJobs.reduce((total, job) => total + parseInt(job.duration), 0)}h
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Status:</span>
                    <Badge 
                      variant={teamJobs.length > 0 ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {teamJobs.length > 0 ? "Active" : "Available"}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Scheduled Jobs */}
      <Card>
        <CardHeader>
          <CardTitle>
            Scheduled Jobs for {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredJobs.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No jobs scheduled for this date and team combination.</p>
              </div>
            ) : (
              filteredJobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-2">
                      <h4 className="font-semibold">{job.client}</h4>
                      {getStatusBadge(job.status)}
                      {getPriorityBadge(job.priority)}
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>{job.time} ({job.duration})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        <span>{job.team}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{job.address}</span>
                      </div>
                      <div>
                        <span className="font-medium">{job.service}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}