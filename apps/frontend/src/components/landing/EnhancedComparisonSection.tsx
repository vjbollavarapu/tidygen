import * as React from "react";
import { Button } from "@/components/ui/enhanced-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/contexts/ThemeContext";
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
  Code,
  Crown,
  Star,
  ArrowRight,
  Github,
  ExternalLink,
} from "lucide-react";

interface EnhancedComparisonSectionProps {
  onDownloadCommunity: () => void;
  onTryDemo: () => void;
}

export function EnhancedComparisonSection({ 
  onDownloadCommunity, 
  onTryDemo 
}: EnhancedComparisonSectionProps) {
  const { isDark } = useTheme();

  const communityFeatures = [
    "Complete ERP functionality",
    "Client & inventory management",
    "Basic scheduling & reporting",
    "Employee management",
    "Self-hosted deployment",
    "Community support",
    "Open source code",
    "Single tenant",
    "Basic analytics",
    "Standard security"
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
    "Dedicated Support",
    "Real-time Collaboration",
    "Advanced Reporting",
    "Mobile App Access"
  ];

  const comparisonData = [
    {
      feature: "User Management",
      community: "Basic roles",
      enterprise: "Advanced RBAC with custom permissions"
    },
    {
      feature: "Analytics",
      community: "Basic reports",
      enterprise: "AI-powered insights & predictions"
    },
    {
      feature: "Security",
      community: "Standard security",
      enterprise: "Enterprise-grade with SSO"
    },
    {
      feature: "Support",
      community: "Community forum",
      enterprise: "24/7 dedicated support"
    },
    {
      feature: "Deployment",
      community: "Self-hosted only",
      enterprise: "Cloud, on-premise, or hybrid"
    },
    {
      feature: "Integrations",
      community: "Basic integrations",
      enterprise: "Unlimited custom integrations"
    }
  ];

  return (
    <section className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="outline" className="mb-4">
            <Crown className="h-3 w-3 mr-1" />
            Choose Your Edition
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold">
            Community vs Enterprise
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Start with our free Community Edition or upgrade to Enterprise for advanced features 
            and multi-tenant capabilities.
          </p>
        </div>

        {/* Main Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto mb-16">
          {/* Community Edition */}
          <Card className="relative border-2 hover:shadow-lg transition-all duration-200">
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Code className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Community Edition</CardTitle>
              </div>
              <Badge variant="secondary" className="w-fit mx-auto mb-4">
                <Github className="h-3 w-3 mr-1" />
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
                <Button className="w-full" variant="outline" onClick={onDownloadCommunity}>
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
          <Card className="relative border-2 border-primary shadow-lg hover:shadow-xl transition-all duration-200">
            <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
              <Badge className="bg-primary text-primary-foreground">
                <Sparkles className="h-3 w-3 mr-1" />
                Most Popular
              </Badge>
            </div>
            
            <CardHeader className="text-center pb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-2xl">Enterprise Edition</CardTitle>
              </div>
              <Badge variant="default" className="w-fit mx-auto mb-4">
                <Crown className="h-3 w-3 mr-1" />
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
                <Button className="w-full" onClick={onTryDemo}>
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

        {/* Detailed Comparison Table */}
        <div className="max-w-4xl mx-auto">
          <h3 className="text-2xl font-bold text-center mb-8">Detailed Feature Comparison</h3>
          
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-4 font-medium">Feature</th>
                      <th className="text-center p-4 font-medium">Community</th>
                      <th className="text-center p-4 font-medium">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonData.map((row, index) => (
                      <tr key={index} className="border-b last:border-b-0">
                        <td className="p-4 font-medium">{row.feature}</td>
                        <td className="p-4 text-center text-muted-foreground">
                          {row.community}
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <Check className="h-4 w-4 text-success" />
                            <span className="text-sm">{row.enterprise}</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Use Case Recommendations */}
        <div className="mt-16 grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Code className="h-5 w-5 text-primary" />
                <span>Choose Community If:</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">You're a small to medium cleaning business</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">You have technical expertise for self-hosting</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">You want full control over your data</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">You're comfortable with community support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5 text-primary" />
                <span>Choose Enterprise If:</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">You're a growing or large cleaning business</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">You need advanced analytics and AI insights</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">You want managed hosting and support</span>
                </li>
                <li className="flex items-start space-x-2">
                  <Check className="h-4 w-4 text-success mt-0.5 flex-shrink-0" />
                  <span className="text-sm">You plan to resell or white-label the solution</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="bg-card border rounded-lg p-8 max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-6">
              Try our Enterprise demo or download the Community edition to see how TidyGen 
              can transform your cleaning business.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={onTryDemo}>
                <Sparkles className="h-4 w-4 mr-2" />
                Try Enterprise Demo
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <Button size="lg" variant="outline" onClick={onDownloadCommunity}>
                <Github className="h-4 w-4 mr-2" />
                Download Community
                <ExternalLink className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
