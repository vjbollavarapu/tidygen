import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Check, 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe, 
  Headphones, 
  Settings,
  Lock,
  Server,
  Cloud,
  Code,
  Palette,
  Award,
  DollarSign,
  TrendingUp,
  Network,
  Database,
  Smartphone,
  Mail,
  Calendar,
  FileText
} from "lucide-react";

export function FeaturesSection() {
  const coreFeatures = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Multi-Tenant Architecture",
      description: "Complete data isolation with secure tenant management for enterprises and resellers.",
      benefits: ["Data Security", "Scalable Infrastructure", "Tenant Management"]
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Role-Based Access Control",
      description: "Granular permissions and user management with advanced security controls.",
      benefits: ["Secure Access", "Custom Roles", "Audit Trails"]
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "AI-powered business intelligence with real-time reporting and insights.",
      benefits: ["Predictive Analytics", "Custom Dashboards", "Export Reports"]
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-grade security with encryption, compliance, and monitoring.",
      benefits: ["SOC 2 Compliance", "Data Encryption", "Security Monitoring"]
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "API-First Design",
      description: "Comprehensive REST APIs with SDKs for seamless integrations.",
      benefits: ["REST APIs", "Webhooks", "SDKs Available"]
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "White-Label Branding",
      description: "Custom branding options for resellers and enterprise customers.",
      benefits: ["Custom Domains", "Brand Colors", "Logo Upload"]
    }
  ];

  const enterpriseFeatures = [
    {
      icon: <Palette className="h-5 w-5" />,
      title: "Custom Theming",
      description: "Complete brand customization with custom CSS and themes."
    },
    {
      icon: <Award className="h-5 w-5" />,
      title: "Partner Program",
      description: "Comprehensive reseller and dealer management with commission tracking."
    },
    {
      icon: <DollarSign className="h-5 w-5" />,
      title: "Revenue Sharing",
      description: "Automated commission calculations and payment tracking."
    },
    {
      icon: <TrendingUp className="h-5 w-5" />,
      title: "Performance Metrics",
      description: "Real-time analytics and KPI tracking for business growth."
    },
    {
      icon: <Network className="h-5 w-5" />,
      title: "Third-Party Integrations",
      description: "Connect with 100+ popular business tools and services."
    },
    {
      icon: <Database className="h-5 w-5" />,
      title: "Data Management",
      description: "Advanced data import/export with backup and recovery options."
    },
    {
      icon: <Smartphone className="h-5 w-5" />,
      title: "Mobile Access",
      description: "Responsive design with mobile app for iOS and Android."
    },
    {
      icon: <Headphones className="h-5 w-5" />,
      title: "24/7 Support",
      description: "Dedicated support team with SLA guarantees and priority assistance."
    }
  ];

  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <Badge variant="secondary" className="w-fit mx-auto">
            <Zap className="h-3 w-3 mr-1" />
            Commercial Features
          </Badge>
          <h2 className="text-3xl lg:text-4xl font-bold">
            Built for Enterprise Scale & Partner Success
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our commercial ERP platform delivers enterprise-grade features with 
            white-label solutions, partner management, and unlimited scalability for resellers and enterprises.
          </p>
        </div>

        {/* Core Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {coreFeatures.map((feature, index) => (
            <Card key={index} className="relative group hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
                
                <div className="space-y-2">
                  {feature.benefits.map((benefit, idx) => (
                    <div key={idx} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-sm">{benefit}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enterprise Features */}
        <div className="bg-card border rounded-lg p-8">
          <div className="text-center space-y-4 mb-8">
            <h3 className="text-2xl font-bold">Partner & Reseller Features</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Advanced capabilities designed specifically for resellers, dealers, and enterprise partners 
              who need white-label solutions and revenue sharing opportunities.
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {enterpriseFeatures.map((feature, index) => (
              <div key={index} className="text-center space-y-3">
                <div className="mx-auto p-3 rounded-lg bg-primary/10 text-primary w-fit">
                  {feature.icon}
                </div>
                <h4 className="font-semibold">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="mx-auto p-4 rounded-full bg-primary/10 text-primary w-fit">
              <Server className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-semibold">Cloud Infrastructure</h4>
            <p className="text-muted-foreground">
              Enterprise-grade cloud hosting with 99.9% uptime guarantee and global CDN.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto p-4 rounded-full bg-success/10 text-success w-fit">
              <Lock className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-semibold">Security First</h4>
            <p className="text-muted-foreground">
              End-to-end encryption, SOC 2 compliance, and advanced threat protection.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="mx-auto p-4 rounded-full bg-warning/10 text-warning w-fit">
              <Settings className="h-8 w-8" />
            </div>
            <h4 className="text-xl font-semibold">Customizable</h4>
            <p className="text-muted-foreground">
              White-label options, custom integrations, and flexible configuration.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold">Ready to Accelerate Your Business Growth?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join 500+ active partners using TidyGen to scale operations, 
              expand market reach, and increase revenue through white-label solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Calendar className="h-4 w-4 mr-2" />
                Request Demo
              </Button>
              <Button size="lg" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Download Partner Kit
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
