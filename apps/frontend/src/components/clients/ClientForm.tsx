/**
 * Client form component for creating and editing clients
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
import { clientService, Client } from "@/services/clientService";
import { Loader2 } from "lucide-react";

const clientSchema = z.object({
  name: z.string().min(1, "Client name is required"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip_code: z.string().optional(),
  country: z.string().default("USA"),
  contact_person: z.string().optional(),
  company_name: z.string().optional(),
  client_type: z.enum(["individual", "business", "residential", "commercial"]),
  status: z.enum(["active", "inactive", "prospect", "suspended"]),
  service_frequency: z.enum(["weekly", "bi-weekly", "monthly", "one-time", "custom"]),
  preferred_contact_method: z.enum(["email", "phone", "sms"]),
  notes: z.string().optional(),
});

type ClientFormData = z.infer<typeof clientSchema>;

interface ClientFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client?: Client | null;
  onSuccess: () => void;
}

export function ClientForm({ open, onOpenChange, client, onSuccess }: ClientFormProps) {
  const isEditing = !!client;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ClientFormData>({
    resolver: zodResolver(clientSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "USA",
      contact_person: "",
      company_name: "",
      client_type: "individual",
      status: "prospect",
      service_frequency: "one-time",
      preferred_contact_method: "email",
      notes: "",
    },
  });

  // Reset form when client changes
  useEffect(() => {
    if (client) {
      reset({
        name: client.name,
        email: client.email,
        phone: client.phone,
        address: client.address,
        city: client.city,
        state: client.state,
        zip_code: client.zip_code,
        country: client.country,
        contact_person: client.contact_person,
        company_name: client.company_name || "",
        client_type: client.client_type,
        status: client.status,
        service_frequency: client.service_frequency,
        preferred_contact_method: client.preferred_contact_method,
        notes: client.notes,
      });
    } else {
      reset({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        country: "USA",
        contact_person: "",
        company_name: "",
        client_type: "individual",
        status: "prospect",
        service_frequency: "one-time",
        preferred_contact_method: "email",
        notes: "",
      });
    }
  }, [client, reset]);

  const { mutate: createClient, isPending: createLoading } = useMutation({
    mutationFn: (data: ClientFormData) => clientService.createClient(data),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const { mutate: updateClient, isPending: updateLoading } = useMutation({
    mutationFn: (data: ClientFormData) => clientService.updateClient(client!.id, data),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: ClientFormData) => {
    if (isEditing) {
      updateClient(data);
    } else {
      createClient(data);
    }
  };

  const loading = createLoading || updateLoading;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Client" : "Add New Client"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Client Name *</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter client name"
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company_name">Company Name</Label>
              <Input
                id="company_name"
                {...register("company_name")}
                placeholder="Enter company name (if applicable)"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_person">Contact Person</Label>
              <Input
                id="contact_person"
                {...register("contact_person")}
                placeholder="Enter contact person name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="Enter email address"
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="Enter phone number"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="client_type">Client Type</Label>
              <Select
                value={watch("client_type")}
                onValueChange={(value: "individual" | "business" | "residential" | "commercial") => setValue("client_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select client type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="individual">Individual</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="residential">Residential</SelectItem>
                  <SelectItem value="commercial">Commercial</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              {...register("address")}
              placeholder="Enter full address"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                {...register("city")}
                placeholder="Enter city"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                {...register("state")}
                placeholder="Enter state"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="zip_code">ZIP Code</Label>
              <Input
                id="zip_code"
                {...register("zip_code")}
                placeholder="Enter ZIP code"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={watch("status")}
                onValueChange={(value: "active" | "inactive" | "prospect" | "suspended") => setValue("status", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="prospect">Prospect</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="service_frequency">Service Frequency</Label>
              <Select
                value={watch("service_frequency")}
                onValueChange={(value: "weekly" | "bi-weekly" | "monthly" | "one-time" | "custom") => setValue("service_frequency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-time">One-time</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="preferred_contact_method">Preferred Contact</Label>
              <Select
                value={watch("preferred_contact_method")}
                onValueChange={(value: "email" | "phone" | "sms") => setValue("preferred_contact_method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select contact method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="phone">Phone</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Enter any additional notes"
              rows={3}
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
              {isEditing ? "Update Client" : "Create Client"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
