/**
 * Employee form component for creating and editing employees
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
import { hrService, Employee } from "@/services/hrService";
import { Loader2, Plus, X } from "lucide-react";

const employeeSchema = z.object({
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  address: z.string().min(1, "Address is required"),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  zip_code: z.string().min(1, "ZIP code is required"),
  country: z.string().default("USA"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
  hire_date: z.string().min(1, "Hire date is required"),
  position: z.string().min(1, "Position is required"),
  department: z.string().min(1, "Department is required"),
  employment_type: z.enum(["full_time", "part_time", "contract", "intern"]),
  status: z.enum(["active", "inactive", "terminated", "on_leave"]),
  salary: z.number().min(0, "Salary must be positive"),
  hourly_rate: z.number().optional(),
  manager_id: z.number().optional(),
  emergency_contact_name: z.string().min(1, "Emergency contact name is required"),
  emergency_contact_phone: z.string().min(1, "Emergency contact phone is required"),
  emergency_contact_relationship: z.string().min(1, "Emergency contact relationship is required"),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

type EmployeeFormData = z.infer<typeof employeeSchema>;

interface EmployeeFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export function EmployeeForm({ open, onOpenChange, employee, onSuccess }: EmployeeFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newCertification, setNewCertification] = useState("");
  const isEditing = !!employee;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<EmployeeFormData>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      country: "USA",
      date_of_birth: "",
      hire_date: new Date().toISOString().split('T')[0],
      position: "",
      department: "",
      employment_type: "full_time",
      status: "active",
      salary: 0,
      hourly_rate: 0,
      manager_id: undefined,
      emergency_contact_name: "",
      emergency_contact_phone: "",
      emergency_contact_relationship: "",
      skills: [],
      certifications: [],
      notes: "",
    },
  });

  // Fetch employees for manager selection
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

  // Reset form when employee changes
  useEffect(() => {
    if (employee) {
      reset({
        first_name: employee.first_name,
        last_name: employee.last_name,
        email: employee.email,
        phone: employee.phone,
        address: employee.address,
        city: employee.city,
        state: employee.state,
        zip_code: employee.zip_code,
        country: employee.country,
        date_of_birth: employee.date_of_birth,
        hire_date: employee.hire_date,
        position: employee.position,
        department: employee.department,
        employment_type: employee.employment_type,
        status: employee.status,
        salary: employee.salary,
        hourly_rate: employee.hourly_rate,
        manager_id: employee.manager_id,
        emergency_contact_name: employee.emergency_contact_name,
        emergency_contact_phone: employee.emergency_contact_phone,
        emergency_contact_relationship: employee.emergency_contact_relationship,
        skills: employee.skills,
        certifications: employee.certifications,
        notes: employee.notes,
      });
      setSkills(employee.skills);
      setCertifications(employee.certifications);
    } else {
      reset({
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        state: "",
        zip_code: "",
        country: "USA",
        date_of_birth: "",
        hire_date: new Date().toISOString().split('T')[0],
        position: "",
        department: "",
        employment_type: "full_time",
        status: "active",
        salary: 0,
        hourly_rate: 0,
        manager_id: undefined,
        emergency_contact_name: "",
        emergency_contact_phone: "",
        emergency_contact_relationship: "",
        skills: [],
        certifications: [],
        notes: "",
      });
      setSkills([]);
      setCertifications([]);
    }
  }, [employee, reset]);

  const { mutate: createEmployee, isPending: createLoading } = useMutation({
    mutationFn: (data: EmployeeFormData) => hrService.createEmployee({
      ...data,
      skills,
      certifications,
    }),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const { mutate: updateEmployee, isPending: updateLoading } = useMutation({
    mutationFn: (data: EmployeeFormData) => hrService.updateEmployee(employee!.id, {
      ...data,
      skills,
      certifications,
    }),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: EmployeeFormData) => {
    if (isEditing) {
      updateEmployee(data);
    } else {
      createEmployee(data);
    }
  };

  const loading = createLoading || updateLoading;

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const addCertification = () => {
    if (newCertification.trim() && !certifications.includes(newCertification.trim())) {
      setCertifications([...certifications, newCertification.trim()]);
      setNewCertification("");
    }
  };

  const removeCertification = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Employee" : "Add New Employee"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First Name *</Label>
                <Input
                  id="first_name"
                  {...register("first_name")}
                  placeholder="Enter first name"
                />
                {errors.first_name && (
                  <p className="text-sm text-destructive">{errors.first_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Last Name *</Label>
                <Input
                  id="last_name"
                  {...register("last_name")}
                  placeholder="Enter last name"
                />
                {errors.last_name && (
                  <p className="text-sm text-destructive">{errors.last_name.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
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

              <div className="space-y-2">
                <Label htmlFor="phone">Phone *</Label>
                <Input
                  id="phone"
                  {...register("phone")}
                  placeholder="Enter phone number"
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Address Information</h3>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                {...register("address")}
                placeholder="Enter street address"
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  {...register("city")}
                  placeholder="Enter city"
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  {...register("state")}
                  placeholder="Enter state"
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zip_code">ZIP Code *</Label>
                <Input
                  id="zip_code"
                  {...register("zip_code")}
                  placeholder="Enter ZIP code"
                />
                {errors.zip_code && (
                  <p className="text-sm text-destructive">{errors.zip_code.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Employment Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Employment Information</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position">Position *</Label>
                <Input
                  id="position"
                  {...register("position")}
                  placeholder="Enter position"
                />
                {errors.position && (
                  <p className="text-sm text-destructive">{errors.position.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select
                  value={watch("department")}
                  onValueChange={(value) => setValue("department", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Quality Control">Quality Control</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                    <SelectItem value="Administration">Administration</SelectItem>
                    <SelectItem value="Management">Management</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-destructive">{errors.department.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employment_type">Employment Type *</Label>
                <Select
                  value={watch("employment_type")}
                  onValueChange={(value: "full_time" | "part_time" | "contract" | "intern") => setValue("employment_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="intern">Intern</SelectItem>
                  </SelectContent>
                </Select>
                {errors.employment_type && (
                  <p className="text-sm text-destructive">{errors.employment_type.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(value: "active" | "inactive" | "terminated" | "on_leave") => setValue("status", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="terminated">Terminated</SelectItem>
                    <SelectItem value="on_leave">On Leave</SelectItem>
                  </SelectContent>
                </Select>
                {errors.status && (
                  <p className="text-sm text-destructive">{errors.status.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manager_id">Manager</Label>
                <Select
                  value={watch("manager_id")?.toString() || ""}
                  onValueChange={(value) => setValue("manager_id", value ? parseInt(value) : undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.id !== employee?.id)
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.first_name} {emp.last_name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary">Annual Salary *</Label>
                <Input
                  id="salary"
                  type="number"
                  min="0"
                  {...register("salary", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.salary && (
                  <p className="text-sm text-destructive">{errors.salary.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hourly_rate">Hourly Rate</Label>
                <Input
                  id="hourly_rate"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register("hourly_rate", { valueAsNumber: true })}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  {...register("date_of_birth")}
                />
                {errors.date_of_birth && (
                  <p className="text-sm text-destructive">{errors.date_of_birth.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="hire_date">Hire Date *</Label>
                <Input
                  id="hire_date"
                  type="date"
                  {...register("hire_date")}
                />
                {errors.hire_date && (
                  <p className="text-sm text-destructive">{errors.hire_date.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Emergency Contact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="emergency_contact_name">Contact Name *</Label>
                <Input
                  id="emergency_contact_name"
                  {...register("emergency_contact_name")}
                  placeholder="Enter emergency contact name"
                />
                {errors.emergency_contact_name && (
                  <p className="text-sm text-destructive">{errors.emergency_contact_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergency_contact_phone">Contact Phone *</Label>
                <Input
                  id="emergency_contact_phone"
                  {...register("emergency_contact_phone")}
                  placeholder="Enter emergency contact phone"
                />
                {errors.emergency_contact_phone && (
                  <p className="text-sm text-destructive">{errors.emergency_contact_phone.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="emergency_contact_relationship">Relationship *</Label>
              <Input
                id="emergency_contact_relationship"
                {...register("emergency_contact_relationship")}
                placeholder="e.g., Spouse, Parent, Sibling"
              />
              {errors.emergency_contact_relationship && (
                <p className="text-sm text-destructive">{errors.emergency_contact_relationship.message}</p>
              )}
            </div>
          </div>

          {/* Skills and Certifications */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Skills & Certifications</h3>
            
            <div className="space-y-2">
              <Label>Skills</Label>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {skills.map((skill) => (
                  <div key={skill} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="hover:bg-primary/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Certifications</Label>
              <div className="flex gap-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="Add a certification"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCertification())}
                />
                <Button type="button" onClick={addCertification} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {certifications.map((cert) => (
                  <div key={cert} className="flex items-center gap-1 bg-secondary/10 text-secondary-foreground px-2 py-1 rounded-md text-sm">
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="hover:bg-secondary/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Additional notes about the employee"
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
              {isEditing ? "Update Employee" : "Create Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
