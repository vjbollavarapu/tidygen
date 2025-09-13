import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PricingTable } from "@/components/landing/PricingTable";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Check, 
  Download, 
  Play, 
  Star, 
  Users, 
  Shield, 
  Zap, 
  Globe, 
  Headphones, 
  BookOpen, 
  ArrowRight,
  Building2,
  Sparkles,
  Lock,
  Server,
  Cloud,
  Code,
  BarChart3,
  Settings,
  Mail,
  Phone,
  MapPin,
  Github,
  ExternalLink
} from "lucide-react";
import { HeroSection } from "@/components/landing/HeroSection";
import { AboutSection } from "@/components/landing/AboutSection";
import { FeaturesSection } from "@/components/landing/FeaturesSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { ServicesSection } from "@/components/landing/ServicesSection";
import { PartnersSection } from "@/components/landing/PartnersSection";
import { FooterSection } from "@/components/landing/FooterSection";

export default function LandingPage() {
  const navigate = useNavigate();

  const handleEnterApp = () => {
    navigate("/login");
  };

  const handleRequestDemo = () => {
    // In a real implementation, this would open a demo request form
    navigate("/contact?type=demo");
  };

  const handleStartTrial = () => {
    // In a real implementation, this would start a free trial
    navigate("/signup?trial=true");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">iNEAT-ERP</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </a>
              <a href="#services" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Services
              </a>
              <a href="#partners" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Partners
              </a>
            </div>

            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={handleEnterApp}>
                Sign In
              </Button>
              <Button size="sm" onClick={handleRequestDemo}>
                Request Demo
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <HeroSection 
        onEnterApp={handleEnterApp}
        onRequestDemo={handleRequestDemo}
        onStartTrial={handleStartTrial}
      />

      {/* About Section */}
      <AboutSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Pricing Section */}
      <PricingTable />

      {/* Services Section */}
      <ServicesSection />

      {/* Partners Section */}
      <PartnersSection />

      {/* Footer */}
      <FooterSection />
    </div>
  );
}
