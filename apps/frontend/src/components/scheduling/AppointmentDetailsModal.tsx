/**
 * Appointment details modal component for viewing comprehensive appointment information
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApi } from "@/hooks/useApi";
import { schedulingService, Appointment } from "@/services/schedulingService";
import { Loader2, Calendar, Clock, Users, MapPin, DollarSign, AlertTriangle, CheckCircle, Edit, Play, Pause } from "lucide-react";

interface AppointmentDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
}

export function AppointmentDetailsModal({ open, onOpenChange, appointment }: AppointmentDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Reset tab when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab("overview");
    }
  }, [open]);

  if (!appointment) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'in_progress':
        return 'text-warning';
      case 'scheduled':
        return 'text-primary';
      case 'cancelled':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-destructive';
      case 'high':
        return 'text-warning';
      case 'medium':
        return 'text-primary';
      case 'low':
        return 'text-muted-foreground';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {appointment.appointment_number}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="team">Team</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Appointment Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Appointment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Date:</span>
                    <span className="text-sm">{new Date(appointment.scheduled_date).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Time:</span>
                    <span className="text-sm">{appointment.scheduled_time}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Duration:</span>
                    <span className="text-sm">{appointment.estimated_duration} minutes</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={
                      appointment.status === 'completed' ? 'default' :
                      appointment.status === 'in_progress' ? 'secondary' :
                      appointment.status === 'scheduled' ? 'outline' :
                      appointment.status === 'cancelled' ? 'destructive' : 'secondary'
                    }>
                      {appointment.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Priority:</span>
                    <Badge variant={
                      appointment.priority === 'urgent' ? 'destructive' :
                      appointment.priority === 'high' ? 'default' :
                      appointment.priority === 'medium' ? 'secondary' : 'outline'
                    }>
                      {appointment.priority}
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Client Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Client Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Client:</span>
                    <span className="text-sm">{appointment.client_name}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Email:</span>
                    <span className="text-sm">{appointment.client_email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Phone:</span>
                    <span className="text-sm">{appointment.client_phone}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {appointment.client_address}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium">Service Type:</span>
                    <p className="text-sm">{appointment.service_type}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Description:</span>
                    <p className="text-sm">{appointment.service_description}</p>
                  </div>
                </div>
                
                {appointment.special_instructions && (
                  <div className="mt-4">
                    <span className="text-sm font-medium">Special Instructions:</span>
                    <p className="text-sm mt-1">{appointment.special_instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Cost Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Cost Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Estimated Cost:</span>
                    <span className="text-sm">${appointment.estimated_cost.toFixed(2)}</span>
                  </div>
                  
                  {appointment.actual_cost && (
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Actual Cost:</span>
                      <span className="text-sm">${appointment.actual_cost.toFixed(2)}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            {/* Equipment Needed */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Equipment Needed</CardTitle>
              </CardHeader>
              <CardContent>
                {appointment.equipment_needed && appointment.equipment_needed.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {appointment.equipment_needed.map((equipment, index) => (
                      <Badge key={index} variant="outline">
                        {equipment}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No special equipment required</p>
                )}
              </CardContent>
            </Card>

            {/* Notes */}
            {appointment.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{appointment.notes}</p>
                </CardContent>
              </Card>
            )}

            {/* Appointment History */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Appointment History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Created:</span>
                    <span className="text-sm">{new Date(appointment.created).toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Edit className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Last Updated:</span>
                    <span className="text-sm">{new Date(appointment.updated).toLocaleString()}</span>
                  </div>
                  
                  {appointment.created_by_name && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Created By:</span>
                      <span className="text-sm">{appointment.created_by_name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="team" className="space-y-4">
            {/* Assigned Teams */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Assigned Teams</CardTitle>
              </CardHeader>
              <CardContent>
                {appointment.assigned_team_names && appointment.assigned_team_names.length > 0 ? (
                  <div className="space-y-3">
                    {appointment.assigned_team_names.map((teamName, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">{teamName}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No teams assigned</p>
                )}
              </CardContent>
            </Card>

            {/* Team Lead */}
            {appointment.team_lead_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Team Lead</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{appointment.team_lead_name}</span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2">
          {appointment.status === 'scheduled' && (
            <Button>
              <Play className="mr-2 h-4 w-4" />
              Start Appointment
            </Button>
          )}
          {appointment.status === 'in_progress' && (
            <Button>
              <CheckCircle className="mr-2 h-4 w-4" />
              Complete Appointment
            </Button>
          )}
          <Button variant="outline">
            <Edit className="mr-2 h-4 w-4" />
            Edit Appointment
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
