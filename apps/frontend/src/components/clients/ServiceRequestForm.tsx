/**
 * Service request form component for creating service requests
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
import { useMutation, useQuery } from "@tanstack/react-query";
import { clientService, ServiceRequest, Client } from "@/services/clientService";
import { Loader2 } from "lucide-react";

const serviceRequestSchema = z.object({
  client: z.number().min(1, "Client is required"),
  service_type: z.string().min(1, "Service type is required"),
  description: z.string().min(1, "Description is required"),
  scheduled_date: z.string().min(1, "Scheduled date is required"),
  estimated_duration: z.number().min(1, "Duration must be at least 1 hour"),
  priority: z.enum(["low", "medium", "high", "urgent"]),
  assigned_team: z.string().optional(),
  estimated_cost: z.number().min(0, "Cost must be positive"),
  notes: z.string().optional(),
});

type ServiceRequestFormData = z.infer<typeof serviceRequestSchema>;

interface ServiceRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSuccess: () => void;
}

export function ServiceRequestForm({ open, onOpenChange, client, onSuccess }: ServiceRequestFormProps) {
  const [clients, setClients] = useState<Client[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ServiceRequestFormData>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: {
      client: 0,
      service_type: "",
      description: "",
      scheduled_date: "",
      estimated_duration: 2,
      priority: "medium",
      assigned_team: "",
      estimated_cost: 0,
      notes: "",
    },
  });

  // Fetch clients
  const { data: clientsData } = useQuery({
    queryKey: ['clients'],
    queryFn: () => clientService.getClients({ page_size: 100 })
  });

  useEffect(() => {
    if (clientsData) {
      setClients(clientsData);
    }
  }, [clientsData]);

  // Reset form when dialog opens or client changes
  useEffect(() => {
    if (open) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      reset({
        client: client?.id || 0,
        service_type: "",
        description: "",
        scheduled_date: tomorrow.toISOString().split('T')[0],
        estimated_duration: 2,
        priority: "medium",
        assigned_team: "",
        estimated_cost: 0,
        notes: "",
      });
    }
  }, [open, client, reset]);

  const { mutate: createServiceRequest, isPending: loading } = useMutation({
    mutationFn: (data: ServiceRequestFormData) => clientService.createServiceRequest(data),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: ServiceRequestFormData) => {
    createServiceRequest(data);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Service Request</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
                <SelectItem value="Carpet Cleaning">Carpet Cleaning</SelectItem>
                <SelectItem value="Window Cleaning">Window Cleaning</SelectItem>
                <SelectItem value="Post-Construction">Post-Construction</SelectItem>
                <SelectItem value="Move-in/Move-out">Move-in/Move-out</SelectItem>
                <SelectItem value="Office Cleaning">Office Cleaning</SelectItem>
                <SelectItem value="Kitchen Deep Clean">Kitchen Deep Clean</SelectItem>
                <SelectItem value="Bathroom Deep Clean">Bathroom Deep Clean</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.service_type && (
              <p className="text-sm text-destructive">{errors.service_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register("description")}
              placeholder="Describe the service requirements"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-destructive">{errors.description.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_date">Scheduled Date *</Label>
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
              <Label htmlFor="estimated_duration">Duration (hours) *</Label>
              <Input
                id="estimated_duration"
                type="number"
                min="1"
                {...register("estimated_duration", { valueAsNumber: true })}
                placeholder="2"
              />
              {errors.estimated_duration && (
                <p className="text-sm text-destructive">{errors.estimated_duration.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="assigned_team">Assigned Team</Label>
              <Select
                value={watch("assigned_team") || ""}
                onValueChange={(value) => setValue("assigned_team", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select team" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Team A">Team A</SelectItem>
                  <SelectItem value="Team B">Team B</SelectItem>
                  <SelectItem value="Team C">Team C</SelectItem>
                  <SelectItem value="Team D">Team D</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Enter any additional notes"
              rows={2}
            />
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
              Create Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
