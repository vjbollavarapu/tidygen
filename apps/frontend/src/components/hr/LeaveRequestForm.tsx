/**
 * Leave request form component for creating and editing leave requests
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
import { hrService, LeaveRequest, Employee } from "@/services/hrService";
import { Loader2 } from "lucide-react";

const leaveRequestSchema = z.object({
  employee: z.number().min(1, "Employee is required"),
  leave_type: z.enum(["vacation", "sick_leave", "personal_leave", "maternity_leave", "paternity_leave", "bereavement", "other"]),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  total_days: z.number().min(1, "Total days must be at least 1"),
  reason: z.string().min(1, "Reason is required"),
  comments: z.string().optional(),
});

type LeaveRequestFormData = z.infer<typeof leaveRequestSchema>;

interface LeaveRequestFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export function LeaveRequestForm({ open, onOpenChange, employee, onSuccess }: LeaveRequestFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LeaveRequestFormData>({
    resolver: zodResolver(leaveRequestSchema),
    defaultValues: {
      employee: 0,
      leave_type: "vacation",
      start_date: "",
      end_date: "",
      total_days: 0,
      reason: "",
      comments: "",
    },
  });

  // Fetch employees
  const { data: employeesResponse } = useQuery({
    queryKey: ['employees'],
    queryFn: () => hrService.getEmployees({ page_size: 100 })
  });

  const employeesData = employeesResponse?.data;

  useEffect(() => {
    if (employeesData) {
      setEmployees(employeesData);
    }
  }, [employeesData]);

  // Reset form when dialog opens or employee changes
  useEffect(() => {
    if (open) {
      reset({
        employee: employee?.id || 0,
        leave_type: "vacation",
        start_date: "",
        end_date: "",
        total_days: 0,
        reason: "",
        comments: "",
      });
    }
  }, [open, employee, reset]);

  const { mutate: createLeaveRequest, isPending: loading } = useMutation({
    mutationFn: (data: LeaveRequestFormData) => hrService.createLeaveRequest(data),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: LeaveRequestFormData) => {
    createLeaveRequest(data);
  };

  const startDate = watch("start_date");
  const endDate = watch("end_date");

  // Calculate total days when start and end dates are provided
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end days
      setValue("total_days", diffDays);
    }
  }, [startDate, endDate, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Leave</DialogTitle>
        </DialogHeader>

        {employee && (
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium">{employee.first_name} {employee.last_name}</h3>
            <p className="text-sm text-muted-foreground">Employee ID: {employee.employee_id}</p>
            <p className="text-sm text-muted-foreground">Position: {employee.position}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select
              value={watch("employee")?.toString() || ""}
              onValueChange={(value) => setValue("employee", parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select employee" />
              </SelectTrigger>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id.toString()}>
                    {emp.first_name} {emp.last_name} - {emp.employee_id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.employee && (
              <p className="text-sm text-destructive">{errors.employee.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="leave_type">Leave Type *</Label>
            <Select
              value={watch("leave_type")}
              onValueChange={(value: "vacation" | "sick_leave" | "personal_leave" | "maternity_leave" | "paternity_leave" | "bereavement" | "other") => setValue("leave_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select leave type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="sick_leave">Sick Leave</SelectItem>
                <SelectItem value="personal_leave">Personal Leave</SelectItem>
                <SelectItem value="maternity_leave">Maternity Leave</SelectItem>
                <SelectItem value="paternity_leave">Paternity Leave</SelectItem>
                <SelectItem value="bereavement">Bereavement</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.leave_type && (
              <p className="text-sm text-destructive">{errors.leave_type.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date *</Label>
              <Input
                id="start_date"
                type="date"
                {...register("start_date")}
              />
              {errors.start_date && (
                <p className="text-sm text-destructive">{errors.start_date.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date *</Label>
              <Input
                id="end_date"
                type="date"
                {...register("end_date")}
              />
              {errors.end_date && (
                <p className="text-sm text-destructive">{errors.end_date.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="total_days">Total Days</Label>
            <Input
              id="total_days"
              type="number"
              min="1"
              {...register("total_days", { valueAsNumber: true })}
              placeholder="0"
              readOnly
              className="bg-muted"
            />
            {errors.total_days && (
              <p className="text-sm text-destructive">{errors.total_days.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason *</Label>
            <Textarea
              id="reason"
              {...register("reason")}
              placeholder="Please provide a reason for this leave request"
              rows={3}
            />
            {errors.reason && (
              <p className="text-sm text-destructive">{errors.reason.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              {...register("comments")}
              placeholder="Any additional comments or information"
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
              Submit Request
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
