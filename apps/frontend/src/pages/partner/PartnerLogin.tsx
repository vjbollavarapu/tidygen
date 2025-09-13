import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  Award,
  Users,
  DollarSign
} from 'lucide-react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePartner } from '@/contexts/PartnerContext';
import { toast } from '@/components/ui/enhanced-notifications';

export default function PartnerLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const { updatePartner } = usePartner();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Mock partner login - in real app, this would call the API
      if (email === 'partner@demo.com' && password === 'demo123') {
        // Mock partner data
        const mockPartner = {
          id: 'partner_1',
          name: 'John Smith',
          email: 'partner@demo.com',
          company: 'Tech Solutions Inc.',
          website: 'https://techsolutions.com',
          tier: 'gold' as const,
          status: 'active' as const,
          commission_rate: 0.25,
          white_label_enabled: true,
          custom_domain: 'app.techsolutions.com',
          branding: {
            primary_color: '#3B82F6',
            secondary_color: '#64748B',
            company_name: 'Tech Solutions Inc.',
            support_email: 'support@techsolutions.com',
            support_phone: '+1 (555) 123-4567',
            remove_ineat_branding: true,
            footer_text: '© 2024 Tech Solutions Inc. All rights reserved.',
          },
          limits: {
            max_customers: 200,
            max_tenants_per_customer: 10,
            max_users_per_tenant: 500,
            storage_limit_gb: 200,
            api_calls_per_month: 200000,
            custom_domains: 10,
            white_label_enabled: true,
            priority_support: true,
            dedicated_account_manager: true,
          },
          performance: {
            total_customers: 45,
            active_tenants: 67,
            total_revenue: 125000,
            commission_earned: 31250,
            monthly_recurring_revenue: 15000,
            customer_satisfaction_score: 4.8,
            last_month_commissions: 3750,
            year_to_date_commissions: 31250,
            conversion_rate: 0.75,
            churn_rate: 0.05,
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        // Store partner session
        localStorage.setItem('partner_session', JSON.stringify(mockPartner));
        
        toast.success('Login Successful', 'Welcome to your partner dashboard!');
        navigate('/partner/dashboard');
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side - Login Form */}
        <div className="flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="mx-auto h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Building className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl">Partner Portal</CardTitle>
              <p className="text-muted-foreground">
                Access your partner dashboard and manage your business
              </p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="partner@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center">
                      Sign In
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have a partner account?{' '}
                  <a href="/contact" className="text-primary hover:underline">
                    Contact us
                  </a>
                </p>
              </div>

              {/* Demo Credentials */}
              <div className="mt-6 p-4 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Demo Credentials:</h4>
                <p className="text-xs text-muted-foreground">
                  Email: partner@demo.com<br />
                  Password: demo123
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side - Partner Benefits */}
        <div className="flex items-center justify-center">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h2 className="text-3xl font-bold mb-4">Partner with iNEAT-ERP</h2>
              <p className="text-lg text-muted-foreground">
                Join our partner program and grow your business with our comprehensive ERP solution.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <DollarSign className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">Earn Commissions</h3>
                  <p className="text-sm text-muted-foreground">
                    Up to 30% commission on every customer you bring to our platform.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-success/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="h-4 w-4 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold">White-Label Solution</h3>
                  <p className="text-sm text-muted-foreground">
                    Brand the platform with your company's identity and offer it as your own.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-warning/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="h-4 w-4 text-warning" />
                </div>
                <div>
                  <h3 className="font-semibold">Customer Management</h3>
                  <p className="text-sm text-muted-foreground">
                    Onboard and manage your customers with our comprehensive partner tools.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="h-8 w-8 bg-info/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="h-4 w-4 text-info" />
                </div>
                <div>
                  <h3 className="font-semibold">Tiered Benefits</h3>
                  <p className="text-sm text-muted-foreground">
                    Bronze, Silver, Gold, and Platinum tiers with increasing benefits and support.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-primary">15-30%</div>
                  <div className="text-sm text-muted-foreground">Commission Rate</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-success">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <Button variant="outline" className="w-full">
                Learn More About Partnership
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
