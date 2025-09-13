import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  X, 
  Download, 
  Sparkles, 
  Lock, 
  Users, 
  Building2,
  Zap,
  Shield,
  Globe,
  BarChart3,
  Settings,
  Headphones,
  Code
} from "lucide-react";

export function VersionsSection() {
  const communityFeatures = [
    "Client Management",
    "Inventory Tracking",
    "Basic Scheduling",
    "Financial Reports",
    "Employee Management",
    "Basic Analytics",
    "Self-Hosted",
    "Community Support",
    "Open Source",
    "Single Tenant"
  ];

  const enterpriseFeatures = [
    "Everything in Community",
    "Advanced AI Analytics",
    "Multi-Tenant SaaS",
    "Advanced Scheduling",
    "Custom Integrations",
    "White-Label Options",
    "Priority Support",
    "Advanced Security",
    "API Access",
    "Custom Development",
    "Reseller Program",
    "Dedicated Support"
  ];

  return (
    <section id="features" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Choose Your Edition
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start with our free Community Edition or upgrade to Enterprise for advanced features 
            and multi-tenant capabilities.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Community Edition */}
          <Card className="relative border-2">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Code className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Community Edition</CardTitle>
              </div>
              <Badge variant="secondary" className="w-fit mx-auto">
                Free & Open Source
              </Badge>
              <div className="text-4xl font-bold mt-4">$0</div>
              <p className="text-muted-foreground">Self-hosted, single tenant</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {communityFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t">
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Community
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Perfect for small to medium cleaning businesses
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Enterprise Edition */}
          <Card className="relative border-2 border-primary shadow-lg">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Building2 className="h-8 w-8 text-primary" />
                <CardTitle className="text-2xl">Enterprise Edition</CardTitle>
              </div>
              <Badge variant="default" className="w-fit mx-auto">
                Multi-Tenant SaaS
              </Badge>
              <div className="text-4xl font-bold mt-4">$299<span className="text-lg text-muted-foreground">/mo</span></div>
              <p className="text-muted-foreground">Cloud-hosted, multi-tenant</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {enterpriseFeatures.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
              
              <div className="pt-6 border-t">
                <Button className="w-full">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Try Enterprise Demo
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Ideal for growing businesses and resellers
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Comparison */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-center mb-8">Detailed Feature Comparison</h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">User Management</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Community:</span>
                  <span className="text-muted-foreground">Basic roles</span>
                </div>
                <div className="flex justify-between">
                  <span>Enterprise:</span>
                  <span className="text-success">Advanced RBAC</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Analytics</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Community:</span>
                  <span className="text-muted-foreground">Basic reports</span>
                </div>
                <div className="flex justify-between">
                  <span>Enterprise:</span>
                  <span className="text-success">AI-powered insights</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <h4 className="font-semibold">Security</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Community:</span>
                  <span className="text-muted-foreground">Standard security</span>
                </div>
                <div className="flex justify-between">
                  <span>Enterprise:</span>
                  <span className="text-success">Enterprise-grade</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
