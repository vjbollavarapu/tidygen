/**
 * Performance review form component for creating and editing performance reviews
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
import { hrService, PerformanceReview, Employee } from "@/services/hrService";
import { Loader2, Plus, X } from "lucide-react";

const performanceReviewSchema = z.object({
  employee: z.number().min(1, "Employee is required"),
  review_period_start: z.string().min(1, "Review period start is required"),
  review_period_end: z.string().min(1, "Review period end is required"),
  reviewer_id: z.number().min(1, "Reviewer is required"),
  overall_rating: z.number().min(1).max(5),
  goals_achieved: z.number().min(0),
  goals_total: z.number().min(0),
  strengths: z.array(z.string()).default([]),
  areas_for_improvement: z.array(z.string()).default([]),
  goals_for_next_period: z.array(z.string()).default([]),
  comments: z.string().optional(),
});

type PerformanceReviewFormData = z.infer<typeof performanceReviewSchema>;

interface PerformanceReviewFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  employee?: Employee | null;
  onSuccess: () => void;
}

export function PerformanceReviewForm({ open, onOpenChange, employee, onSuccess }: PerformanceReviewFormProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [strengths, setStrengths] = useState<string[]>([]);
  const [areasForImprovement, setAreasForImprovement] = useState<string[]>([]);
  const [goalsForNextPeriod, setGoalsForNextPeriod] = useState<string[]>([]);
  const [newStrength, setNewStrength] = useState("");
  const [newAreaForImprovement, setNewAreaForImprovement] = useState("");
  const [newGoal, setNewGoal] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<PerformanceReviewFormData>({
    resolver: zodResolver(performanceReviewSchema),
    defaultValues: {
      employee: 0,
      review_period_start: "",
      review_period_end: "",
      reviewer_id: 0,
      overall_rating: 3,
      goals_achieved: 0,
      goals_total: 0,
      strengths: [],
      areas_for_improvement: [],
      goals_for_next_period: [],
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
      // Set default review period (last 6 months)
      const today = new Date();
      const startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 6);
      
      reset({
        employee: employee?.id || 0,
        review_period_start: startDate.toISOString().split('T')[0],
        review_period_end: today.toISOString().split('T')[0],
        reviewer_id: 0,
        overall_rating: 3,
        goals_achieved: 0,
        goals_total: 0,
        strengths: [],
        areas_for_improvement: [],
        goals_for_next_period: [],
        comments: "",
      });
      setStrengths([]);
      setAreasForImprovement([]);
      setGoalsForNextPeriod([]);
    }
  }, [open, employee, reset]);

  const { mutate: createPerformanceReview, isPending: loading } = useMutation({
    mutationFn: (data: PerformanceReviewFormData) => hrService.createPerformanceReview({
      ...data,
      strengths,
      areas_for_improvement: areasForImprovement,
      goals_for_next_period: goalsForNextPeriod,
      status: 'draft',
    }),
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: PerformanceReviewFormData) => {
    createPerformanceReview(data);
  };

  const addStrength = () => {
    if (newStrength.trim() && !strengths.includes(newStrength.trim())) {
      setStrengths([...strengths, newStrength.trim()]);
      setNewStrength("");
    }
  };

  const removeStrength = (strength: string) => {
    setStrengths(strengths.filter(s => s !== strength));
  };

  const addAreaForImprovement = () => {
    if (newAreaForImprovement.trim() && !areasForImprovement.includes(newAreaForImprovement.trim())) {
      setAreasForImprovement([...areasForImprovement, newAreaForImprovement.trim()]);
      setNewAreaForImprovement("");
    }
  };

  const removeAreaForImprovement = (area: string) => {
    setAreasForImprovement(areasForImprovement.filter(a => a !== area));
  };

  const addGoal = () => {
    if (newGoal.trim() && !goalsForNextPeriod.includes(newGoal.trim())) {
      setGoalsForNextPeriod([...goalsForNextPeriod, newGoal.trim()]);
      setNewGoal("");
    }
  };

  const removeGoal = (goal: string) => {
    setGoalsForNextPeriod(goalsForNextPeriod.filter(g => g !== goal));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Performance Review</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Review Information</h3>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="reviewer_id">Reviewer *</Label>
                <Select
                  value={watch("reviewer_id")?.toString() || ""}
                  onValueChange={(value) => setValue("reviewer_id", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select reviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .filter(emp => emp.position.toLowerCase().includes('manager') || emp.position.toLowerCase().includes('lead'))
                      .map((emp) => (
                        <SelectItem key={emp.id} value={emp.id.toString()}>
                          {emp.first_name} {emp.last_name} - {emp.position}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                {errors.reviewer_id && (
                  <p className="text-sm text-destructive">{errors.reviewer_id.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="review_period_start">Review Period Start *</Label>
                <Input
                  id="review_period_start"
                  type="date"
                  {...register("review_period_start")}
                />
                {errors.review_period_start && (
                  <p className="text-sm text-destructive">{errors.review_period_start.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="review_period_end">Review Period End *</Label>
                <Input
                  id="review_period_end"
                  type="date"
                  {...register("review_period_end")}
                />
                {errors.review_period_end && (
                  <p className="text-sm text-destructive">{errors.review_period_end.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Rating and Goals */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Performance Rating</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="overall_rating">Overall Rating *</Label>
                <Select
                  value={watch("overall_rating")?.toString() || "3"}
                  onValueChange={(value) => setValue("overall_rating", parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select rating" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 - Needs Improvement</SelectItem>
                    <SelectItem value="2">2 - Below Expectations</SelectItem>
                    <SelectItem value="3">3 - Meets Expectations</SelectItem>
                    <SelectItem value="4">4 - Exceeds Expectations</SelectItem>
                    <SelectItem value="5">5 - Outstanding</SelectItem>
                  </SelectContent>
                </Select>
                {errors.overall_rating && (
                  <p className="text-sm text-destructive">{errors.overall_rating.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals_achieved">Goals Achieved *</Label>
                <Input
                  id="goals_achieved"
                  type="number"
                  min="0"
                  {...register("goals_achieved", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.goals_achieved && (
                  <p className="text-sm text-destructive">{errors.goals_achieved.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="goals_total">Total Goals *</Label>
                <Input
                  id="goals_total"
                  type="number"
                  min="0"
                  {...register("goals_total", { valueAsNumber: true })}
                  placeholder="0"
                />
                {errors.goals_total && (
                  <p className="text-sm text-destructive">{errors.goals_total.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Strengths */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Strengths</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newStrength}
                  onChange={(e) => setNewStrength(e.target.value)}
                  placeholder="Add a strength"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStrength())}
                />
                <Button type="button" onClick={addStrength} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {strengths.map((strength) => (
                  <div key={strength} className="flex items-center gap-1 bg-success/10 text-success px-2 py-1 rounded-md text-sm">
                    {strength}
                    <button
                      type="button"
                      onClick={() => removeStrength(strength)}
                      className="hover:bg-success/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Areas for Improvement */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Areas for Improvement</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newAreaForImprovement}
                  onChange={(e) => setNewAreaForImprovement(e.target.value)}
                  placeholder="Add an area for improvement"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAreaForImprovement())}
                />
                <Button type="button" onClick={addAreaForImprovement} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {areasForImprovement.map((area) => (
                  <div key={area} className="flex items-center gap-1 bg-warning/10 text-warning px-2 py-1 rounded-md text-sm">
                    {area}
                    <button
                      type="button"
                      onClick={() => removeAreaForImprovement(area)}
                      className="hover:bg-warning/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Goals for Next Period */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Goals for Next Period</h3>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  placeholder="Add a goal for next period"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGoal())}
                />
                <Button type="button" onClick={addGoal} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {goalsForNextPeriod.map((goal) => (
                  <div key={goal} className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-md text-sm">
                    {goal}
                    <button
                      type="button"
                      onClick={() => removeGoal(goal)}
                      className="hover:bg-primary/20 rounded"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Comments */}
          <div className="space-y-2">
            <Label htmlFor="comments">Additional Comments</Label>
            <Textarea
              id="comments"
              {...register("comments")}
              placeholder="Additional comments about the employee's performance"
              rows={4}
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
              Create Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
