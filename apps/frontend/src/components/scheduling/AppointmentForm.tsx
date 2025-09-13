/**
 * Appointment form component for creating and editing appointments
 */

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { schedulingService, Appointment, ServiceTemplate, Team } from "@/services/schedulingService";
import { clientService, Client } from "@/services/clientService";
import { Loader2, Plus, X } from "lucide-react";

const appointmentSchema = z.object({
  client: z.number().min(1, "Client is required"),
  service_type: z.string().min(1, "Service type is required"),
  service_description: z.string().min(1, "Service description is required"),
  scheduled_date: z.string().min(1, "Scheduled date is required"),
  scheduled_time: z.string().min(1, "Scheduled time is required"),
  estimated_duration: z.number().min(1, "Duration must be at least 1 minute"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assigned_team: z.array(z.number()).min(1, "At least one team must be assigned"),
  team_lead: z.number().optional(),
  special_instructions: z.string().optional(),
  equipment_needed: z.array(z.string()).default([]),
  estimated_cost: z.number().min(0, "Cost must be positive"),
  notes: z.string().optional(),
});

type AppointmentFormData = z.infer<typeof appointmentSchema>;

interface AppointmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appointment?: Appointment | null;
  onSuccess: () => void;
}

export function AppointmentForm({ open, onOpenChange, appointment, onSuccess }: AppointmentFormProps) {
  const [clients, setClients] = useState<Client[]>([]);
  const [serviceTemplates, setServiceTemplates] = useState<ServiceTemplate[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [equipmentNeeded, setEquipmentNeeded] = useState<string[]>([]);
  const [newEquipment, setNewEquipment] = useState("");
  const isEditing = !!appointment;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      client: 0,
      service_type: "",
      service_description: "",
      scheduled_date: new Date().toISOString().split('T')[0],
      scheduled_time: "09:00",
      estimated_duration: 120,
      priority: "medium",
      assigned_team: [],
      team_lead: undefined,
      special_instructions: "",
      equipment_needed: [],
      estimated_cost: 0,
      notes: "",
    },
  });

  // Fetch clients
  const { data: clientsData } = useApiMutation(
    () => clientService.getClients({ page_size: 100 })
  );

  // Fetch service templates
  const { data: templatesData } = useApiMutation(
    () => schedulingService.getServiceTemplates({ page_size: 100 })
  );

  // Fetch teams
  const { data: teamsData } = useApiMutation(
    () => schedulingService.getTeams({ page_size: 100 })
  );

  useEffect(() => {
    if (clientsData) {
      setClients(clientsData);
    }
  }, [clientsData]);

  useEffect(() => {
    if (templatesData) {
      setServiceTemplates(templatesData);
    }
  }, [templatesData]);

  useEffect(() => {
    if (teamsData) {
      setTeams(teamsData);
    }
  }, [teamsData]);

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment) {
      reset({
        client: appointment.client,
        service_type: appointment.service_type,
        service_description: appointment.service_description,
        scheduled_date: appointment.scheduled_date,
        scheduled_time: appointment.scheduled_time,
        estimated_duration: appointment.estimated_duration,
        priority: appointment.priority,
        assigned_team: appointment.assigned_team,
        team_lead: appointment.team_lead,
        special_instructions: appointment.special_instructions,
        equipment_needed: appointment.equipment_needed,
        estimated_cost: appointment.estimated_cost,
        notes: appointment.notes,
      });
      setEquipmentNeeded(appointment.equipment_needed);
    } else {
      reset({
        client: 0,
        service_type: "",
        service_description: "",
        scheduled_date: new Date().toISOString().split('T')[0],
        scheduled_time: "09:00",
        estimated_duration: 120,
        priority: "medium",
        assigned_team: [],
        team_lead: undefined,
        special_instructions: "",
        equipment_needed: [],
        estimated_cost: 0,
        notes: "",
      });
      setEquipmentNeeded([]);
    }
  }, [appointment, reset]);

  const { mutate: createAppointment, loading: createLoading } = useApiMutation(
    (data: AppointmentFormData) => schedulingService.createAppointment({
      ...data,
      equipment_needed: equipmentNeeded,
      status: 'scheduled',
      created_by: 1, // Current user ID
    }),
    {
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
      },
    }
  );

  const { mutate: updateAppointment, loading: updateLoading } = useApiMutation(
    (data: AppointmentFormData) => schedulingService.updateAppointment(appointment!.id, {
      ...data,
      equipment_needed: equipmentNeeded,
    }),
    {
      onSuccess: () => {
        onSuccess();
        onOpenChange(false);
      },
    }
  );

  const onSubmit = (data: AppointmentFormData) => {
    if (isEditing) {
      updateAppointment(data);
    } else {
      createAppointment(data);
    }
  };

  const loading = createLoading || updateLoading;

  const handleTemplateSelect = (templateId: string) => {
    const template = serviceTemplates.find(t => t.id.toString() === templateId);
    if (template) {
      setValue("service_type", template.service_type);
      setValue("service_description", template.description);
      setValue("estimated_duration", template.estimated_duration);
      setValue("estimated_cost", template.base_cost);
      setEquipmentNeeded(template.equipment_required);
    }
  };

  const addEquipment = () => {
    if (newEquipment.trim() && !equipmentNeeded.includes(newEquipment.trim())) {
      setEquipmentNeeded([...equipmentNeeded, newEquipment.trim()]);
      setNewEquipment("");
    }
  };

  const removeEquipment = (equipment: string) => {
    setEquipmentNeeded(equipmentNeeded.filter(e => e !== equipment));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Appointment" : "Schedule New Appointment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="client">Client *</Label>
                <Select
                  value={watch("client")?.toString() || ""}
                  onValueChange={(value) => setValue("client", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.client && (
                  <p className="text-sm text-destructive">{errors.client.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_template">Service Template</Label>
                <Select onValueChange={handleTemplateSelect}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id.toString()}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="service_type">Service Type *</Label>
                <Select
                  value={watch("service_type")}
                  onValueChange={(value) => setValue("service_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select service type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Regular Cleaning">Regular Cleaning</SelectItem>
                    <SelectItem value="Deep Cleaning">Deep Cleaning</SelectItem>
                    <SelectItem value="Office Cleaning">Office Cleaning</SelectItem>
                    <SelectItem value="Carpet Cleaning">Carpet Cleaning</SelectItem>
                    <SelectItem value="Window Cleaning">Window Cleaning</SelectItem>
                    <SelectItem value="Post-Construction">Post-Construction</SelectItem>
                    <SelectItem value="Move-in/Move-out">Move-in/Move-out</SelectItem>
                  </SelectContent>
                </Select>
                {errors.service_type && (
                  <p className="text-sm text-destructive">{errors.service_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select
                  value={watch("priority")}
                  onValueChange={(value: "low" | "medium" | "high" | "urgent") => setValue("priority", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.priority && (
                  <p className="text-sm text-destructive">{errors.priority.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_description">Service Description *</Label>
              <Textarea
                id="service_description"
                {...register("service_description")}
                placeholder="Describe the service to be performed"
                rows={3}
              />
              {errors.service_description && (
                <p className="text-sm text-destructive">{errors.service_description.message}</p>
              )}
            </div>
          </div>

          {/* Scheduling Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scheduling Information</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="scheduled_date">Date *</Label>
                <Input
                  id="scheduled_date"
                  type="date"
                  {...register("scheduled_date")}
                />
                {errors.scheduled_date && (
                  <p className="text-sm text-destructive">{errors.scheduled_date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="scheduled_time">Time *</Label>
                <Input
                  id="scheduled_time"
                  type="time"
                  {...register("scheduled_time")}
                />
                {errors.scheduled_time && (
                  <p className="text-sm text-destructive">{errors.scheduled_time.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimated_duration">Duration (minutes) *</Label>
                <Input
                  id="estimated_duration"
                  type="number"
                  min="1"
                  {...register("estimated_duration", { valueAsNumber: true })}
                  placeholder="120"
                />
                {errors.estimated_duration && (
                  <p className="text-sm text-destructive">{errors.estimated_duration.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Team Assignment */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Team Assignment</h3>
            <div className="space-y-2">
              <Label>Assigned Teams *</Label>
              <div className="grid grid-cols-2 gap-2">
                {teams.map((team) => (
                  <div key={team.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`team-${team.id}`}
                      checked={watch("assigned_team")?.includes(team.id) || false}
                      onChange={(e) => {
                        const currentTeams = watch("assigned_team") || [];
                        if (e.target.checked) {
                          setValue("assigned_team", [...currentTeams, team.id]);
                        } else {
                          setValue("assigned_team", currentTeams.filter(id => id !== team.id));
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor={`team-${team.id}`} className="text-sm">
                      {team.name} ({team.members.length} members)
                    </Label>
                  </div>
                ))}
              </div>
              {errors.assigned_team && (
                <p className="text-sm text-destructive">{errors.assigned_team.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="team_lead">Team Lead</Label>
              <Select
                value={watch("team_lead")?.toString() || ""}
                onValueChange={(value) => setValue("team_lead", value ? parseInt(value) : undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team lead (optional)" />
                </SelectTrigger>
                <SelectContent>
                  {teams.map((team) => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.team_lead_name} - {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Equipment and Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Equipment & Instructions</h3>
            
            <div className="space-y-2">
              <Label>Equipment Needed</Label>
              <div className="flex gap-2">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="Add equipment"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                />
                <Button type="button" onClick={addEquipment} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {equipmentNeeded.map((equipment) => (
                  <div key={equipment} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    {equipment}
                    <button
                      type="button"
                      onClick={() => removeEquipment(equipment)}
                      className="hover:bg-primary/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="special_instructions">Special Instructions</Label>
              <Textarea
                id="special_instructions"
                {...register("special_instructions")}
                placeholder="Any special instructions for the team"
                rows={3}
              />
            </div>
          </div>

          {/* Cost and Notes */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Cost & Notes</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="estimated_cost">Estimated Cost *</Label>
                <Input
                  id="estimated_cost"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("estimated_cost", { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {errors.estimated_cost && (
                  <p className="text-sm text-destructive">{errors.estimated_cost.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                {...register("notes")}
                placeholder="Additional notes about this appointment"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Appointment" : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
