import React, { useState } from 'react';
import { 
  Save, 
  Upload, 
  Eye, 
  Palette, 
  Building, 
  Mail, 
  Phone, 
  Globe,
  Shield,
  Award,
  Settings,
  Image,
  Type,
  Layout,
  Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePartner, PARTNER_TIERS } from '@/contexts/PartnerContext';

export default function PartnerSettings() {
  const { 
    currentPartner, 
    updatePartner, 
    updateBranding,
    getBrandingConfig,
    isWhiteLabelEnabled,
    isLoading 
  } = usePartner();

  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [profileData, setProfileData] = useState({
    name: currentPartner?.name || '',
    email: currentPartner?.email || '',
    company: currentPartner?.company || '',
    website: currentPartner?.website || '',
  });

  const [brandingData, setBrandingData] = useState({
    ...getBrandingConfig(),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!currentPartner) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="text-center py-8">
            <Building className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Partner Access Required</h3>
            <p className="text-muted-foreground">
              You need to be registered as a partner to access settings.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentTier = PARTNER_TIERS.find(t => t.id === currentPartner.tier);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await updatePartner(profileData);
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveBranding = async () => {
    setIsSaving(true);
    try {
      await updateBranding(brandingData);
    } catch (error) {
      console.error('Failed to save branding:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBrandingData(prev => ({
          ...prev,
          logo: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBrandingData(prev => ({
          ...prev,
          favicon: e.target?.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Partner Settings</h1>
          <p className="text-muted-foreground">Manage your partner profile and branding</p>
        </div>

        {/* Partner Status Card */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{currentPartner.company}</h2>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {currentTier?.icon} {currentTier?.display_name}
                    </Badge>
                    <Badge variant={currentPartner.status === 'active' ? 'default' : 'secondary'}>
                      {currentPartner.status}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Commission Rate</p>
                <p className="text-2xl font-bold">{(currentPartner.commission_rate * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="flex items-center">
            <Building className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="branding" className="flex items-center">
            <Palette className="h-4 w-4 mr-2" />
            Branding
          </TabsTrigger>
          <TabsTrigger value="limits" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Limits
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center">
            <Settings className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Partner Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={profileData.company}
                      onChange={(e) => setProfileData(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Your Company"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="website">Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => setProfileData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://yourcompany.com"
                    />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label>Partner Tier</Label>
                    <div className="p-4 border rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-2xl">{currentTier?.icon}</span>
                        <span className="font-semibold">{currentTier?.display_name}</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Commission Rate: {(currentPartner.commission_rate * 100).toFixed(1)}%
                      </p>
                      <div className="space-y-1">
                        {currentTier?.benefits.slice(0, 3).map((benefit, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <div className="h-1.5 w-1.5 bg-primary rounded-full"></div>
                            <span className="text-sm">{benefit}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <Button onClick={handleSaveProfile} disabled={isSaving}>
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>White-Label Branding</CardTitle>
            </CardHeader>
            <CardContent>
              {!isWhiteLabelEnabled ? (
                <div className="text-center py-8">
                  <Palette className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">White-Label Not Available</h3>
                  <p className="text-muted-foreground mb-4">
                    White-label branding is available for Silver tier and above.
                  </p>
                  <Button onClick={() => window.location.href = '/pricing'}>
                    Upgrade Tier
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="company-name">Company Name</Label>
                        <Input
                          id="company-name"
                          value={brandingData.company_name}
                          onChange={(e) => setBrandingData(prev => ({ ...prev, company_name: e.target.value }))}
                          placeholder="Your Company Name"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="support-email">Support Email</Label>
                        <Input
                          id="support-email"
                          type="email"
                          value={brandingData.support_email}
                          onChange={(e) => setBrandingData(prev => ({ ...prev, support_email: e.target.value }))}
                          placeholder="support@yourcompany.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="support-phone">Support Phone</Label>
                        <Input
                          id="support-phone"
                          value={brandingData.support_phone || ''}
                          onChange={(e) => setBrandingData(prev => ({ ...prev, support_phone: e.target.value }))}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="custom-domain">Custom Domain</Label>
                        <Input
                          id="custom-domain"
                          value={brandingData.custom_domain || ''}
                          onChange={(e) => setBrandingData(prev => ({ ...prev, custom_domain: e.target.value }))}
                          placeholder="app.yourcompany.com"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Logo</Label>
                        <div className="flex items-center space-x-4">
                          {brandingData.logo && (
                            <img src={brandingData.logo} alt="Logo" className="h-16 w-16 object-contain border rounded" />
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleLogoUpload}
                              className="hidden"
                              id="logo-upload"
                            />
                            <Button variant="outline" onClick={() => document.getElementById('logo-upload')?.click()}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Logo
                            </Button>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Favicon</Label>
                        <div className="flex items-center space-x-4">
                          {brandingData.favicon && (
                            <img src={brandingData.favicon} alt="Favicon" className="h-8 w-8 object-contain border rounded" />
                          )}
                          <div>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleFaviconUpload}
                              className="hidden"
                              id="favicon-upload"
                            />
                            <Button variant="outline" onClick={() => document.getElementById('favicon-upload')?.click()}>
                              <Upload className="h-4 w-4 mr-2" />
                              Upload Favicon
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="primary-color">Primary Color</Label>
                    <Input
                      id="primary-color"
                      type="color"
                      value={brandingData.primary_color}
                      onChange={(e) => setBrandingData(prev => ({ ...prev, primary_color: e.target.value }))}
                      className="w-20 h-10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="secondary-color">Secondary Color</Label>
                    <Input
                      id="secondary-color"
                      type="color"
                      value={brandingData.secondary_color}
                      onChange={(e) => setBrandingData(prev => ({ ...prev, secondary_color: e.target.value }))}
                      className="w-20 h-10"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="footer-text">Footer Text</Label>
                    <Textarea
                      id="footer-text"
                      value={brandingData.footer_text || ''}
                      onChange={(e) => setBrandingData(prev => ({ ...prev, footer_text: e.target.value }))}
                      placeholder="© 2024 Your Company. All rights reserved."
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="remove-branding"
                      checked={brandingData.remove_ineat_branding}
                      onCheckedChange={(checked) => setBrandingData(prev => ({ ...prev, remove_ineat_branding: checked }))}
                    />
                    <Label htmlFor="remove-branding">Remove iNEAT-ERP Branding</Label>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={handleSaveBranding} disabled={isSaving}>
                      <Save className="h-4 w-4 mr-2" />
                      {isSaving ? 'Saving...' : 'Save Branding'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="limits" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Partner Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Tier Limits</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Max Customers</span>
                        <span className="font-semibold">
                          {currentTier?.limits.max_customers === -1 ? 'Unlimited' : currentTier?.limits.max_customers}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Tenants per Customer</span>
                        <span className="font-semibold">
                          {currentTier?.limits.max_tenants_per_customer === -1 ? 'Unlimited' : currentTier?.limits.max_tenants_per_customer}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Users per Tenant</span>
                        <span className="font-semibold">
                          {currentTier?.limits.max_users_per_tenant === -1 ? 'Unlimited' : currentTier?.limits.max_users_per_tenant}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Storage Limit</span>
                        <span className="font-semibold">
                          {currentTier?.limits.storage_limit_gb === -1 ? 'Unlimited' : `${currentTier?.limits.storage_limit_gb} GB`}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>API Calls per Month</span>
                        <span className="font-semibold">
                          {currentTier?.limits.api_calls_per_month === -1 ? 'Unlimited' : currentTier?.limits.api_calls_per_month.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Custom Domains</span>
                        <span className="font-semibold">
                          {currentTier?.limits.custom_domains === -1 ? 'Unlimited' : currentTier?.limits.custom_domains}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>White-Label Enabled</span>
                        <Badge variant={currentTier?.limits.white_label_enabled ? 'default' : 'secondary'}>
                          {currentTier?.limits.white_label_enabled ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Priority Support</span>
                        <Badge variant={currentTier?.limits.priority_support ? 'default' : 'secondary'}>
                          {currentTier?.limits.priority_support ? 'Yes' : 'No'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold mb-4">Current Usage</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Current Customers</span>
                        <span className="font-semibold">{currentPartner.performance.total_customers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Active Tenants</span>
                        <span className="font-semibold">{currentPartner.performance.active_tenants}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Monthly Revenue</span>
                        <span className="font-semibold">${currentPartner.performance.monthly_recurring_revenue.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Commission Earned</span>
                        <span className="font-semibold">${currentPartner.performance.commission_earned.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Account Security</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Two-Factor Authentication</h4>
                        <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                      </div>
                      <Button variant="outline">Enable 2FA</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">API Keys</h4>
                        <p className="text-sm text-muted-foreground">Manage your API keys for integrations</p>
                      </div>
                      <Button variant="outline">Manage Keys</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium">Login History</h4>
                        <p className="text-sm text-muted-foreground">View recent login activity</p>
                      </div>
                      <Button variant="outline">View History</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
}
