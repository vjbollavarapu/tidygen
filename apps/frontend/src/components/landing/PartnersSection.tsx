import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Handshake, 
  Building2, 
  Users, 
  DollarSign, 
  ArrowRight,
  CheckCircle,
  Star,
  Globe,
  Shield,
  Zap
} from "lucide-react";

export function PartnersSection() {
  const partnerBenefits = [
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Revenue Sharing",
      description: "Earn up to 30% commission on every sale you generate."
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "White-Label Options",
      description: "Rebrand TidyGen as your own solution with custom branding."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Dedicated Support",
      description: "Get dedicated partner support and training for your team."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Partner Portal",
      description: "Access exclusive resources, training, and marketing materials."
    }
  ];

  const partnerTiers = [
    {
      name: "Reseller",
      description: "Perfect for consultants and small agencies",
      requirements: "Minimum 2 sales per quarter",
      benefits: [
        "20% commission on sales",
        "Basic white-label options",
        "Partner portal access",
        "Email support",
        "Marketing materials"
      ],
      popular: false
    },
    {
      name: "Partner",
      description: "Ideal for established software companies",
      requirements: "Minimum 5 sales per quarter",
      benefits: [
        "25% commission on sales",
        "Full white-label options",
        "Priority support",
        "Custom integrations",
        "Co-marketing opportunities",
        "Dedicated account manager"
      ],
      popular: true
    },
    {
      name: "Enterprise Partner",
      description: "For large system integrators and consultants",
      requirements: "Minimum 10 sales per quarter",
      benefits: [
        "30% commission on sales",
        "Custom development support",
        "24/7 priority support",
        "Exclusive territory rights",
        "Joint go-to-market strategies",
        "Executive relationship management"
      ],
      popular: false
    }
  ];

  const successStories = [
    {
      company: "CleanTech Solutions",
      type: "Software Partner",
      result: "Generated $500K+ in revenue",
      quote: "TidyGen's partner program has been instrumental in our growth. The multi-tenant capabilities and white-label options are exceptional."
    },
    {
      company: "ProClean Consulting",
      type: "Reseller",
      result: "200+ successful implementations",
      quote: "The comprehensive training and marketing materials made it easy to sell and implement TidyGen for our clients."
    },
    {
      company: "Enterprise Systems Inc",
      type: "Enterprise Partner",
      result: "Expanded to 5 new markets",
      quote: "The partnership with TidyGen has opened new opportunities and helped us establish a strong presence in the cleaning industry."
    }
  ];

  return (
    <section id="partners" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Partner with TidyGen
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Join our partner ecosystem and help enterprises worldwide 
            transform their operations with our multi-tenant ERP platform while growing your revenue.
          </p>
        </div>

        {/* Partner Benefits */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {partnerBenefits.map((benefit, index) => (
            <Card key={index} className="text-center">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                  {benefit.icon}
                </div>
                <h3 className="font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Partner Tiers */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Partner Tiers</h3>
          <div className="grid lg:grid-cols-3 gap-8">
            {partnerTiers.map((tier, index) => (
              <Card key={index} className={`relative ${tier.popular ? 'border-primary shadow-lg' : 'border'}`}>
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-xl">{tier.name}</CardTitle>
                  <p className="text-muted-foreground">{tier.description}</p>
                  <Badge variant="outline" className="w-fit mx-auto">
                    {tier.requirements}
                  </Badge>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {tier.benefits.map((benefit, benefitIndex) => (
                      <div key={benefitIndex} className="flex items-center space-x-3">
                        <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                        <span className="text-sm">{benefit}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="pt-6 border-t">
                    <Button className="w-full" variant={tier.popular ? "default" : "outline"}>
                      Apply Now
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Success Stories */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">Partner Success Stories</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {successStories.map((story, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold">{story.company}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {story.type}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      "{story.quote}"
                    </div>
                    <div className="text-sm font-medium text-primary">
                      {story.result}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-card border rounded-lg p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-center space-x-2">
              <Handshake className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold">Ready to Partner with Us?</h3>
            </div>
            <p className="text-muted-foreground">
              Join our growing partner ecosystem and help enterprises worldwide 
              achieve operational excellence with our scalable ERP platform while building your own success.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                Become a Partner
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline">
                Download Partner Kit
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Globe className="h-4 w-4" />
                <span>Global Reach</span>
              </div>
              <div className="flex items-center space-x-1">
                <Zap className="h-4 w-4" />
                <span>Fast Onboarding</span>
              </div>
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Protected Territories</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
