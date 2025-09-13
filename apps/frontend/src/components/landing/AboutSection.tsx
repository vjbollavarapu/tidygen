import { Card, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  BarChart3, 
  Shield, 
  Zap, 
  Globe,
  CheckCircle,
  Star
} from "lucide-react";

export function AboutSection() {
  const features = [
    {
      icon: <Building2 className="h-6 w-6" />,
      title: "Multi-Tenant Architecture",
      description: "Complete data isolation with secure tenant management for enterprises and resellers."
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Role-Based Access Control",
      description: "Granular permissions and user management with advanced security controls."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Advanced Analytics",
      description: "AI-powered business intelligence with real-time reporting and insights."
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Enterprise Security",
      description: "Bank-grade security with SOC 2 compliance and advanced threat protection."
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "API-First Design",
      description: "Comprehensive REST APIs with SDKs for seamless integrations."
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: "White-Label Branding",
      description: "Custom branding options for resellers and enterprise customers."
    }
  ];

  const stats = [
    { label: "Active Tenants", value: "2,000+" },
    { label: "Enterprise Customers", value: "500+" },
    { label: "SLA Uptime", value: "99.9%" },
    { label: "Partner Satisfaction", value: "4.9/5" }
  ];

  return (
    <section id="about" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Why Choose iNEAT-ERP?
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Built for enterprise scale, iNEAT-ERP combines innovation with security 
            to deliver a comprehensive multi-tenant solution that grows with your business.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-semibold">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-primary mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
            <span className="text-sm font-medium">4.9/5 from 500+ enterprise reviews</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Trusted by enterprises worldwide for reliable, scalable multi-tenant ERP management
          </p>
        </div>
      </div>
    </section>
  );
}
