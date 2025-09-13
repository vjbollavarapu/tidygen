import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Invoice } from '@/services/api';

const paymentSchema = z.object({
  invoice: z.number().min(1, 'Invoice is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  payment_date: z.string().min(1, 'Payment date is required'),
  payment_method: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CHECK', 'OTHER']),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  invoice?: Invoice;
  onSubmit: (data: PaymentFormData) => void;
  loading?: boolean;
}

export function PaymentForm({ invoice, onSubmit, loading }: PaymentFormProps) {
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      invoice: invoice?.id || 0,
      amount: invoice ? invoice.total_amount - invoice.paid_amount : 0,
      payment_date: new Date().toISOString().split('T')[0],
      payment_method: 'CASH',
      reference_number: '',
      notes: '',
    },
  });

  const handleSubmit = (data: PaymentFormData) => {
    onSubmit(data);
  };

  const maxAmount = invoice ? invoice.total_amount - invoice.paid_amount : 0;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      {invoice && (
        <Card>
          <CardHeader>
            <CardTitle>Invoice Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Invoice #:</span>
              <span className="font-medium">{invoice.invoice_number}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{invoice.customer_name}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Amount:</span>
              <span>${invoice.total_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Paid Amount:</span>
              <span>${invoice.paid_amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold">
              <span>Outstanding:</span>
              <Badge variant="outline">
                ${maxAmount.toFixed(2)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Amount *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={maxAmount}
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                />
              </FormControl>
              <FormDescription>
                Maximum amount: ${maxAmount.toFixed(2)}
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="payment_method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Method *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                  <SelectItem value="CHECK">Check</SelectItem>
                  <SelectItem value="OTHER">Other</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="reference_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Reference Number</FormLabel>
              <FormControl>
                <Input placeholder="Enter reference number" {...field} />
              </FormControl>
              <FormDescription>
                Transaction ID, check number, or other reference
              </FormDescription>
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

      <div className="flex justify-end space-x-2">
        <Button type="submit" loading={loading}>
          Record Payment
        </Button>
      </div>
    </form>
  );
}