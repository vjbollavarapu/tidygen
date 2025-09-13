import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Download, 
  Sparkles, 
  Server, 
  Cloud, 
  Building2,
  ArrowRight,
  Star
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { SubscriptionModal } from "@/components/subscription/SubscriptionModal";
import { PAYMENT_PLANS } from "@/services/paymentService";

interface PricingSectionProps {
  onDownloadCommunity: () => void;
  onTryDemo: () => void;
}

export function PricingSection({ onDownloadCommunity, onTryDemo }: PricingSectionProps) {
  const [subscriptionModalOpen, setSubscriptionModalOpen] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const pricingPlans = [
    {
      id: "community",
      name: "Community",
      description: "Free, open-source, self-hosted",
      price: "$0",
      period: "forever",
      icon: <Download className="h-6 w-6" />,
      popular: false,
      features: [
        "Complete ERP functionality",
        "Client & inventory management",
        "Basic scheduling & reporting",
        "Employee management",
        "Self-hosted deployment",
        "Community support",
        "Open source code",
        "Single tenant"
      ],
      cta: "Download Community",
      ctaAction: onDownloadCommunity,
      ctaVariant: "outline" as const,
      requiresAuth: false
    },
    {
      id: "hosting-basic",
      name: "Hosting",
      description: "Managed hosting for Community Edition",
      price: "$30",
      period: "per month",
      icon: <Server className="h-6 w-6" />,
      popular: false,
      features: [
        "Everything in Community",
        "Managed hosting & updates",
        "Daily backups",
        "SSL certificates",
        "Email support",
        "99.9% uptime guarantee",
        "Regular maintenance",
        "Security monitoring"
      ],
      cta: "Get Hosting",
      ctaAction: () => handleSubscribe("hosting-basic"),
      ctaVariant: "outline" as const,
      requiresAuth: true
    },
    {
      id: "pro-saas",
      name: "Pro SaaS",
      description: "Cloud-hosted with advanced features",
      price: "$99",
      period: "per month",
      icon: <Cloud className="h-6 w-6" />,
      popular: true,
      features: [
        "Everything in Hosting",
        "Advanced analytics",
        "API access",
        "Priority support",
        "Custom integrations",
        "Advanced scheduling",
        "Multi-location support",
        "Advanced reporting"
      ],
      cta: "Start Free Trial",
      ctaAction: () => handleSubscribe("pro-saas"),
      ctaVariant: "default" as const,
      requiresAuth: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "Multi-tenant SaaS with AI features",
      price: "$299",
      period: "per month",
      icon: <Building2 className="h-6 w-6" />,
      popular: false,
      features: [
        "Everything in Pro SaaS",
        "Multi-tenant architecture",
        "AI-powered analytics",
        "White-label options",
        "Custom development",
        "Dedicated support",
        "Reseller program",
        "Advanced security"
      ],
      cta: "Contact Sales",
      ctaAction: () => handleSubscribe("enterprise"),
      ctaVariant: "default" as const,
      requiresAuth: true
    }
  ];

  const handleSubscribe = (planId: string) => {
    if (!isAuthenticated) {
      // Redirect to login with return URL
      navigate('/login', { state: { from: { pathname: '/#pricing' } } });
      return;
    }

    setSelectedPlanId(planId);
    setSubscriptionModalOpen(true);
  };

  return (
    <section id="pricing" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Choose the plan that fits your business needs. Start free with Community Edition 
            or upgrade to our cloud-hosted solutions.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <Card key={index} className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : 'border'}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground">
                    <Star className="h-3 w-3 mr-1" />
                    Most Popular
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className={`p-2 rounded-lg ${plan.popular ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {plan.icon}
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                
                <div className="space-y-1">
                  <div className="text-3xl font-bold">{plan.price}</div>
                  <div className="text-sm text-muted-foreground">{plan.period}</div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start space-x-3">
                      <Check className="h-4 w-4 text-success flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t">
                  <Button 
                    className="w-full" 
                    variant={plan.ctaVariant}
                    onClick={plan.ctaAction}
                  >
                    {plan.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Pricing Info */}
        <div className="mt-16 text-center space-y-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <h3 className="font-semibold">Free Trial</h3>
              <p className="text-sm text-muted-foreground">
                14-day free trial for all paid plans. No credit card required.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Volume Discounts</h3>
              <p className="text-sm text-muted-foreground">
                Special pricing for 10+ users. Contact us for custom quotes.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold">Money Back Guarantee</h3>
              <p className="text-sm text-muted-foreground">
                30-day money-back guarantee on all paid plans.
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-semibold mb-2">Need a Custom Solution?</h3>
            <p className="text-sm text-muted-foreground mb-4">
              We offer custom development, on-premise deployment, and enterprise integrations. 
              Contact our sales team for a personalized quote.
            </p>
            <Button variant="outline">
              Contact Sales
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>

      {/* Subscription Modal */}
      {selectedPlanId && (
        <SubscriptionModal
          isOpen={subscriptionModalOpen}
          onClose={() => {
            setSubscriptionModalOpen(false);
            setSelectedPlanId(null);
          }}
          planId={selectedPlanId}
        />
      )}
    </section>
  );
}
