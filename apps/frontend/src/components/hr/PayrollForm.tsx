/**
 * Payroll form component for processing employee payroll
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
import { hrService, Payroll, Employee } from "@/services/hrService";
import { Loader2 } from "lucide-react";

const payrollSchema = z.object({
  employee: z.number().min(1, "Employee is required"),
  pay_period_start: z.string().min(1, "Pay period start is required"),
  pay_period_end: z.string().min(1, "Pay period end is required"),
  gross_salary: z.number().min(0, "Gross salary must be positive"),
  overtime_pay: z.number().min(0, "Overtime pay must be positive"),
  bonuses: z.number().min(0, "Bonuses must be positive"),
  deductions: z.number().min(0, "Deductions must be positive"),
  net_salary: z.number().min(0, "Net salary must be positive"),
  payment_method: z.enum(["direct_deposit", "check", "cash"]),
  notes: z.string().optional(),
});

type PayrollFormData = z.infer<typeof payrollSchema>;

interface PayrollFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export function PayrollForm({ open, onOpenChange, employee, onSuccess }: PayrollFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PayrollFormData>({
    resolver: zodResolver(payrollSchema),
    defaultValues: {
      employee: 0,
      pay_period_start: "",
      pay_period_end: "",
      gross_salary: 0,
      overtime_pay: 0,
      bonuses: 0,
      deductions: 0,
      net_salary: 0,
      payment_method: "direct_deposit",
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
      // Set default pay period (bi-weekly)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setDate(today.getDate() - 14);
      
      reset({
        employee: employee?.id || 0,
        pay_period_start: startDate.toISOString().split('T')[0],
        pay_period_end: today.toISOString().split('T')[0],
        gross_salary: employee?.salary ? employee.salary / 26 : 0, // Bi-weekly salary
        overtime_pay: 0,
        bonuses: 0,
        deductions: 0,
        net_salary: 0,
        payment_method: "direct_deposit",
        notes: "",
      });
    }
  }, [open, employee, reset]);

  const { mutate: createPayroll, isPending: loading } = useMutation({
    mutationFn: (data: PayrollFormData) => hrService.createPayroll(data),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: PayrollFormData) => {
    createPayroll(data);
  };

  const grossSalary = watch("gross_salary");
  const overtimePay = watch("overtime_pay");
  const bonuses = watch("bonuses");
  const deductions = watch("deductions");

  // Calculate net salary automatically
  useEffect(() => {
    const netSalary = grossSalary + overtimePay + bonuses - deductions;
    setValue("net_salary", Math.max(0, netSalary));
  }, [grossSalary, overtimePay, bonuses, deductions, setValue]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Process Payroll</DialogTitle>
        </DialogHeader>

        {employee && (
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium">{employee.first_name} {employee.last_name}</h3>
            <p className="text-sm text-muted-foreground">Employee ID: {employee.employee_id}</p>
            <p className="text-sm text-muted-foreground">Position: {employee.position}</p>
            <p className="text-sm text-muted-foreground">Annual Salary: ${employee.salary.toLocaleString()}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="employee">Employee *</Label>
            <Select
              value={watch("employee")?.toString() || ""}
              onValueChange={(value) => {
                const selectedEmployee = employees.find(emp => emp.id === parseInt(value));
                setValue("employee", parseInt(value));
                if (selectedEmployee) {
                  setValue("gross_salary", selectedEmployee.salary / 26); // Bi-weekly salary
                }
              }}
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

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="pay_period_start">Pay Period Start *</Label>
              <Input
                id="pay_period_start"
                type="date"
                {...register("pay_period_start")}
              />
              {errors.pay_period_start && (
                <p className="text-sm text-destructive">{errors.pay_period_start.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pay_period_end">Pay Period End *</Label>
              <Input
                id="pay_period_end"
                type="date"
                {...register("pay_period_end")}
              />
              {errors.pay_period_end && (
                <p className="text-sm text-destructive">{errors.pay_period_end.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gross_salary">Gross Salary *</Label>
            <Input
              id="gross_salary"
              type="number"
              step="0.01"
              min="0"
              {...register("gross_salary", { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.gross_salary && (
              <p className="text-sm text-destructive">{errors.gross_salary.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="overtime_pay">Overtime Pay</Label>
              <Input
                id="overtime_pay"
                type="number"
                step="0.01"
                min="0"
                {...register("overtime_pay", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.overtime_pay && (
                <p className="text-sm text-destructive">{errors.overtime_pay.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonuses">Bonuses</Label>
              <Input
                id="bonuses"
                type="number"
                step="0.01"
                min="0"
                {...register("bonuses", { valueAsNumber: true })}
                placeholder="0.00"
              />
              {errors.bonuses && (
                <p className="text-sm text-destructive">{errors.bonuses.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deductions">Deductions</Label>
            <Input
              id="deductions"
              type="number"
              step="0.01"
              min="0"
              {...register("deductions", { valueAsNumber: true })}
              placeholder="0.00"
            />
            {errors.deductions && (
              <p className="text-sm text-destructive">{errors.deductions.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="net_salary">Net Salary</Label>
            <Input
              id="net_salary"
              type="number"
              step="0.01"
              min="0"
              {...register("net_salary", { valueAsNumber: true })}
              placeholder="0.00"
              readOnly
              className="bg-muted"
            />
            {errors.net_salary && (
              <p className="text-sm text-destructive">{errors.net_salary.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_method">Payment Method *</Label>
            <Select
              value={watch("payment_method")}
              onValueChange={(value: "direct_deposit" | "check" | "cash") => setValue("payment_method", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="direct_deposit">Direct Deposit</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="cash">Cash</SelectItem>
              </SelectContent>
            </Select>
            {errors.payment_method && (
              <p className="text-sm text-destructive">{errors.payment_method.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional payroll notes"
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
              Process Payroll
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
