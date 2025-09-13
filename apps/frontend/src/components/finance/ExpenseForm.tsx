import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';

const expenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  expense_date: z.string().min(1, 'Expense date is required'),
  vendor: z.string().optional(),
  is_billable: z.boolean().default(false),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseFormProps {
  onSubmit: (data: ExpenseFormData) => void;
  loading?: boolean;
}

const expenseCategories = [
  'Office Supplies',
  'Travel',
  'Meals',
  'Software',
  'Marketing',
  'Utilities',
  'Rent',
  'Insurance',
  'Professional Services',
  'Equipment',
  'Training',
  'Other',
];

export function ExpenseForm({ onSubmit, loading }: ExpenseFormProps) {
  const form = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      category: '',
      description: '',
      amount: 0,
      expense_date: new Date().toISOString().split('T')[0],
      vendor: '',
      is_billable: false,
    },
  });

  const handleSubmit = (data: ExpenseFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expense_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expense Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="vendor"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vendor</FormLabel>
              <FormControl>
                <Input placeholder="Enter vendor name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description *</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter expense description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_billable"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Billable</FormLabel>
              <FormDescription>
                Whether this expense can be billed to a client
              </FormDescription>
            </div>
            <FormControl>
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
          </FormItem>
        )}
      />

      <div className="flex justify-end space-x-2">
        <Button type="submit" loading={loading}>
          Record Expense
        </Button>
      </div>
    </form>
  );
}