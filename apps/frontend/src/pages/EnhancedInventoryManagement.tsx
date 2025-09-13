import React, { useState } from 'react';
import { Plus, Search, Filter, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/enhanced-data-table';
import { PageLayout, CardLayout, GridLayout } from '@/components/layout/EnhancedMainLayout';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useInventoryApi';
import { useCategories, useCreateCategory } from '@/hooks/useInventoryApi';
import { useSuppliers, useCreateSupplier } from '@/hooks/useInventoryApi';
import { usePurchaseOrders, useCreatePurchaseOrder } from '@/hooks/useInventoryApi';
import { ProductForm } from '@/components/inventory/ProductForm';
import { CategoryForm } from '@/components/inventory/CategoryForm';
import { SupplierForm } from '@/components/inventory/SupplierForm';
import { PurchaseOrderForm } from '@/components/inventory/PurchaseOrderForm';
import { FormModal } from '@/components/ui/enhanced-modal';
import { Product, ProductCategory, Supplier, PurchaseOrder } from '@/services/api';
import { ColumnDef } from '@tanstack/react-table';
import { usePermissions } from '@/contexts/EnhancedAuthContext';

export default function EnhancedInventoryManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('products');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [isPurchaseOrderModalOpen, setIsPurchaseOrderModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  const { canCreate, canEdit, canDelete } = usePermissions();

  // Data fetching
  const { data: productsData, isLoading: productsLoading } = useProducts({ search: searchTerm });
  const { data: categoriesData, isLoading: categoriesLoading } = useCategories();
  const { data: suppliersData, isLoading: suppliersLoading } = useSuppliers();
  const { data: purchaseOrdersData, isLoading: purchaseOrdersLoading } = usePurchaseOrders();

  // Mutations
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const deleteProductMutation = useDeleteProduct();
  const createCategoryMutation = useCreateCategory();
  const createSupplierMutation = useCreateSupplier();
  const createPurchaseOrderMutation = useCreatePurchaseOrder();

  // Product columns
  const productColumns: ColumnDef<Product>[] = [
    {
      accessorKey: 'name',
      header: 'Product Name',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.getValue('name')}</div>
          <div className="text-sm text-muted-foreground">{row.original.sku}</div>
        </div>
      ),
    },
    {
      accessorKey: 'category_name',
      header: 'Category',
      cell: ({ row }) => (
        <Badge variant="secondary">{row.getValue('category_name') || 'Uncategorized'}</Badge>
      ),
    },
    {
      accessorKey: 'stock_quantity',
      header: 'Stock',
      cell: ({ row }) => {
        const quantity = row.getValue('stock_quantity') as number;
        const minLevel = row.original.min_stock_level;
        const isLowStock = quantity <= minLevel;
        
        return (
          <div className="flex items-center space-x-2">
            <span className={isLowStock ? 'text-warning font-medium' : ''}>{quantity}</span>
            {isLowStock && <Badge variant="warning" className="text-xs">Low Stock</Badge>}
          </div>
        );
      },
    },
    {
      accessorKey: 'unit_price',
      header: 'Price',
      cell: ({ row }) => `$${row.getValue('unit_price')}`,
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
          {row.getValue('is_active') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <div className="flex items-center space-x-2">
          {canEdit('inventory') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setEditingItem(row.original);
                setIsProductModalOpen(true);
              }}
            >
              Edit
            </Button>
          )}
          {canDelete('inventory') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => deleteProductMutation.mutate(row.original.id)}
            >
              Delete
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Category columns
  const categoryColumns: ColumnDef<ProductCategory>[] = [
    {
      accessorKey: 'name',
      header: 'Category Name',
    },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => row.getValue('description') || '-',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
          {row.getValue('is_active') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  // Supplier columns
  const supplierColumns: ColumnDef<Supplier>[] = [
    {
      accessorKey: 'name',
      header: 'Supplier Name',
    },
    {
      accessorKey: 'contact_person',
      header: 'Contact Person',
      cell: ({ row }) => row.getValue('contact_person') || '-',
    },
    {
      accessorKey: 'email',
      header: 'Email',
      cell: ({ row }) => row.getValue('email') || '-',
    },
    {
      accessorKey: 'phone',
      header: 'Phone',
      cell: ({ row }) => row.getValue('phone') || '-',
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.getValue('is_active') ? 'default' : 'secondary'}>
          {row.getValue('is_active') ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  // Purchase Order columns
  const purchaseOrderColumns: ColumnDef<PurchaseOrder>[] = [
    {
      accessorKey: 'order_number',
      header: 'Order Number',
    },
    {
      accessorKey: 'supplier_name',
      header: 'Supplier',
    },
    {
      accessorKey: 'order_date',
      header: 'Order Date',
      cell: ({ row }) => new Date(row.getValue('order_date')).toLocaleDateString(),
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        const statusColors = {
          DRAFT: 'secondary',
          PENDING: 'warning',
          APPROVED: 'default',
          RECEIVED: 'success',
          CANCELLED: 'destructive',
        };
        return (
          <Badge variant={statusColors[status as keyof typeof statusColors] || 'secondary'}>
            {status}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'total_amount',
      header: 'Total Amount',
      cell: ({ row }) => `$${row.getValue('total_amount')}`,
    },
  ];

  const handleProductSubmit = async (data: Partial<Product>) => {
    if (editingItem) {
      await updateProductMutation.mutateAsync({ id: editingItem.id, data });
    } else {
      await createProductMutation.mutateAsync(data);
    }
    setIsProductModalOpen(false);
    setEditingItem(null);
  };

  const handleCategorySubmit = async (data: Partial<ProductCategory>) => {
    await createCategoryMutation.mutateAsync(data);
    setIsCategoryModalOpen(false);
  };

  const handleSupplierSubmit = async (data: Partial<Supplier>) => {
    await createSupplierMutation.mutateAsync(data);
    setIsSupplierModalOpen(false);
  };

  const handlePurchaseOrderSubmit = async (data: Partial<PurchaseOrder>) => {
    await createPurchaseOrderMutation.mutateAsync(data);
    setIsPurchaseOrderModalOpen(false);
  };

  const actions = (
    <div className="flex items-center space-x-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search inventory..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-64"
        />
      </div>
      <Button variant="outline" size="sm">
        <Filter className="h-4 w-4 mr-2" />
        Filter
      </Button>
      <Button variant="outline" size="sm">
        <Download className="h-4 w-4 mr-2" />
        Export
      </Button>
      <Button variant="outline" size="sm">
        <Upload className="h-4 w-4 mr-2" />
        Import
      </Button>
    </div>
  );

  return (
    <PageLayout
      title="Inventory Management"
      subtitle="Manage your products, categories, suppliers, and purchase orders"
      actions={actions}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
          <TabsTrigger value="purchase-orders">Purchase Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <CardLayout
            title="Products"
            actions={
              canCreate('inventory') && (
                <Button onClick={() => setIsProductModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Product
                </Button>
              )
            }
          >
            <DataTable
              columns={productColumns}
              data={productsData?.results || []}
              loading={productsLoading}
              searchKey="name"
              searchPlaceholder="Search products..."
              showSearch={false}
              showExport={true}
              onExport={() => console.log('Export products')}
            />
          </CardLayout>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <CardLayout
            title="Categories"
            actions={
              canCreate('inventory') && (
                <Button onClick={() => setIsCategoryModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Category
                </Button>
              )
            }
          >
            <DataTable
              columns={categoryColumns}
              data={categoriesData?.results || []}
              loading={categoriesLoading}
              searchKey="name"
              searchPlaceholder="Search categories..."
              showSearch={false}
            />
          </CardLayout>
        </TabsContent>

        <TabsContent value="suppliers" className="space-y-6">
          <CardLayout
            title="Suppliers"
            actions={
              canCreate('inventory') && (
                <Button onClick={() => setIsSupplierModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Supplier
                </Button>
              )
            }
          >
            <DataTable
              columns={supplierColumns}
              data={suppliersData?.results || []}
              loading={suppliersLoading}
              searchKey="name"
              searchPlaceholder="Search suppliers..."
              showSearch={false}
            />
          </CardLayout>
        </TabsContent>

        <TabsContent value="purchase-orders" className="space-y-6">
          <CardLayout
            title="Purchase Orders"
            actions={
              canCreate('inventory') && (
                <Button onClick={() => setIsPurchaseOrderModalOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Purchase Order
                </Button>
              )
            }
          >
            <DataTable
              columns={purchaseOrderColumns}
              data={purchaseOrdersData?.results || []}
              loading={purchaseOrdersLoading}
              searchKey="order_number"
              searchPlaceholder="Search purchase orders..."
              showSearch={false}
            />
          </CardLayout>
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <FormModal
        open={isProductModalOpen}
        onOpenChange={setIsProductModalOpen}
        onSubmit={handleProductSubmit}
        title={editingItem ? 'Edit Product' : 'Add Product'}
        description={editingItem ? 'Update product information' : 'Add a new product to your inventory'}
        loading={createProductMutation.isPending || updateProductMutation.isPending}
      >
        <ProductForm
          product={editingItem}
          categories={categoriesData?.results || []}
          suppliers={suppliersData?.results || []}
        />
      </FormModal>

      <FormModal
        open={isCategoryModalOpen}
        onOpenChange={setIsCategoryModalOpen}
        onSubmit={handleCategorySubmit}
        title="Add Category"
        description="Create a new product category"
        loading={createCategoryMutation.isPending}
      >
        <CategoryForm />
      </FormModal>

      <FormModal
        open={isSupplierModalOpen}
        onOpenChange={setIsSupplierModalOpen}
        onSubmit={handleSupplierSubmit}
        title="Add Supplier"
        description="Add a new supplier to your system"
        loading={createSupplierMutation.isPending}
      >
        <SupplierForm />
      </FormModal>

      <FormModal
        open={isPurchaseOrderModalOpen}
        onOpenChange={setIsPurchaseOrderModalOpen}
        onSubmit={handlePurchaseOrderSubmit}
        title="Create Purchase Order"
        description="Create a new purchase order"
        loading={createPurchaseOrderMutation.isPending}
        size="lg"
      >
        <PurchaseOrderForm
          suppliers={suppliersData?.results || []}
          products={productsData?.results || []}
        />
      </FormModal>
    </PageLayout>
  );
}
