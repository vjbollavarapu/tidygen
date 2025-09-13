/**
 * Stock adjustment form component for adjusting product stock levels
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
import { useMutation } from "@tanstack/react-query";
import { inventoryService, Product } from "@/services/inventoryService";
import { Loader2 } from "lucide-react";

const stockAdjustmentSchema = z.object({
  quantity: z.number().min(1, "Quantity must be positive"),
  movement_type: z.enum(["in", "out", "adjustment"], {
    required_error: "Movement type is required",
  }),
  notes: z.string().optional(),
  reference_number: z.string().optional(),
});

type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

interface StockAdjustmentFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

export function StockAdjustmentForm({ open, onOpenChange, product, onSuccess }: StockAdjustmentFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<StockAdjustmentFormData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      quantity: 0,
      movement_type: "in",
      notes: "",
      reference_number: "",
    },
  });

  // Reset form when product changes
  useEffect(() => {
    if (product) {
      reset({
        quantity: 0,
        movement_type: "in",
        notes: "",
        reference_number: "",
      });
    }
  }, [product, reset]);

  const { mutate: adjustStock, isPending: loading } = useMutation({
    mutationFn: (data: StockAdjustmentFormData) => {
      if (!product) throw new Error("No product selected");
      return inventoryService.adjustStock(product.id, data);
    },
    onSuccess: () => {
      onSuccess();
      onOpenChange(false);
    },
  });

  const onSubmit = (data: StockAdjustmentFormData) => {
    adjustStock(data);
  };

  const movementType = watch("movement_type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Adjust Stock</DialogTitle>
        </DialogHeader>

        {product && (
          <div className="mb-4 p-4 bg-muted/30 rounded-lg">
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-sm text-muted-foreground">SKU: {product.sku}</p>
            <p className="text-sm text-muted-foreground">
              Current Stock: {product.current_stock} units
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="movement_type">Movement Type *</Label>
            <Select
              value={movementType}
              onValueChange={(value: "in" | "out" | "adjustment") => setValue("movement_type", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select movement type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="in">Stock In</SelectItem>
                <SelectItem value="out">Stock Out</SelectItem>
                <SelectItem value="adjustment">Stock Adjustment</SelectItem>
              </SelectContent>
            </Select>
            {errors.movement_type && (
              <p className="text-sm text-destructive">{errors.movement_type.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="quantity">
              Quantity * 
              {movementType === "adjustment" && " (New total stock level)"}
            </Label>
            <Input
              id="quantity"
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              placeholder="Enter quantity"
              min={movementType === "adjustment" ? 0 : 1}
            />
            {errors.quantity && (
              <p className="text-sm text-destructive">{errors.quantity.message}</p>
            )}
            {movementType === "adjustment" && (
              <p className="text-xs text-muted-foreground">
                This will set the total stock to this amount
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="reference_number">Reference Number</Label>
            <Input
              id="reference_number"
              {...register("reference_number")}
              placeholder="e.g., PO-2024-001, INVOICE-123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              {...register("notes")}
              placeholder="Enter any additional notes"
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
              Adjust Stock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
