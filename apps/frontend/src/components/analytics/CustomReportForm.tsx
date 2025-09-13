/**
 * Custom report form component for creating and editing custom reports
 */

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { analyticsService, CustomReport } from "@/services/analyticsService";
import { Loader2 } from "lucide-react";

const customReportSchema = z.object({
  name: z.string().min(1, "Report name is required"),
  description: z.string().min(1, "Description is required"),
  report_type: z.enum(["revenue", "operational", "financial", "employee", "inventory", "custom"]),
  is_public: z.boolean().default(false),
  schedule_frequency: z.enum(["daily", "weekly", "monthly", "quarterly"]).optional(),
  parameters: z.record(z.any()).optional(),
});

type CustomReportFormData = z.infer<typeof customReportSchema>;

interface CustomReportFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  report?: CustomReport | null;
  onSuccess: () => void;
}

export function CustomReportForm({ open, onOpenChange, report, onSuccess }: CustomReportFormProps) {
  const [selectedParameters, setSelectedParameters] = useState<string[]>([]);
  const isEditing = !!report;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<CustomReportFormData>({
    resolver: zodResolver(customReportSchema),
    defaultValues: {
      name: "",
      description: "",
      report_type: "custom",
      is_public: false,
      schedule_frequency: undefined,
      parameters: {},
    },
  });

  // Reset form when report changes
  React.useEffect(() => {
    if (report) {
      reset({
        name: report.name,
        description: report.description,
        report_type: report.report_type,
        is_public: report.is_public,
        schedule_frequency: report.schedule?.frequency,
        parameters: report.parameters,
      });
      setSelectedParameters(Object.keys(report.parameters || {}));
    } else {
      reset({
        name: "",
        description: "",
        report_type: "custom",
        is_public: false,
        schedule_frequency: undefined,
        parameters: {},
      });
      setSelectedParameters([]);
    }
  }, [report, reset]);

  const { mutate: createReport, isPending: createLoading } = useMutation({
    mutationFn: (data: CustomReportFormData) => analyticsService.createCustomReport({
      ...data,
      created_by: 1, // Current user ID
      schedule: data.schedule_frequency ? {
        frequency: data.schedule_frequency,
        next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      } : undefined,
    }),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const { mutate: updateReport, isPending: updateLoading } = useMutation({
    mutationFn: (data: CustomReportFormData) => analyticsService.updateCustomReport(report!.id, {
      ...data,
      schedule: data.schedule_frequency ? {
        frequency: data.schedule_frequency,
        next_run: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      } : undefined,
    }),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: CustomReportFormData) => {
    if (isEditing) {
      updateReport(data);
    } else {
      createReport(data);
    }
  };

  const loading = createLoading || updateLoading;

  const reportTypeOptions = [
    { value: "revenue", label: "Revenue Analytics" },
    { value: "operational", label: "Operational Analytics" },
    { value: "financial", label: "Financial Analytics" },
    { value: "employee", label: "Employee Analytics" },
    { value: "inventory", label: "Inventory Analytics" },
    { value: "custom", label: "Custom Report" },
  ];

  const parameterOptions = [
    { value: "include_breakdown", label: "Include Detailed Breakdown" },
    { value: "include_trends", label: "Include Trend Analysis" },
    { value: "include_comparisons", label: "Include Period Comparisons" },
    { value: "include_forecasts", label: "Include Forecasts" },
    { value: "include_ratings", label: "Include Performance Ratings" },
    { value: "include_utilization", label: "Include Utilization Metrics" },
    { value: "include_costs", label: "Include Cost Analysis" },
    { value: "include_profitability", label: "Include Profitability Analysis" },
  ];

  const handleParameterChange = (parameter: string, checked: boolean) => {
    if (checked) {
      setSelectedParameters([...selectedParameters, parameter]);
    } else {
      setSelectedParameters(selectedParameters.filter(p => p !== parameter));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Custom Report" : "Create Custom Report"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Report Name *</Label>
                <Input
                  id="name"
                  {...register("name")}
                  placeholder="Enter report name"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  placeholder="Describe what this report contains"
                  rows={3}
                />
                {errors.description && (
                  <p className="text-sm text-destructive">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="report_type">Report Type *</Label>
                <Select
                  value={watch("report_type")}
                  onValueChange={(value: "revenue" | "operational" | "financial" | "employee" | "inventory" | "custom") => setValue("report_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.report_type && (
                  <p className="text-sm text-destructive">{errors.report_type.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Report Parameters */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Report Parameters</h3>
            <div className="space-y-3">
              <Label>Select parameters to include in the report:</Label>
              <div className="grid grid-cols-2 gap-3">
                {parameterOptions.map((option) => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox
                      id={option.value}
                      checked={selectedParameters.includes(option.value)}
                      onCheckedChange={(checked) => handleParameterChange(option.value, checked as boolean)}
                    />
                    <Label htmlFor={option.value} className="text-sm">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Scheduling (Optional)</h3>
            <div className="space-y-2">
              <Label htmlFor="schedule_frequency">Schedule Frequency</Label>
              <Select
                value={watch("schedule_frequency") || ""}
                onValueChange={(value: "daily" | "weekly" | "monthly" | "quarterly" | undefined) => setValue("schedule_frequency", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Visibility */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Visibility</h3>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_public"
                checked={watch("is_public")}
                onCheckedChange={(checked) => setValue("is_public", checked as boolean)}
              />
              <Label htmlFor="is_public" className="text-sm">
                Make this report public (visible to all users)
              </Label>
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
              {isEditing ? "Update Report" : "Create Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
