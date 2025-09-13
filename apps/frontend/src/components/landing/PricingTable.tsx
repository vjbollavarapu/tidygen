import React, { useState } from 'react';
import { Check, X, Star, Zap, Shield, Users, Building, Globe, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/enhanced-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface PricingPlan {
  id: string;
  name: string;
  description: string;
  price: {
    monthly: number;
    yearly: number;
  };
  currency: string;
  period: 'month' | 'year';
  features: PricingFeature[];
  limits: {
    users: number;
    storage: string;
    api_calls: string;
    support: string;
  };
  popular?: boolean;
  cta: string;
  ctaVariant: 'default' | 'outline' | 'secondary';
  icon: React.ComponentType<any>;
  color: string;
}

interface PricingFeature {
  name: string;
  included: boolean;
  description?: string;
  category: 'core' | 'advanced' | 'enterprise' | 'support';
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Perfect for small to medium businesses getting started',
    price: {
      monthly: 49,
      yearly: 490,
    },
    currency: 'USD',
    period: 'month',
    features: [
      { name: 'Core ERP Modules', included: true, category: 'core' },
      { name: 'Inventory Management', included: true, category: 'core' },
      { name: 'Financial Management', included: true, category: 'core' },
      { name: 'User Management', included: true, category: 'core' },
      { name: 'Basic Analytics', included: true, category: 'advanced' },
      { name: 'API Access', included: true, category: 'advanced' },
      { name: 'Email Support', included: true, category: 'support' },
      { name: 'Basic Reporting', included: true, category: 'core' },
      { name: 'Multi-currency', included: true, category: 'advanced' },
      { name: 'Automated Backups', included: true, category: 'advanced' },
      { name: 'White-label', included: false, category: 'enterprise' },
      { name: 'Custom Domain', included: false, category: 'enterprise' },
    ],
    limits: {
      users: 10,
      storage: '25GB',
      api_calls: '25K/month',
      support: 'Email',
    },
    cta: 'Start Free Trial',
    ctaVariant: 'outline',
    icon: Users,
    color: 'text-blue-600',
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Advanced solution for growing enterprises',
    price: {
      monthly: 149,
      yearly: 1490,
    },
    currency: 'USD',
    period: 'month',
    features: [
      { name: 'Everything in Starter', included: true, category: 'core' },
      { name: 'Advanced Analytics', included: true, category: 'advanced' },
      { name: 'Priority Support', included: true, category: 'support' },
      { name: 'Custom Integrations', included: true, category: 'advanced' },
      { name: 'Advanced Reporting', included: true, category: 'advanced' },
      { name: 'Multi-tenant Support', included: true, category: 'enterprise' },
      { name: 'White-label Branding', included: true, category: 'enterprise' },
      { name: 'Custom Domain', included: true, category: 'enterprise' },
      { name: 'Partner Portal Access', included: true, category: 'enterprise' },
      { name: 'Advanced Security', included: true, category: 'enterprise' },
      { name: 'Dedicated Support', included: false, category: 'support' },
      { name: 'SLA Guarantee', included: false, category: 'enterprise' },
    ],
    limits: {
      users: 50,
      storage: '100GB',
      api_calls: '100K/month',
      support: 'Priority',
    },
    popular: true,
    cta: 'Start Free Trial',
    ctaVariant: 'default',
    icon: Zap,
    color: 'text-purple-600',
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Complete solution for large organizations and resellers',
    price: {
      monthly: 299,
      yearly: 2990,
    },
    currency: 'USD',
    period: 'month',
    features: [
      { name: 'Everything in Professional', included: true, category: 'core' },
      { name: 'Full White-label Solution', included: true, category: 'enterprise' },
      { name: 'Unlimited Custom Domains', included: true, category: 'enterprise' },
      { name: '24/7 Dedicated Support', included: true, category: 'support' },
      { name: '99.9% SLA Guarantee', included: true, category: 'enterprise' },
      { name: 'Custom Development', included: true, category: 'enterprise' },
      { name: 'Advanced Compliance Tools', included: true, category: 'enterprise' },
      { name: 'Full Reseller Program', included: true, category: 'enterprise' },
      { name: 'Commission Tracking', included: true, category: 'enterprise' },
      { name: 'Training & Onboarding', included: true, category: 'support' },
      { name: 'Dedicated Account Manager', included: true, category: 'support' },
      { name: 'Custom Integrations', included: true, category: 'advanced' },
    ],
    limits: {
      users: 'Unlimited',
      storage: '1TB',
      api_calls: 'Unlimited',
      support: '24/7',
    },
    cta: 'Contact Sales',
    ctaVariant: 'default',
    icon: Shield,
    color: 'text-green-600',
  },
];

