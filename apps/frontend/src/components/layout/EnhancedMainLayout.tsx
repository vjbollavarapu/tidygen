import * as React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { ThemeProvider } from "next-themes";
import { SidebarProvider } from "@/components/ui/sidebar";
import { EnhancedSidebar } from "./EnhancedSidebar";
import { EnhancedHeader } from "./EnhancedHeader";
import { NotificationProvider } from "@/components/ui/enhanced-notifications";
import { GlobalErrorProvider } from "@/components/common/GlobalErrorHandler";

interface EnhancedMainLayoutProps {
  children?: React.ReactNode;
}

export function EnhancedMainLayout({ children }: EnhancedMainLayoutProps) {
  const { isDark } = useTheme();
  const location = useLocation();

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <GlobalErrorProvider>
        <NotificationProvider>
          <SidebarProvider defaultOpen={true}>
            <div className={cn(
              "min-h-screen flex w-full transition-colors duration-200",
              isDark ? "bg-gray-900" : "bg-gray-50"
            )}>
              <EnhancedSidebar />
              <div className="flex-1 flex flex-col overflow-hidden">
                <EnhancedHeader />
                <main className="flex-1 overflow-auto">
                  <div className="container mx-auto p-6">
                    {children || <Outlet />}
                  </div>
                </main>
              </div>
            </div>
          </SidebarProvider>
        </NotificationProvider>
      </GlobalErrorProvider>
    </ThemeProvider>
  );
}

// Page Layout Component
interface PageLayoutProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Array<{
    label: string;
    href?: string;
    icon?: React.ReactNode;
    current?: boolean;
  }>;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function PageLayout({
  title,
  subtitle,
  breadcrumbs,
  actions,
  children,
  className,
}: PageLayoutProps) {
  const { isDark } = useTheme();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
              {breadcrumbs.map((breadcrumb, index) => (
                <React.Fragment key={index}>
                  {breadcrumb.icon && (
                    <span className="mr-1">{breadcrumb.icon}</span>
                  )}
                  {breadcrumb.href ? (
                    <a
                      href={breadcrumb.href}
                      className="hover:text-foreground transition-colors"
                    >
                      {breadcrumb.label}
                    </a>
                  ) : (
                    <span className={breadcrumb.current ? "text-foreground font-medium" : ""}>
                      {breadcrumb.label}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="mx-1">/</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          {subtitle && (
            <p className="text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {actions && (
          <div className="flex items-center space-x-2">
            {actions}
          </div>
        )}
      </div>

      {/* Page Content */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
}

// Card Layout Component
interface CardLayoutProps {
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  loading?: boolean;
}

export function CardLayout({
  title,
  description,
  actions,
  children,
  className,
  loading = false,
}: CardLayoutProps) {
  const { isDark } = useTheme();

  return (
    <div className={cn(
      "rounded-lg border bg-card shadow-sm transition-all duration-200",
      isDark ? "border-gray-700 shadow-2xl" : "border-gray-200 shadow-md",
      className
    )}>
      {(title || description || actions) && (
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              {title && (
                <h3 className="text-lg font-semibold">{title}</h3>
              )}
              {description && (
                <p className="text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center space-x-2">
                {actions}
              </div>
            )}
          </div>
        </div>
      )}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

// Grid Layout Component
interface GridLayoutProps {
  children: React.ReactNode;
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  gap?: "sm" | "md" | "lg";
  className?: string;
}

export function GridLayout({
  children,
  cols = 3,
  gap = "md",
  className,
}: GridLayoutProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5",
    6: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6",
  };

  const gapClasses = {
    sm: "gap-4",
    md: "gap-6",
    lg: "gap-8",
  };

  return (
    <div className={cn(
      "grid",
      colClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}

// Section Layout Component
interface SectionLayoutProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SectionLayout({
  title,
  description,
  children,
  className,
}: SectionLayoutProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description) && (
        <div className="space-y-1">
          {title && (
            <h2 className="text-xl font-semibold">{title}</h2>
          )}
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      {children}
    </section>
  );
}

export default EnhancedMainLayout;
