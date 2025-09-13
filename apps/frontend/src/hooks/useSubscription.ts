import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useTenant } from '@/contexts/TenantContext';
import { toast } from '@/components/ui/enhanced-notifications';
import apiClient from '@/services/api';

// Subscription Types
export interface Subscription {
  id: string;
  tenant_id: string;
  plan: 'free' | 'pro' | 'enterprise';
  status: 'active' | 'trial' | 'past_due' | 'canceled' | 'suspended';
  current_period_start: string;
  current_period_end: string;
  cancel_at_period_end: boolean;
  trial_end?: string;
  quantity: number;
  metadata: {
    stripe_subscription_id?: string;
    stripe_customer_id?: string;
    payment_method?: string;
    billing_cycle_anchor?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface SubscriptionUsage {
  tenant_id: string;
  period_start: string;
  period_end: string;
  usage: {
    users: {
      current: number;
      limit: number;
    };
    storage: {
      current: number; // in bytes
      limit: number; // in bytes
    };
    api_calls: {
      current: number;
      limit: number;
    };
    custom_domains: {
      current: number;
      limit: number;
    };
  };
  billing: {
    base_amount: number;
    usage_amount: number;
    total_amount: number;
    currency: string;
  };
}

export interface BillingHistory {
  id: string;
  tenant_id: string;
  subscription_id: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  description: string;
  period_start: string;
  period_end: string;
  invoice_url?: string;
  receipt_url?: string;
  created_at: string;
}

export interface PlanFeature {
  id: string;
  name: string;
  description: string;
  included: boolean;
  limit?: number;
  overage_price?: number;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  interval: 'month' | 'year';
  features: PlanFeature[];
  limits: {
    users: number;
    storage: number; // in bytes
    api_calls: number;
    custom_domains: number;
  };
  popular?: boolean;
  trial_days: number;
}

// API Functions
const subscriptionApi = {
  getCurrentSubscription: () => apiClient.get<Subscription>('/subscriptions/current/'),
  getUsage: (subscriptionId: string) => apiClient.get<SubscriptionUsage>(`/subscriptions/${subscriptionId}/usage/`),
  getBillingHistory: () => apiClient.get<BillingHistory[]>('/subscriptions/billing-history/'),
  getAvailablePlans: () => apiClient.get<SubscriptionPlan[]>('/subscriptions/plans/'),
  
  createSubscription: (planId: string, paymentMethodId?: string) =>
    apiClient.post<Subscription>('/subscriptions/', {
      plan_id: planId,
      payment_method_id: paymentMethodId,
    }),
  
  updateSubscription: (subscriptionId: string, planId: string) =>
    apiClient.patch<Subscription>(`/subscriptions/${subscriptionId}/`, {
      plan_id: planId,
    }),
  
  cancelSubscription: (subscriptionId: string, immediately = false) =>
    apiClient.post(`/subscriptions/${subscriptionId}/cancel/`, {
      immediately,
    }),
  
  resumeSubscription: (subscriptionId: string) =>
    apiClient.post(`/subscriptions/${subscriptionId}/resume/`),
  
  updatePaymentMethod: (subscriptionId: string, paymentMethodId: string) =>
    apiClient.patch(`/subscriptions/${subscriptionId}/payment-method/`, {
      payment_method_id: paymentMethodId,
    }),
  
  getUpcomingInvoice: (subscriptionId: string) =>
    apiClient.get(`/subscriptions/${subscriptionId}/upcoming-invoice/`),
};

// Custom Hooks
export function useCurrentSubscription() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['subscription', 'current', currentTenant?.id],
    queryFn: subscriptionApi.getCurrentSubscription,
    enabled: !!currentTenant,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useSubscriptionUsage(subscriptionId?: string) {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['subscription', 'usage', subscriptionId],
    queryFn: () => subscriptionApi.getUsage(subscriptionId!),
    enabled: !!subscriptionId && !!currentTenant,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

export function useBillingHistory() {
  const { currentTenant } = useTenant();
  
  return useQuery({
    queryKey: ['subscription', 'billing-history', currentTenant?.id],
    queryFn: subscriptionApi.getBillingHistory,
    enabled: !!currentTenant,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAvailablePlans() {
  return useQuery({
    queryKey: ['subscription', 'plans'],
    queryFn: subscriptionApi.getAvailablePlans,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();
  const { currentTenant } = useTenant();
  
  return useMutation({
    mutationFn: ({ planId, paymentMethodId }: { planId: string; paymentMethodId?: string }) =>
      subscriptionApi.createSubscription(planId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Subscription Created', 'Your subscription has been activated successfully');
    },
    onError: (error: any) => {
      toast.error('Subscription Failed', error.response?.data?.detail || 'Failed to create subscription');
    },
  });
}

export function useUpdateSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, planId }: { subscriptionId: string; planId: string }) =>
      subscriptionApi.updateSubscription(subscriptionId, planId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Plan Updated', 'Your subscription plan has been updated successfully');
    },
    onError: (error: any) => {
      toast.error('Update Failed', error.response?.data?.detail || 'Failed to update subscription');
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, immediately }: { subscriptionId: string; immediately?: boolean }) =>
      subscriptionApi.cancelSubscription(subscriptionId, immediately),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      queryClient.invalidateQueries({ queryKey: ['tenant'] });
      toast.success('Subscription Canceled', 'Your subscription has been canceled successfully');
    },
    onError: (error: any) => {
      toast.error('Cancellation Failed', error.response?.data?.detail || 'Failed to cancel subscription');
    },
  });
}

export function useResumeSubscription() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: subscriptionApi.resumeSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Subscription Resumed', 'Your subscription has been resumed successfully');
    },
    onError: (error: any) => {
      toast.error('Resume Failed', error.response?.data?.detail || 'Failed to resume subscription');
    },
  });
}

