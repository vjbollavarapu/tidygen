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
import { Supplier, Product } from '@/services/api';

const purchaseOrderItemSchema = z.object({
  product: z.number().min(1, 'Product is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  unit_price: z.number().min(0, 'Unit price must be positive'),
});

const purchaseOrderSchema = z.object({
  supplier: z.number().min(1, 'Supplier is required'),
  order_date: z.string().min(1, 'Order date is required'),
  expected_delivery_date: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(purchaseOrderItemSchema).min(1, 'At least one item is required'),
});

type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;

interface PurchaseOrderFormProps {
  suppliers: Supplier[];
  products: Product[];
  onSubmit: (data: PurchaseOrderFormData) => void;
  loading?: boolean;
}

export function PurchaseOrderForm({ suppliers, products, onSubmit, loading }: PurchaseOrderFormProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());

  const form = useForm<PurchaseOrderFormData>({
    resolver: zodResolver(purchaseOrderSchema),
    defaultValues: {
      supplier: 0,
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      notes: '',
      items: [{ product: 0, quantity: 1, unit_price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'items',
  });

  const handleSubmit = (data: PurchaseOrderFormData) => {
    onSubmit(data);
  };

  const addItem = () => {
    append({ product: 0, quantity: 1, unit_price: 0 });
  };

  const removeItem = (index: number) => {
    const productId = form.getValues(`items.${index}.product`);
    if (productId) {
      setSelectedProducts(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
    remove(index);
  };

  const handleProductChange = (index: number, productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      // Remove previous selection for this index
      const currentProductId = form.getValues(`items.${index}.product`);
      if (currentProductId) {
        newSet.delete(currentProductId);
      }
      // Add new selection
      if (productId) {
        newSet.add(productId);
      }
      return newSet;
    });
    
    // Auto-fill unit price from product
    const product = products.find(p => p.id === productId);
    if (product) {
      form.setValue(`items.${index}.unit_price`, product.cost_price);
    }
  };

  const calculateTotal = () => {
    const items = form.getValues('items');
    return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  };

  const getAvailableProducts = (currentIndex: number) => {
    const currentProductId = form.getValues(`items.${currentIndex}.product`);
    return products.filter(product => 
      !selectedProducts.has(product.id) || product.id === currentProductId
    );
  };

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField
          control={form.control}
          name="supplier"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Supplier *</FormLabel>
              <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id.toString()}>
                      {supplier.name}
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
          name="order_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Order Date *</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expected_delivery_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Delivery Date</FormLabel>
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
            <CardTitle>Order Items</CardTitle>
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
                name={`items.${index}.product`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product *</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        const productId = parseInt(value);
                        field.onChange(productId);
                        handleProductChange(index, productId);
                      }} 
                      value={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {getAvailableProducts(index).map((product) => (
                          <SelectItem key={product.id} value={product.id.toString()}>
                            {product.name}
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
        <CardContent className="pt-6">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold">Total Amount:</span>
            <Badge variant="outline" className="text-lg px-4 py-2">
              ${calculateTotal().toFixed(2)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end space-x-2">
        <Button type="submit" loading={loading}>
          Create Purchase Order
        </Button>
      </div>
    </form>
  );
}