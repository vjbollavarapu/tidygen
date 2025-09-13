/**
 * Attendance form component for recording employee attendance
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
import { hrService, Attendance, Employee } from "@/services/hrService";
import { Loader2 } from "lucide-react";

const attendanceSchema = z.object({
  employee: z.number().min(1, "Employee is required"),
  date: z.string().min(1, "Date is required"),
  check_in_time: z.string().optional(),
  check_out_time: z.string().optional(),
  total_hours: z.number().optional(),
  overtime_hours: z.number().optional(),
  status: z.enum(["present", "absent", "late", "half_day", "sick_leave", "vacation", "personal_leave"]),
  notes: z.string().optional(),
});

type AttendanceFormData = z.infer<typeof attendanceSchema>;

interface AttendanceFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export function AttendanceForm({ open, onOpenChange, employee, onSuccess }: AttendanceFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: {
      employee: 0,
      date: new Date().toISOString().split('T')[0],
      check_in_time: "",
      check_out_time: "",
      total_hours: 0,
      overtime_hours: 0,
      status: "present",
      notes: "",
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
        date: new Date().toISOString().split('T')[0],
        check_in_time: "",
        check_out_time: "",
        total_hours: 0,
        overtime_hours: 0,
        status: "present",
        notes: "",
      });
    }
  }, [open, employee, reset]);

  const { mutate: createAttendance, isPending: loading } = useMutation({
    mutationFn: (data: AttendanceFormData) => hrService.createAttendance(data),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: AttendanceFormData) => {
    createAttendance(data);
  };

  const status = watch("status");
  const checkInTime = watch("check_in_time");
  const checkOutTime = watch("check_out_time");

  // Calculate total hours when check-in and check-out times are provided
  useEffect(() => {
    if (checkInTime && checkOutTime && status === "present") {
      const checkIn = new Date(`2000-01-01T${checkInTime}`);
      const checkOut = new Date(`2000-01-01T${checkOutTime}`);
      const diffMs = checkOut.getTime() - checkIn.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      
      if (diffHours > 0) {
        const regularHours = Math.min(diffHours, 8);
        const overtimeHours = Math.max(0, diffHours - 8);
        
        setValue("total_hours", regularHours);
        setValue("overtime_hours", overtimeHours);
      }
    }
  }, [checkInTime, checkOutTime, status, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Record Attendance</DialogTitle>
        </DialogHeader>

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
            <Label htmlFor="date">Date *</Label>
            <Input
              id="date"
              type="date"
              {...register("date")}
            />
            {errors.date && (
              <p className="text-sm text-destructive">{errors.date.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status *</Label>
            <Select
              value={status}
              onValueChange={(value: "present" | "absent" | "late" | "half_day" | "sick_leave" | "vacation" | "personal_leave") => setValue("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="present">Present</SelectItem>
                <SelectItem value="late">Late</SelectItem>
                <SelectItem value="half_day">Half Day</SelectItem>
                <SelectItem value="absent">Absent</SelectItem>
                <SelectItem value="sick_leave">Sick Leave</SelectItem>
                <SelectItem value="vacation">Vacation</SelectItem>
                <SelectItem value="personal_leave">Personal Leave</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-sm text-destructive">{errors.status.message}</p>
            )}
          </div>

          {status === "present" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="check_in_time">Check In Time</Label>
                  <Input
                    id="check_in_time"
                    type="time"
                    {...register("check_in_time")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="check_out_time">Check Out Time</Label>
                  <Input
                    id="check_out_time"
                    type="time"
                    {...register("check_out_time")}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="total_hours">Total Hours</Label>
                  <Input
                    id="total_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    {...register("total_hours", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overtime_hours">Overtime Hours</Label>
                  <Input
                    id="overtime_hours"
                    type="number"
                    step="0.5"
                    min="0"
                    {...register("overtime_hours", { valueAsNumber: true })}
                    placeholder="0"
                  />
                </div>
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about attendance"
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
              Record Attendance
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