export function useUpdatePaymentMethod() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ subscriptionId, paymentMethodId }: { subscriptionId: string; paymentMethodId: string }) =>
      subscriptionApi.updatePaymentMethod(subscriptionId, paymentMethodId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription'] });
      toast.success('Payment Method Updated', 'Your payment method has been updated successfully');
    },
    onError: (error: any) => {
      toast.error('Update Failed', error.response?.data?.detail || 'Failed to update payment method');
    },
  });
}

export function useUpcomingInvoice(subscriptionId?: string) {
  return useQuery({
    queryKey: ['subscription', 'upcoming-invoice', subscriptionId],
    queryFn: () => subscriptionApi.getUpcomingInvoice(subscriptionId!),
    enabled: !!subscriptionId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Utility Hooks
export function useSubscriptionStatus() {
  const { data: subscription } = useCurrentSubscription();
  
  return {
    isActive: subscription?.status === 'active',
    isTrial: subscription?.status === 'trial',
    isPastDue: subscription?.status === 'past_due',
    isCanceled: subscription?.status === 'canceled',
    isSuspended: subscription?.status === 'suspended',
    plan: subscription?.plan || 'free',
    cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
    trialEnd: subscription?.trial_end,
    currentPeriodEnd: subscription?.current_period_end,
  };
}

export function usePlanLimits() {
  const { data: subscription } = useCurrentSubscription();
  const { data: usage } = useSubscriptionUsage(subscription?.id);
  
  const getUsagePercentage = (type: 'users' | 'storage' | 'api_calls' | 'custom_domains') => {
    if (!usage) return 0;
    
    const current = usage.usage[type].current;
    const limit = usage.usage[type].limit;
    
    return limit > 0 ? (current / limit) * 100 : 0;
  };
  
  const isOverLimit = (type: 'users' | 'storage' | 'api_calls' | 'custom_domains') => {
    if (!usage) return false;
    return usage.usage[type].current > usage.usage[type].limit;
  };
  
  return {
    usage,
    getUsagePercentage,
    isOverLimit,
    isLoading: !subscription || !usage,
  };
}

export function useBillingInfo() {
  const { data: subscription } = useCurrentSubscription();
  const { data: billingHistory } = useBillingHistory();
  const { data: upcomingInvoice } = useUpcomingInvoice(subscription?.id);
  
  return {
    subscription,
    billingHistory: billingHistory || [],
    upcomingInvoice,
    isLoading: !subscription,
  };
}

// Plan Comparison Hook
export function usePlanComparison() {
  const { data: plans } = useAvailablePlans();
  const { plan: currentPlan } = useSubscriptionStatus();
  
  const getPlanById = (planId: string) => {
    return plans?.find(plan => plan.id === planId);
  };
  
  const getUpgradeOptions = () => {
    if (!plans) return [];
    
    const planHierarchy = ['free', 'pro', 'enterprise'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    
    return plans.filter(plan => 
      planHierarchy.indexOf(plan.id) > currentIndex
    );
  };
  
  const getDowngradeOptions = () => {
    if (!plans) return [];
    
    const planHierarchy = ['free', 'pro', 'enterprise'];
    const currentIndex = planHierarchy.indexOf(currentPlan);
    
    return plans.filter(plan => 
      planHierarchy.indexOf(plan.id) < currentIndex
    );
  };
  
  return {
    plans: plans || [],
    currentPlan,
    getPlanById,
    getUpgradeOptions,
    getDowngradeOptions,
    isLoading: !plans,
  };
}

export default {
  useCurrentSubscription,
  useSubscriptionUsage,
  useBillingHistory,
  useAvailablePlans,
  useCreateSubscription,
  useUpdateSubscription,
  useCancelSubscription,
  useResumeSubscription,
  useUpdatePaymentMethod,
  useUpcomingInvoice,
  useSubscriptionStatus,
  usePlanLimits,
  useBillingInfo,
  usePlanComparison,
};
