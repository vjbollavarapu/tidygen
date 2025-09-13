/**
 * Inventory API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from '@/components/ui/enhanced-notifications';
import apiClient, { PaginatedResponse, Product, ProductCategory, Supplier, PurchaseOrder } from '@/services/api';
import { queryKeys } from './useApi';

// Generic query options
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
  retry: (failureCount: number, error: any) => {
    if (error?.status === 401 || error?.status === 403) {
      return false;
    }
    return failureCount < 3;
  },
};

// Product Hooks
export function useProducts(params?: any, options?: UseQueryOptions<PaginatedResponse<Product>>) {
  return useQuery({
    queryKey: [...queryKeys.products, params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Product>>('/inventory/products/', { params });
      return response.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

export function useProduct(id: number, options?: UseQueryOptions<Product>) {
  return useQuery({
    queryKey: queryKeys.product(id),
    queryFn: async () => {
      const response = await apiClient.get<Product>(`/inventory/products/${id}/`);
      return response.data;
    },
    enabled: !!id,
    ...defaultQueryOptions,
    ...options,
  });
}

export function useCreateProduct(options?: UseMutationOptions<Product, Error, Partial<Product>>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Product>) => {
      const response = await apiClient.post<Product>('/inventory/products/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      toast.success('Product Created', 'Product has been created successfully');
    },
    onError: (error: any) => {
      toast.error('Creation Failed', error.message || 'Failed to create product');
    },
    ...options,
  });
}

export function useUpdateProduct(options?: UseMutationOptions<Product, Error, { id: number; data: Partial<Product> }>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Product> }) => {
      const response = await apiClient.patch<Product>(`/inventory/products/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.setQueryData(queryKeys.product(data.id), data);
      toast.success('Product Updated', 'Product has been updated successfully');
    },
    onError: (error: any) => {
      toast.error('Update Failed', error.message || 'Failed to update product');
    },
    ...options,
  });
}

export function useDeleteProduct(options?: UseMutationOptions<void, Error, number>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      await apiClient.delete(`/inventory/products/${id}/`);
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.products });
      queryClient.removeQueries({ queryKey: queryKeys.product(id) });
      toast.success('Product Deleted', 'Product has been deleted successfully');
    },
    onError: (error: any) => {
      toast.error('Deletion Failed', error.message || 'Failed to delete product');
    },
    ...options,
  });
}

// Category Hooks
export function useCategories(params?: any, options?: UseQueryOptions<PaginatedResponse<ProductCategory>>) {
  return useQuery({
    queryKey: [...queryKeys.categories, params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<ProductCategory>>('/inventory/categories/', { params });
      return response.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

export function useCreateCategory(options?: UseMutationOptions<ProductCategory, Error, Partial<ProductCategory>>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<ProductCategory>) => {
      const response = await apiClient.post<ProductCategory>('/inventory/categories/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories });
      toast.success('Category Created', 'Category has been created successfully');
    },
    onError: (error: any) => {
      toast.error('Creation Failed', error.message || 'Failed to create category');
    },
    ...options,
  });
}

// Supplier Hooks
export function useSuppliers(params?: any, options?: UseQueryOptions<PaginatedResponse<Supplier>>) {
  return useQuery({
    queryKey: [...queryKeys.suppliers, params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Supplier>>('/inventory/suppliers/', { params });
      return response.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

export function useCreateSupplier(options?: UseMutationOptions<Supplier, Error, Partial<Supplier>>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Supplier>) => {
      const response = await apiClient.post<Supplier>('/inventory/suppliers/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.suppliers });
      toast.success('Supplier Created', 'Supplier has been created successfully');
    },
    onError: (error: any) => {
      toast.error('Creation Failed', error.message || 'Failed to create supplier');
    },
    ...options,
  });
}

// Purchase Order Hooks
export function usePurchaseOrders(params?: any, options?: UseQueryOptions<PaginatedResponse<PurchaseOrder>>) {
  return useQuery({
    queryKey: [...queryKeys.purchaseOrders, params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<PurchaseOrder>>('/inventory/purchase-orders/', { params });
      return response.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

export function useCreatePurchaseOrder(options?: UseMutationOptions<PurchaseOrder, Error, Partial<PurchaseOrder>>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<PurchaseOrder>) => {
      const response = await apiClient.post<PurchaseOrder>('/inventory/purchase-orders/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders });
      toast.success('Purchase Order Created', 'Purchase order has been created successfully');
    },
    onError: (error: any) => {
      toast.error('Creation Failed', error.message || 'Failed to create purchase order');
    },
    ...options,
  });
}
