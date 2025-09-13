import { useState, useEffect } from "react";
import { Plus, Search, Filter, Download, Upload, Package, AlertTriangle, Edit, Trash2, Eye, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/common/DataTable";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { inventoryService, Product, ProductCategory, Supplier, StockMovement, PurchaseOrder, InventorySummary } from "@/services/inventoryService";
import { ProductForm } from "@/components/inventory/ProductForm";
import { CategoryForm } from "@/components/inventory/CategoryForm";
import { SupplierForm } from "@/components/inventory/SupplierForm";
import { StockAdjustmentForm } from "@/components/inventory/StockAdjustmentForm";
import { PurchaseOrderForm } from "@/components/inventory/PurchaseOrderForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState("products");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<ProductCategory | null>(null);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [isCategoryFormOpen, setIsCategoryFormOpen] = useState(false);
  const [isSupplierFormOpen, setIsSupplierFormOpen] = useState(false);
  const [isStockAdjustmentOpen, setIsStockAdjustmentOpen] = useState(false);
  const [isPurchaseOrderFormOpen, setIsPurchaseOrderFormOpen] = useState(false);

  // Fetch data from backend
  const { data: inventorySummaryResponse, isLoading: summaryLoading, refetch: refetchSummary } = useQuery({
    queryKey: ['inventorySummary'],
    queryFn: () => inventoryService.getInventorySummary()
  });

  const { data: productsResponse, isLoading: productsLoading, refetch: refetchProducts } = useQuery({
    queryKey: ['products', searchTerm],
    queryFn: () => inventoryService.getProducts({ search: searchTerm, page_size: 100 })
  });

  const { data: categoriesResponse, isLoading: categoriesLoading, refetch: refetchCategories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => inventoryService.getCategories()
  });

  const { data: suppliersResponse, isLoading: suppliersLoading, refetch: refetchSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => inventoryService.getSuppliers({ page_size: 100 })
  });

  const { data: stockMovementsResponse, isLoading: movementsLoading, refetch: refetchMovements } = useQuery({
    queryKey: ['stockMovements'],
    queryFn: () => inventoryService.getStockMovements({ page_size: 50 })
  });

  const { data: purchaseOrdersResponse, isLoading: ordersLoading, refetch: refetchOrders } = useQuery({
    queryKey: ['purchaseOrders'],
    queryFn: () => inventoryService.getPurchaseOrders({ page_size: 50 })
  });

  const inventorySummary = inventorySummaryResponse?.data;
  const products = productsResponse?.data;
  const categories = categoriesResponse?.data;
  const suppliers = suppliersResponse?.data;
  const stockMovements = stockMovementsResponse?.data;
  const purchaseOrders = purchaseOrdersResponse?.data;

  const isLoading = summaryLoading || productsLoading || categoriesLoading || suppliersLoading || movementsLoading || ordersLoading;

  // Product columns
  const productColumns = [
    {
      key: "name",
      header: "Product Name",
      render: (row: Product) => (
        <div>
          <div className="font-medium">{row.name}</div>
          <div className="text-sm text-muted-foreground">{row.sku}</div>
        </div>
      ),
    },
    {
      key: "category_name",
      header: "Category",
      render: (row: Product) => row.category_name || "Uncategorized",
    },
    {
      key: "current_stock",
      header: "Stock",
      render: (row: Product) => (
        <div className="text-center">
          <div className="font-medium">{row.current_stock}</div>
          <div className="text-xs text-muted-foreground">Min: {row.min_stock_level}</div>
        </div>
      ),
    },
    {
      key: "cost_price",
      header: "Cost Price",
      render: (row: Product) => `$${row.cost_price.toFixed(2)}`,
    },
    {
      key: "selling_price",
      header: "Selling Price",
      render: (row: Product) => `$${row.selling_price.toFixed(2)}`,
    },
    {
      key: "status",
      header: "Status",
      render: (row: Product) => {
        let status = "In Stock";
        let variant: "default" | "secondary" | "destructive" = "default";
        
        if (row.current_stock === 0) {
          status = "Out of Stock";
          variant = "destructive";
        } else if (row.current_stock <= row.min_stock_level) {
          status = "Low Stock";
          variant = "secondary";
        }
        
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Product) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProduct(row);
              setIsStockAdjustmentOpen(true);
            }}
          >
            <TrendingUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedProduct(row);
              setIsProductFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Category columns
  const categoryColumns = [
    {
      key: "name",
      header: "Category Name",
    },
    {
      key: "description",
      header: "Description",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: ProductCategory) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedCategoryItem(row);
              setIsCategoryFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Supplier columns
  const supplierColumns = [
    {
      key: "name",
      header: "Supplier Name",
    },
    {
      key: "contact_person",
      header: "Contact Person",
    },
    {
      key: "email",
      header: "Email",
    },
    {
      key: "phone",
      header: "Phone",
    },
    {
      key: "actions",
      header: "Actions",
      render: (row: Supplier) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSelectedSupplier(row);
              setIsSupplierFormOpen(true);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Stock movement columns
  const movementColumns = [
    {
      key: "product_name",
      header: "Product",
    },
    {
      key: "movement_type",
      header: "Type",
      render: (row: StockMovement) => (
        <Badge variant={row.movement_type === 'in' ? 'default' : 'secondary'}>
          {row.movement_type}
        </Badge>
      ),
    },
    {
      key: "quantity",
      header: "Quantity",
      render: (row: StockMovement) => (
        <span className={row.quantity > 0 ? 'text-green-600' : 'text-red-600'}>
          {row.quantity > 0 ? '+' : ''}{row.quantity}
        </span>
      ),
    },
    {
      key: "reference_number",
      header: "Reference",
    },
    {
      key: "created",
      header: "Date",
      render: (row: StockMovement) => new Date(row.created).toLocaleDateString(),
    },
  ];

  // Purchase order columns
  const orderColumns = [
    {
      key: "order_number",
      header: "Order Number",
    },
    {
      key: "supplier_name",
      header: "Supplier",
    },
    {
      key: "status",
      header: "Status",
      render: (row: PurchaseOrder) => (
        <Badge variant={
          row.status === 'received' ? 'default' :
          row.status === 'confirmed' ? 'secondary' :
          row.status === 'cancelled' ? 'destructive' : 'outline'
        }>
          {row.status}
        </Badge>
      ),
    },
    {
      key: "total_amount",
      header: "Total Amount",
      render: (row: PurchaseOrder) => `$${row.total_amount.toFixed(2)}`,
    },
    {
      key: "order_date",
      header: "Order Date",
      render: (row: PurchaseOrder) => new Date(row.order_date).toLocaleDateString(),
    },
  ];

  const handleFormSuccess = () => {
    setIsProductFormOpen(false);
    setIsCategoryFormOpen(false);
    setIsSupplierFormOpen(false);
    setIsStockAdjustmentOpen(false);
    setIsPurchaseOrderFormOpen(false);
    setSelectedProduct(null);
    setSelectedCategoryItem(null);
    setSelectedSupplier(null);
    refetchProducts();
    refetchCategories();
    refetchSuppliers();
    refetchMovements();
    refetchOrders();
    refetchSummary();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your cleaning supplies, equipment, and stock levels
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="mr-2 h-4 w-4" />
            Import
          </Button>
          {activeTab === "products" && (
            <Button size="sm" onClick={() => setIsProductFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          )}
          {activeTab === "categories" && (
            <Button size="sm" onClick={() => setIsCategoryFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          )}
          {activeTab === "suppliers" && (
            <Button size="sm" onClick={() => setIsSupplierFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Supplier
            </Button>
          )}
          {activeTab === "orders" && (
            <Button size="sm" onClick={() => setIsPurchaseOrderFormOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create Order
            </Button>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary?.total_products || 0}</div>
            <p className="text-xs text-muted-foreground">Active products</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary?.low_stock_products || 0}</div>
            <p className="text-xs text-muted-foreground">Need reordering</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventorySummary?.out_of_stock_products || 0}</div>
            <p className="text-xs text-muted-foreground">Urgent attention</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${inventorySummary?.total_stock_value?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">Inventory value</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="movements">Stock Movements</TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </div>

          {/* Products Table */}
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={products || []} columns={productColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Categories</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={categories || []} columns={categoryColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Suppliers</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={suppliers || []} columns={supplierColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Stock Movements</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={stockMovements || []} columns={movementColumns} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <DataTable data={purchaseOrders || []} columns={orderColumns} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Forms */}
      <ProductForm
        open={isProductFormOpen}
        onOpenChange={setIsProductFormOpen}
        product={selectedProduct}
        onSuccess={handleFormSuccess}
      />

      <CategoryForm
        open={isCategoryFormOpen}
        onOpenChange={setIsCategoryFormOpen}
        category={selectedCategoryItem}
        onSuccess={handleFormSuccess}
      />

      <SupplierForm
        open={isSupplierFormOpen}
        onOpenChange={setIsSupplierFormOpen}
        supplier={selectedSupplier}
        onSuccess={handleFormSuccess}
      />

      <StockAdjustmentForm
        open={isStockAdjustmentOpen}
        onOpenChange={setIsStockAdjustmentOpen}
        product={selectedProduct}
        onSuccess={handleFormSuccess}
      />

      <PurchaseOrderForm
        open={isPurchaseOrderFormOpen}
        onOpenChange={setIsPurchaseOrderFormOpen}
        onSuccess={handleFormSuccess}
      />
    </div>
  );
}