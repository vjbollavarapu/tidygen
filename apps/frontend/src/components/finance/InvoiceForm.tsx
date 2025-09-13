import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import { Invoice, Customer } from '@/services/api';

const invoiceItemSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be positive'),
});

const invoiceSchema = z.object({
  customer: z.number().min(1, 'Customer is required'),
  issue_date: z.string().min(1, 'Issue date is required'),
  due_date: z.string().min(1, 'Due date is required'),
  notes: z.string().optional(),
  items: z.array(invoiceItemSchema).min(1, 'At least one item is required'),
});

type InvoiceFormData = z.infer<typeof invoiceSchema>;

interface InvoiceFormProps {
  invoice?: Invoice;
  customers: Customer[];
  onSubmit: (data: InvoiceFormData) => void;
  loading?: boolean;
}

export function InvoiceForm({ invoice, customers, onSubmit, loading }: InvoiceFormProps) {
  const form = useForm<InvoiceFormData>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      customer: invoice?.customer || 0,
      issue_date: invoice?.issue_date ? new Date(invoice.issue_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      due_date: invoice?.due_date ? new Date(invoice.due_date).toISOString().split('T')[0] : '',
      notes: invoice?.notes || '',
      items: invoice?.items?.length ? invoice.items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
      })) : [{ description: '', quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handleSubmit = (data: InvoiceFormData) => {
    onSubmit(data);
  };

  const addItem = () => {
    append({ description: '', quantity: 1, unit_price: 0 });
  };

  const removeItem = (index: number) => {
    remove(index);
  };

  const calculateSubtotal = () => {
    const items = form.getValues('items');
    return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const calculateTax = () => {
    const subtotal = calculateSubtotal();
    return subtotal * 0.1; // 10% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer *</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id.toString()}>
                      {customer.name}
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
          name="issue_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Issue Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="due_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Due Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={form.control}
        name="notes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Notes</FormLabel>
            <FormControl>
              <Textarea placeholder="Enter any additional notes" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Invoice Items</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg">
              <FormField
                control={form.control}
                name={`items.${index}.description`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter item description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.quantity`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quantity *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`items.${index}.unit_price`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unit Price *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-end space-x-2">
                <div className="flex-1">
                  <FormLabel>Total</FormLabel>
                  <div className="h-10 flex items-center px-3 border rounded-md bg-muted">
                    ${(form.watch(`items.${index}.quantity`) * form.watch(`items.${index}.unit_price`)).toFixed(2)}
                  </div>
                </div>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeItem(index)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-2">
          <div className="flex justify-between items-center">
            <span>Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Tax (10%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-lg font-semibold border-t pt-2">
            <span>Total:</span>
            <Badge variant="outline" className="text-lg px-4 py-2">
              ${calculateTotal().toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" loading={loading}>
          {invoice ? 'Update Invoice' : 'Create Invoice'}
        </Button>
      </div>
    </form>
  );
}