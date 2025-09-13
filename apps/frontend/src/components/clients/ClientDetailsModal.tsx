/**
 * Client details modal component for viewing comprehensive client information
 */

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { clientService, Client, ServiceRequest, ClientNote } from "@/services/clientService";
import { Loader2, MapPin, Phone, Mail, Calendar, DollarSign, Users, MessageSquare } from "lucide-react";

interface ClientDetailsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
}

export function ClientDetailsModal({ open, onOpenChange, client }: ClientDetailsModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch related data when client changes
  const { data: serviceRequestsResponse, isLoading: requestsLoading } = useQuery({
    queryKey: ['serviceRequests', client?.id],
    queryFn: () => client ? clientService.getServiceRequests({ client: client.id }) : Promise.resolve({ data: [] }),
    enabled: !!client
  });

  const { data: clientNotesResponse, isLoading: notesLoading } = useQuery({
    queryKey: ['clientNotes', client?.id],
    queryFn: () => client ? clientService.getClientNotes(client.id) : Promise.resolve({ data: [] }),
    enabled: !!client
  });

  const serviceRequests = serviceRequestsResponse?.data || [];
  const clientNotes = clientNotesResponse?.data || [];

  // Reset tab when modal opens
  useEffect(() => {
    if (open) {
      setActiveTab("overview");
    }
  }, [open]);

  if (!client) return null;

  const isLoading = requestsLoading || notesLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {client.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Basic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Type:</span>
                    <Badge variant="outline">{client.client_type}</Badge>
                  </div>
                  
                  {client.company_name && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">Company:</span>
                      <span className="text-sm">{client.company_name}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Contact Person:</span>
                    <span className="text-sm">{client.contact_person}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant={
                      client.status === 'active' ? 'default' :
                      client.status === 'prospect' ? 'secondary' :
                      client.status === 'suspended' ? 'destructive' : 'outline'
                    }>
                      {client.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Service Frequency:</span>
                    <Badge variant="outline">{client.service_frequency}</Badge>
                  </div>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.email}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{client.phone}</span>
                  </div>
                  
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      <div>{client.address}</div>
                      <div>{client.city}, {client.state} {client.zip_code}</div>
                      <div>{client.country}</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Preferred Contact:</span>
                    <Badge variant="outline">{client.preferred_contact_method}</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Service Statistics */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{client.total_services}</div>
                    <div className="text-sm text-muted-foreground">Total Services</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">${client.total_revenue.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground">Total Revenue</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {client.last_service_date ? new Date(client.last_service_date).toLocaleDateString() : "N/A"}
                    </div>
                    <div className="text-sm text-muted-foreground">Last Service</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">
                      {client.next_service_date ? new Date(client.next_service_date).toLocaleDateString() : "Not Scheduled"}
                    </div>
                    <div className="text-sm text-muted-foreground">Next Service</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            {client.notes && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm">{client.notes}</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="services" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Service History</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : serviceRequests && serviceRequests.length > 0 ? (
                  <div className="space-y-3">
                    {serviceRequests.map((request) => (
                      <div key={request.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{request.service_type}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant={
                              request.status === 'completed' ? 'default' :
                              request.status === 'scheduled' ? 'secondary' :
                              request.status === 'in_progress' ? 'outline' :
                              request.status === 'cancelled' ? 'destructive' : 'secondary'
                            }>
                              {request.status}
                            </Badge>
                            <Badge variant={
                              request.priority === 'urgent' ? 'destructive' :
                              request.priority === 'high' ? 'secondary' :
                              request.priority === 'medium' ? 'outline' : 'secondary'
                            }>
                              {request.priority}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{request.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Date: {new Date(request.scheduled_date).toLocaleDateString()}</span>
                          <span>Duration: {request.estimated_duration}h</span>
                          <span>Cost: ${request.estimated_cost.toFixed(2)}</span>
                          {request.assigned_team && <span>Team: {request.assigned_team}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No service requests found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Client Notes</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin" />
                  </div>
                ) : clientNotes && clientNotes.length > 0 ? (
                  <div className="space-y-3">
                    {clientNotes.map((note) => (
                      <div key={note.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{note.title}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              note.note_type === 'compliment' ? 'bg-green-100 text-green-800' :
                              note.note_type === 'complaint' ? 'bg-red-100 text-red-800' :
                              note.note_type === 'billing' ? 'bg-blue-100 text-blue-800' :
                              note.note_type === 'service' ? 'bg-purple-100 text-purple-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {note.note_type}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(note.created).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{note.content}</p>
                        <p className="text-xs text-muted-foreground">
                          By: {note.created_by_name}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    No notes found
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
