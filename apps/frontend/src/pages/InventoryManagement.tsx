import { useState } from "react";
import { Plus, Package, AlertTriangle, TrendingDown, CheckCircle } from "lucide-react";
import { DataTable, Column } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock inventory data
const inventoryData = [
  {
    id: 1,
    name: "All-Purpose Cleaner",
    category: "Cleaning Supplies",
    sku: "APC-001",
    currentStock: 45,
    minStock: 20,
    maxStock: 100,
    unit: "Bottles",
    unitCost: 8.50,
    supplier: "CleanCorp Inc",
    location: "Storage A-1",
    status: "In Stock",
    lastRestocked: "2024-01-10",
  },
  {
    id: 2,
    name: "Microfiber Cloths",
    category: "Equipment",
    sku: "MFC-002",
    currentStock: 15,
    minStock: 25,
    maxStock: 75,
    unit: "Packs",
    unitCost: 12.00,
    supplier: "SupplyMax",
    location: "Storage B-2",
    status: "Low Stock",
    lastRestocked: "2024-01-05",
  },
  {
    id: 3,
    name: "Industrial Vacuum Bags",
    category: "Equipment",
    sku: "IVB-003",
    currentStock: 8,
    minStock: 15,
    maxStock: 50,
    unit: "Boxes",
    unitCost: 25.00,
    supplier: "VacuumPro",
    location: "Storage C-1",
    status: "Critical",
    lastRestocked: "2023-12-28",
  },
  {
    id: 4,
    name: "Disinfectant Spray",
    category: "Cleaning Supplies",
    sku: "DS-004",
    currentStock: 67,
    minStock: 30,
    maxStock: 100,
    unit: "Bottles",
    unitCost: 6.75,
    supplier: "HygieneFirst",
    location: "Storage A-3",
    status: "In Stock",
    lastRestocked: "2024-01-12",
  },
  {
    id: 5,
    name: "Floor Polish",
    category: "Cleaning Supplies",
    sku: "FP-005",
    currentStock: 0,
    minStock: 10,
    maxStock: 40,
    unit: "Gallons",
    unitCost: 18.00,
    supplier: "FloorCare Pro",
    location: "Storage A-2",
    status: "Out of Stock",
    lastRestocked: "2023-12-15",
  },
];

const columns: Column[] = [
  {
    key: "name",
    label: "Item",
    sortable: true,
    render: (value, row) => (
      <div>
        <div className="font-medium">{value}</div>
        <div className="text-sm text-muted-foreground">SKU: {row.sku}</div>
      </div>
    ),
  },
  {
    key: "category",
    label: "Category",
    sortable: true,
  },
  {
    key: "currentStock",
    label: "Stock Level",
    sortable: true,
    render: (value, row) => (
      <div>
        <div className="font-medium">
          {value} {row.unit}
        </div>
        <div className="text-xs text-muted-foreground">
          Min: {row.minStock} | Max: {row.maxStock}
        </div>
      </div>
    ),
  },
  {
    key: "status",
    label: "Status",
    render: (value) => (
      <Badge
        variant={
          value === "In Stock"
            ? "default"
            : value === "Low Stock"
            ? "secondary"
            : value === "Critical"
            ? "destructive"
            : "outline"
        }
      >
        {value}
      </Badge>
    ),
  },
  {
    key: "unitCost",
    label: "Unit Cost",
    sortable: true,
    render: (value) => `$${value.toFixed(2)}`,
  },
  {
    key: "supplier",
    label: "Supplier",
  },
];

export default function InventoryManagement() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Calculate inventory stats
  const totalItems = inventoryData.length;
  const lowStockItems = inventoryData.filter(item => 
    item.status === "Low Stock" || item.status === "Critical" || item.status === "Out of Stock"
  ).length;
  const inStockItems = inventoryData.filter(item => item.status === "In Stock").length;
  const totalValue = inventoryData.reduce((sum, item) => sum + (item.currentStock * item.unitCost), 0);

  const handleView = (item: any) => {
    console.log("View item:", item);
  };

  const handleEdit = (item: any) => {
    console.log("Edit item:", item);
  };

  const handleDelete = (item: any) => {
    console.log("Delete item:", item);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">
            Track and manage your cleaning supplies and equipment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            Generate Report
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="btn-enterprise">
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Inventory Item</DialogTitle>
                <DialogDescription>
                  Add a new item to your inventory management system.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input id="itemName" placeholder="Enter item name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sku">SKU</Label>
                    <Input id="sku" placeholder="Item SKU code" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cleaning-supplies">Cleaning Supplies</SelectItem>
                        <SelectItem value="equipment">Equipment</SelectItem>
                        <SelectItem value="safety">Safety Equipment</SelectItem>
                        <SelectItem value="tools">Tools</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" placeholder="e.g., Bottles, Packs" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentStock">Current Stock</Label>
                    <Input id="currentStock" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minStock">Min Stock</Label>
                    <Input id="minStock" type="number" placeholder="0" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maxStock">Max Stock</Label>
                    <Input id="maxStock" type="number" placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="unitCost">Unit Cost</Label>
                    <Input id="unitCost" type="number" step="0.01" placeholder="0.00" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="supplier">Supplier</Label>
                    <Input id="supplier" placeholder="Supplier name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Storage Location</Label>
                  <Input id="location" placeholder="e.g., Storage A-1" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsAddDialogOpen(false)}>
                  Add Item
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{totalItems}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">In Stock</p>
              <p className="text-2xl font-bold">{inStockItems}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Low/Out of Stock</p>
              <p className="text-2xl font-bold">{lowStockItems}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-accent/10 rounded-lg">
              <TrendingDown className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Value</p>
              <p className="text-2xl font-bold">${totalValue.toFixed(0)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory Items</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            data={inventoryData}
            columns={columns}
            onView={handleView}
            onEdit={handleEdit}
            onDelete={handleDelete}
            searchable
            filterable
          />
        </CardContent>
      </Card>
    </div>
  );
}