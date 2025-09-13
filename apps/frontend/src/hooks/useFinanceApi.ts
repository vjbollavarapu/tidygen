/**
 * Finance API hooks using React Query
 */

import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { toast } from '@/components/ui/enhanced-notifications';
import apiClient, { PaginatedResponse, Invoice, Customer, Payment, Expense } from '@/services/api';
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

// Invoice Hooks
export function useInvoices(params?: any, options?: UseQueryOptions<PaginatedResponse<Invoice>>) {
  return useQuery({
    queryKey: [...queryKeys.invoices, params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Invoice>>('/finance/invoices/', { params });
      return response.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

export function useInvoice(id: number, options?: UseQueryOptions<Invoice>) {
  return useQuery({
    queryKey: queryKeys.invoice(id),
    queryFn: async () => {
      const response = await apiClient.get<Invoice>(`/finance/invoices/${id}/`);
      return response.data;
    },
    enabled: !!id,
    ...defaultQueryOptions,
    ...options,
  });
}

export function useCreateInvoice(options?: UseMutationOptions<Invoice, Error, Partial<Invoice>>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Invoice>) => {
      const response = await apiClient.post<Invoice>('/finance/invoices/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      toast.success('Invoice Created', 'Invoice has been created successfully');
    },
    onError: (error: any) => {
      toast.error('Creation Failed', error.message || 'Failed to create invoice');
    },
    ...options,
  });
}

export function useUpdateInvoice(options?: UseMutationOptions<Invoice, Error, { id: number; data: Partial<Invoice> }>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<Invoice> }) => {
      const response = await apiClient.patch<Invoice>(`/finance/invoices/${id}/`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      queryClient.setQueryData(queryKeys.invoice(data.id), data);
      toast.success('Invoice Updated', 'Invoice has been updated successfully');
    },
    onError: (error: any) => {
      toast.error('Update Failed', error.message || 'Failed to update invoice');
    },
    ...options,
  });
}

// Customer Hooks
export function useCustomers(params?: any, options?: UseQueryOptions<PaginatedResponse<Customer>>) {
  return useQuery({
    queryKey: [...queryKeys.customers, params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Customer>>('/finance/customers/', { params });
      return response.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

export function useCreateCustomer(options?: UseMutationOptions<Customer, Error, Partial<Customer>>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Customer>) => {
      const response = await apiClient.post<Customer>('/finance/customers/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers });
      toast.success('Customer Created', 'Customer has been created successfully');
    },
    onError: (error: any) => {
      toast.error('Creation Failed', error.message || 'Failed to create customer');
    },
    ...options,
  });
}

// Payment Hooks
export function usePayments(params?: any, options?: UseQueryOptions<PaginatedResponse<Payment>>) {
  return useQuery({
    queryKey: [...queryKeys.payments, params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Payment>>('/finance/payments/', { params });
      return response.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

export function useCreatePayment(options?: UseMutationOptions<Payment, Error, Partial<Payment>>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Payment>) => {
      const response = await apiClient.post<Payment>('/finance/payments/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.payments });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices });
      toast.success('Payment Recorded', 'Payment has been recorded successfully');
    },
    onError: (error: any) => {
      toast.error('Payment Failed', error.message || 'Failed to record payment');
    },
    ...options,
  });
}

// Expense Hooks
export function useExpenses(params?: any, options?: UseQueryOptions<PaginatedResponse<Expense>>) {
  return useQuery({
    queryKey: [...queryKeys.expenses, params],
    queryFn: async () => {
      const response = await apiClient.get<PaginatedResponse<Expense>>('/finance/expenses/', { params });
      return response.data;
    },
    ...defaultQueryOptions,
    ...options,
  });
}

export function useCreateExpense(options?: UseMutationOptions<Expense, Error, Partial<Expense>>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Expense>) => {
      const response = await apiClient.post<Expense>('/finance/expenses/', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.expenses });
      toast.success('Expense Recorded', 'Expense has been recorded successfully');
    },
    onError: (error: any) => {
      toast.error('Expense Failed', error.message || 'Failed to record expense');
    },
    ...options,
  });
}
