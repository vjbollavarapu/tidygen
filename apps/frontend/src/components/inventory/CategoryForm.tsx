import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional(),
  is_active: z.boolean().default(true),
});

type CategoryFormData = z.infer<typeof categorySchema>;

interface CategoryFormProps {
  onSubmit: (data: CategoryFormData) => void;
  loading?: boolean;
}

export function CategoryForm({ onSubmit, loading }: CategoryFormProps) {
  const form = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      is_active: true,
    },
  });

  const handleSubmit = (data: CategoryFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Category Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter category name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter category description" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="is_active"
        render={({ field }) => (
          <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <FormLabel className="text-base">Active</FormLabel>
              <FormDescription>
                Whether this category is active and available for use
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
          Create Category
        </Button>
      </div>
    </form>
  );
}