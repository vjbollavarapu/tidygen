import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Server, 
  Headphones, 
  BookOpen, 
  ArrowRight,
  CheckCircle,
  Clock,
  Users,
  Shield
} from "lucide-react";

export function ServicesSection() {
  const services = [
    {
      icon: <Server className="h-8 w-8" />,
      title: "Managed Hosting",
      description: "Let us handle the technical complexity while you focus on your business.",
      features: [
        "24/7 server monitoring",
        "Daily automated backups",
        "SSL certificates included",
        "Regular security updates",
        "99.9% uptime guarantee",
        "Performance optimization"
      ],
      pricing: "Starting at $30/month",
      cta: "Get Hosting",
      popular: true
    },
    {
      icon: <Headphones className="h-8 w-8" />,
      title: "Premium Support",
      description: "Get expert help when you need it with our dedicated support team.",
      features: [
        "Priority email support",
        "Live chat assistance",
        "24/7 phone support",
        "Dedicated account manager",
        "Custom training sessions",
        "Issue resolution SLA"
      ],
      pricing: "Starting at $99/month",
      cta: "Get Support",
      popular: false
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: "Training & Onboarding",
      description: "Comprehensive training to get your team up and running quickly.",
      features: [
        "Custom onboarding program",
        "Team training sessions",
        "Best practices guidance",
        "Documentation & tutorials",
        "Video training library",
        "Ongoing education"
      ],
      pricing: "Starting at $199/session",
      cta: "Schedule Training",
      popular: false
    }
  ];

  const additionalServices = [
    {
      title: "Custom Development",
      description: "Tailored features and integrations for your specific needs.",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      title: "Data Migration",
      description: "Seamless migration from your existing systems.",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      title: "API Integration",
      description: "Connect with your favorite tools and services.",
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      title: "White-Label Solutions",
      description: "Rebrand TidyGen as your own solution.",
      icon: <CheckCircle className="h-5 w-5" />
    }
  ];

  return (
    <section id="services" className="py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center space-y-4 mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold">
            Professional Services
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Beyond software, we provide comprehensive enterprise services including 
            customization, training, and SLA support to ensure your success with TidyGen.
          </p>
        </div>

        {/* Main Services */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {services.map((service, index) => (
            <Card key={index} className={`relative ${service.popular ? 'border-primary shadow-lg' : 'border'}`}>
              {service.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-medium">
                    Most Popular
                  </div>
                </div>
              )}
              
              <CardHeader className="text-center pb-6">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className={`p-3 rounded-lg ${service.popular ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                    {service.icon}
                  </div>
                </div>
                <CardTitle className="text-xl">{service.title}</CardTitle>
                <p className="text-muted-foreground">{service.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  {service.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center space-x-3">
                      <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="pt-6 border-t space-y-4">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-primary">{service.pricing}</div>
                  </div>
                  <Button className="w-full" variant={service.popular ? "default" : "outline"}>
                    {service.cta}
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Additional Services */}
        <div className="bg-muted/30 rounded-lg p-8">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold mb-2">Additional Services</h3>
            <p className="text-muted-foreground">
              We also offer specialized services to meet your unique business requirements.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {additionalServices.map((service, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                  {service.icon}
                </div>
                <div className="space-y-1">
                  <h4 className="font-medium text-sm">{service.title}</h4>
                  <p className="text-xs text-muted-foreground">{service.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Service Benefits */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Quick Setup</h3>
            <p className="text-sm text-muted-foreground">
              Get up and running in days, not months, with our streamlined onboarding process.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Expert Team</h3>
            <p className="text-sm text-muted-foreground">
              Work with experienced professionals who understand enterprise ERP requirements.
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold">Reliable Support</h3>
            <p className="text-sm text-muted-foreground">
              Count on us for ongoing support and maintenance to keep your system running smoothly.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