const featureCategories = {
  core: { name: 'Core Features', icon: Building },
  advanced: { name: 'Advanced Features', icon: Zap },
  enterprise: { name: 'Enterprise Features', icon: Shield },
  support: { name: 'Support & Services', icon: Users },
};

export function PricingTable() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const getPrice = (plan: PricingPlan) => {
    const price = billingPeriod === 'yearly' ? plan.price.yearly : plan.price.monthly;
    return price;
  };

  const getSavings = (plan: PricingPlan) => {
    if (billingPeriod === 'yearly') {
      const monthlyTotal = plan.price.monthly * 12;
      const yearlyPrice = plan.price.yearly;
      const savings = monthlyTotal - yearlyPrice;
      return savings > 0 ? savings : 0;
    }
    return 0;
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
    
    // Handle different CTAs
    switch (planId) {
      case 'starter':
        window.location.href = '/signup?plan=starter';
        break;
      case 'professional':
        window.location.href = '/signup?plan=professional';
        break;
      case 'enterprise':
        window.location.href = '/contact?plan=enterprise';
        break;
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4">
            <Star className="h-3 w-3 mr-1" />
            Commercial Pricing
          </Badge>
          <h2 className="text-4xl font-bold mb-4">
            Choose the Perfect Plan for Your Business
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Enterprise-grade ERP solutions designed for businesses, dealers, and resellers. 
            Start with a free trial and scale as you grow.
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex justify-center mb-12">
          <Tabs value={billingPeriod} onValueChange={(value: any) => setBillingPeriod(value)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
              <TabsTrigger value="yearly">
                Yearly
                <Badge variant="secondary" className="ml-2">
                  Save 20%
                </Badge>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan) => {
            const Icon = plan.icon;
            const price = getPrice(plan);
            const savings = getSavings(plan);
            const isSelected = selectedPlan === plan.id;

            return (
              <Card 
                key={plan.id} 
                className={cn(
                  "relative transition-all duration-200 hover:shadow-lg",
                  plan.popular && "ring-2 ring-primary shadow-lg scale-105",
                  isSelected && "ring-2 ring-primary"
                )}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={cn("h-12 w-12 rounded-lg flex items-center justify-center", 
                      plan.color.replace('text-', 'bg-').replace('-600', '/10')
                    )}>
                      <Icon className={cn("h-6 w-6", plan.color)} />
                    </div>
                  </div>
                  
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <p className="text-muted-foreground">{plan.description}</p>
                  
                  <div className="mt-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">
                        {price === 0 ? 'Free' : `$${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-muted-foreground ml-1">
                          /{billingPeriod === 'yearly' ? 'year' : 'month'}
                        </span>
                      )}
                    </div>
                    {savings > 0 && (
                      <p className="text-sm text-green-600 mt-1">
                        Save ${savings}/year
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Limits */}
                  <div className="space-y-2">
                    <h4 className="font-semibold">Includes:</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex items-center">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        {plan.limits.users} users
                      </div>
                      <div className="flex items-center">
                        <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                        {plan.limits.storage}
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {Object.entries(featureCategories).map(([categoryKey, category]) => {
                      const categoryFeatures = plan.features.filter(f => f.category === categoryKey);
                      if (categoryFeatures.length === 0) return null;

                      return (
                        <div key={categoryKey}>
                          <h4 className="font-semibold text-sm mb-2 flex items-center">
                            <category.icon className="h-4 w-4 mr-2" />
                            {category.name}
                          </h4>
                          <div className="space-y-1">
                            {categoryFeatures.map((feature, index) => (
                              <div key={index} className="flex items-center text-sm">
                                {feature.included ? (
                                  <Check className="h-4 w-4 text-green-600 mr-2 flex-shrink-0" />
                                ) : (
                                  <X className="h-4 w-4 text-muted-foreground mr-2 flex-shrink-0" />
                                )}
                                <span className={cn(
                                  !feature.included && "text-muted-foreground"
                                )}>
                                  {feature.name}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className="w-full"
                    variant={plan.ctaVariant}
                    size="lg"
                    onClick={() => handlePlanSelect(plan.id)}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-4">
            All plans include 30-day money-back guarantee
          </p>
          <div className="flex justify-center space-x-8 text-sm text-muted-foreground">
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              No setup fees
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Cancel anytime
            </div>
            <div className="flex items-center">
              <Check className="h-4 w-4 mr-2 text-green-600" />
              Free migration
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingTable;
