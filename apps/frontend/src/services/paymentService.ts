import { apiClient } from '@/lib/api';

export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: string[];
  popular?: boolean;
}

export interface StripeCheckoutSession {
  id: string;
  url: string;
}

export interface PayPalSubscription {
  id: string;
  status: string;
  links: Array<{
    href: string;
    rel: string;
    method: string;
  }>;
}

export interface SubscriptionResult {
  success: boolean;
  subscriptionId?: string;
  planName?: string;
  nextBillingDate?: string;
  error?: string;
}

export interface PaymentError {
  message: string;
  code?: string;
  details?: any;
}

// Available payment plans
export const PAYMENT_PLANS: PaymentPlan[] = [
  {
    id: 'hosting-basic',
    name: 'Hosting Basic',
    price: 30,
    currency: 'USD',
    interval: 'month',
    features: [
      'Managed hosting & updates',
      'Daily backups',
      'SSL certificates',
      'Email support',
      '99.9% uptime guarantee'
    ]
  },
  {
    id: 'hosting-pro',
    name: 'Hosting Pro',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Everything in Basic',
      'Priority support',
      'Custom integrations',
      'Advanced monitoring',
      'Dedicated resources'
    ]
  },
  {
    id: 'pro-saas',
    name: 'Pro SaaS',
    price: 99,
    currency: 'USD',
    interval: 'month',
    features: [
      'Cloud-hosted solution',
      'Advanced analytics',
      'API access',
      'Priority support',
      'Custom integrations',
      'Multi-location support'
    ],
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 299,
    currency: 'USD',
    interval: 'month',
    features: [
      'Multi-tenant architecture',
      'AI-powered analytics',
      'White-label options',
      'Custom development',
      'Dedicated support',
      'Reseller program'
    ]
  }
];

/**
 * Create a Stripe checkout session for subscription
 */
export async function createStripeCheckoutSession(
  planId: string,
  userId: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<StripeCheckoutSession> {
  try {
    const response = await apiClient.post('/api/payments/stripe/create-checkout-session', {
      planId,
      userId,
      successUrl: successUrl || `${window.location.origin}/subscription/success`,
      cancelUrl: cancelUrl || `${window.location.origin}/subscription/cancelled`
    });

    return response.data as StripeCheckoutSession;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create Stripe checkout session');
  }
}

/**
 * Create a PayPal subscription
 */
export async function createPayPalSubscription(
  planId: string,
  userId: string,
  successUrl?: string,
  cancelUrl?: string
): Promise<PayPalSubscription> {
  try {
    const response = await apiClient.post('/api/payments/paypal/create-subscription', {
      planId,
      userId,
      successUrl: successUrl || `${window.location.origin}/subscription/success`,
      cancelUrl: cancelUrl || `${window.location.origin}/subscription/cancelled`
    });

    return response.data as PayPalSubscription;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to create PayPal subscription');
  }
}

/**
 * Get user's current subscription
 */
export async function getCurrentSubscription(): Promise<SubscriptionResult> {
  try {
    const response = await apiClient.get('/api/payments/subscription/current');
    return response.data as SubscriptionResult;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get current subscription');
  }
}

/**
 * Cancel user's subscription
 */
export async function cancelSubscription(subscriptionId: string): Promise<SubscriptionResult> {
  try {
    const response = await apiClient.post('/api/payments/subscription/cancel', {
      subscriptionId
    });
    return response.data as SubscriptionResult;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to cancel subscription');
  }
}

/**
 * Update subscription plan
 */
export async function updateSubscription(
  subscriptionId: string,
  newPlanId: string
): Promise<SubscriptionResult> {
  try {
    const response = await apiClient.post('/api/payments/subscription/update', {
      subscriptionId,
      newPlanId
    });
    return response.data as SubscriptionResult;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update subscription');
  }
}

/**
 * Get subscription history
 */
export async function getSubscriptionHistory(): Promise<any[]> {
  try {
    const response = await apiClient.get('/api/payments/subscription/history');
    return response.data as any[];
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to get subscription history');
  }
}

/**
 * Validate payment plan
 */
export function validatePaymentPlan(planId: string): PaymentPlan | null {
  return PAYMENT_PLANS.find(plan => plan.id === planId) || null;
}

/**
 * Format price for display
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency
  }).format(price);
}

/**
 * Get plan by ID
 */
export function getPlanById(planId: string): PaymentPlan | null {
  return PAYMENT_PLANS.find(plan => plan.id === planId) || null;
}
