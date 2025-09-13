import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  Settings, 
  Building,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ChevronDown,
  Award,
  Shield,
  HelpCircle
} from 'lucide-react';
import { Button } from '@/components/ui/enhanced-button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePartner } from '@/contexts/PartnerContext';

interface PartnerLayoutProps {
  children: React.ReactNode;
}

export function PartnerLayout({ children }: PartnerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { currentPartner } = usePartner();

  const navigation = [
    { name: 'Dashboard', href: '/partner/dashboard', icon: LayoutDashboard },
    { name: 'Customers', href: '/partner/customers', icon: Users },
    { name: 'Commissions', href: '/partner/commissions', icon: DollarSign },
    { name: 'Settings', href: '/partner/settings', icon: Settings },
  ];

  const handleLogout = () => {
    localStorage.removeItem('partner_session');
    navigate('/partner/login');
  };

  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Partner Portal</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => {
                    navigate(item.href);
                    setSidebarOpen(false);
                  }}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-4 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Building className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Partner Portal</span>
            </div>
          </div>
          
          {/* Partner Info */}
          {currentPartner && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {currentPartner.company}
                  </p>
                  <div className="flex items-center space-x-1">
                    <Badge variant="outline" className="text-xs">
                      {currentPartner.tier}
                    </Badge>
                    <Badge variant={currentPartner.status === 'active' ? 'default' : 'secondary'} className="text-xs">
                      {currentPartner.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          <nav className="flex-1 space-y-1 px-2 py-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Button
                  key={item.name}
                  variant={isActive(item.href) ? 'default' : 'ghost'}
                  className="w-full justify-start"
                  onClick={() => navigate(item.href)}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Button>
              );
            })}
          </nav>

          {/* Partner Tier Info */}
          {currentPartner && (
            <div className="p-4 border-t border-gray-200">
              <div className="text-xs text-gray-500 mb-2">Commission Rate</div>
              <div className="text-lg font-semibold text-primary">
                {(currentPartner.commission_rate * 100).toFixed(1)}%
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Separator */}
          <div className="h-6 w-px bg-gray-200 lg:hidden" />

          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="relative flex flex-1 items-center">
              <Search className="pointer-events-none absolute inset-y-0 left-0 h-full w-5 text-gray-400" />
              <Input
                className="block h-full w-full border-0 py-0 pl-8 pr-0 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm"
                placeholder="Search..."
                type="search"
                name="search"
              />
            </div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Notifications */}
              <Button variant="ghost" size="sm">
                <Bell className="h-5 w-5" />
              </Button>

              {/* Help */}
              <Button variant="ghost" size="sm">
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* Separator */}
              <div className="hidden lg:block lg:h-6 lg:w-px lg:bg-gray-200" />

              {/* Profile dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="flex items-center space-x-2"
                >
                  <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <Building className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden lg:block text-sm font-medium">
                    {currentPartner?.name || 'Partner'}
                  </span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>

              {/* Logout */}
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
