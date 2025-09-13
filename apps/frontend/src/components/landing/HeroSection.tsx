import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowRight, 
  Play, 
  Download, 
  Sparkles, 
  Building2, 
  Users, 
  BarChart3,
  Shield
} from "lucide-react";

interface HeroSectionProps {
  onEnterApp: () => void;
  onRequestDemo: () => void;
  onStartTrial: () => void;
}

export function HeroSection({ onEnterApp, onRequestDemo, onStartTrial }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="w-fit">
                <Sparkles className="h-3 w-3 mr-1" />
                Commercial ERP Platform
              </Badge>
              
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                Scale Your Business with
                <span className="text-primary"> Enterprise ERP</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl">
                Multi-tenant ERP platform designed for enterprises, dealers, and resellers. 
                Accelerate growth with white-label solutions, partner portals, and enterprise-grade security.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" onClick={onRequestDemo} className="group">
                <Play className="h-4 w-4 mr-2" />
                Request a Demo
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <Button size="lg" variant="outline" onClick={onStartTrial} className="group">
                <Sparkles className="h-4 w-4 mr-2" />
                Start Free Trial
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="h-4 w-4" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4" />
                <span>500+ Active Partners</span>
              </div>
              <div className="flex items-center space-x-1">
                <BarChart3 className="h-4 w-4" />
                <span>99.9% SLA Guarantee</span>
              </div>
            </div>
          </div>

          {/* Right Column - Visual */}
          <div className="relative">
            <div className="relative z-10">
              {/* Dashboard Preview */}
              <div className="bg-card border rounded-lg shadow-2xl overflow-hidden">
                <div className="bg-muted/50 px-4 py-3 border-b">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="ml-4 text-sm text-muted-foreground">iNEAT-ERP Dashboard</span>
                  </div>
                </div>
                
                <div className="p-6 space-y-4">
                  {/* Mock Dashboard Content */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-primary/10 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Users className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Active Partners</span>
                      </div>
                      <div className="text-2xl font-bold">547</div>
                      <div className="text-xs text-muted-foreground">+12% this month</div>
                    </div>
                    
                    <div className="bg-success/10 p-4 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <BarChart3 className="h-4 w-4 text-success" />
                        <span className="text-sm font-medium">Revenue</span>
                      </div>
                      <div className="text-2xl font-bold">$8.2M</div>
                      <div className="text-xs text-muted-foreground">+18% this month</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-primary rounded-full w-3/4"></div>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-accent rounded-full w-1/2"></div>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-success rounded-full w-5/6"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 -left-8 w-96 h-96 bg-accent/10 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </section>
  );
}
