import * as React from "react";
import { ChevronRight, Home, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/contexts/ThemeContext";
import { Button } from "./enhanced-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

// Breadcrumb Types
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
  current?: boolean;
  disabled?: boolean;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  maxItems?: number;
  showHome?: boolean;
  homeHref?: string;
  className?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

// Breadcrumb Component
export const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({
    items,
    separator = <ChevronRight className="h-4 w-4" />,
    maxItems = 3,
    showHome = true,
    homeHref = "/",
    className,
    onItemClick,
  }, ref) => {
    const { isDark } = useTheme();
    
    // Add home item if needed
    const allItems = showHome 
      ? [{ label: "Home", href: homeHref, icon: <Home className="h-4 w-4" /> }, ...items]
      : items;

    // Handle overflow
    const shouldShowOverflow = allItems.length > maxItems;
    const visibleItems = shouldShowOverflow 
      ? [allItems[0], ...allItems.slice(-(maxItems - 1))]
      : allItems;

    const overflowItems = shouldShowOverflow 
      ? allItems.slice(1, -(maxItems - 1))
      : [];

    const handleItemClick = (item: BreadcrumbItem, index: number) => {
      if (item.disabled) return;
      onItemClick?.(item, index);
    };

    return (
      <nav
        ref={ref}
        aria-label="Breadcrumb"
        className={cn("flex items-center space-x-1 text-sm", className)}
      >
        <ol className="flex items-center space-x-1">
          {visibleItems.map((item, index) => {
            const isLast = index === visibleItems.length - 1;
            const isFirst = index === 0;
            const isOverflow = isFirst && shouldShowOverflow;

            return (
              <li key={index} className="flex items-center">
                {isOverflow && overflowItems.length > 0 && (
                  <>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          aria-label="Show more breadcrumb items"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        {overflowItems.map((overflowItem, overflowIndex) => (
                          <DropdownMenuItem
                            key={overflowIndex}
                            onClick={() => handleItemClick(overflowItem, overflowIndex + 1)}
                            disabled={overflowItem.disabled}
                          >
                            {overflowItem.icon && (
                              <span className="mr-2">{overflowItem.icon}</span>
                            )}
                            {overflowItem.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                    {separator}
                  </>
                )}

                <div className="flex items-center">
                  {item.icon && (
                    <span className="mr-1 text-muted-foreground">
                      {item.icon}
                    </span>
                  )}
                  
                  {item.href && !item.current && !item.disabled ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 text-muted-foreground hover:text-foreground"
                      onClick={() => handleItemClick(item, index)}
                    >
                      {item.label}
                    </Button>
                  ) : (
                    <span
                      className={cn(
                        "font-medium",
                        item.current 
                          ? "text-foreground" 
                          : item.disabled 
                            ? "text-muted-foreground/50 cursor-not-allowed"
                            : "text-muted-foreground"
                      )}
                    >
                      {item.label}
                    </span>
                  )}
                </div>

                {!isLast && (
                  <span className="mx-1 text-muted-foreground">
                    {separator}
                  </span>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }
);
Breadcrumb.displayName = "Breadcrumb";

// Breadcrumb with Page Title
interface BreadcrumbWithTitleProps extends BreadcrumbProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const BreadcrumbWithTitle = React.forwardRef<HTMLDivElement, BreadcrumbWithTitleProps>(
  ({ title, subtitle, actions, className, ...breadcrumbProps }, ref) => {
    return (
      <div ref={ref} className={cn("space-y-4", className)}>
        <Breadcrumb {...breadcrumbProps} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
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
      </div>
    );
  }
);
BreadcrumbWithTitle.displayName = "BreadcrumbWithTitle";

// Module-specific Breadcrumb
interface ModuleBreadcrumbProps {
  module: string;
  page?: string;
  subPage?: string;
  onModuleClick?: () => void;
  onPageClick?: () => void;
  onSubPageClick?: () => void;
  className?: string;
}

export const ModuleBreadcrumb = React.forwardRef<HTMLElement, ModuleBreadcrumbProps>(
  ({
    module,
    page,
    subPage,
    onModuleClick,
    onPageClick,
    onSubPageClick,
    className,
  }, ref) => {
    const moduleIcons: Record<string, React.ReactNode> = {
      dashboard: <Home className="h-4 w-4" />,
      inventory: <div className="h-4 w-4 rounded bg-blue-500" />,
      finance: <div className="h-4 w-4 rounded bg-green-500" />,
      hr: <div className="h-4 w-4 rounded bg-orange-500" />,
      scheduling: <div className="h-4 w-4 rounded bg-teal-500" />,
      analytics: <div className="h-4 w-4 rounded bg-purple-500" />,
      clients: <div className="h-4 w-4 rounded bg-indigo-500" />,
    };

    const items: BreadcrumbItem[] = [
      {
        label: module.charAt(0).toUpperCase() + module.slice(1),
        icon: moduleIcons[module] || <div className="h-4 w-4 rounded bg-gray-500" />,
        onClick: onModuleClick,
      },
    ];

    if (page) {
      items.push({
        label: page.charAt(0).toUpperCase() + page.slice(1),
        onClick: onPageClick,
      });
    }

    if (subPage) {
      items.push({
        label: subPage.charAt(0).toUpperCase() + subPage.slice(1),
        current: true,
        onClick: onSubPageClick,
      });
    } else if (page) {
      items[items.length - 1].current = true;
    } else {
      items[0].current = true;
    }

    return (
      <Breadcrumb
        ref={ref}
        items={items}
        showHome={false}
        className={className}
      />
    );
  }
);
ModuleBreadcrumb.displayName = "ModuleBreadcrumb";

// Breadcrumb Hook
export function useBreadcrumb() {
  const [items, setItems] = React.useState<BreadcrumbItem[]>([]);

  const addItem = React.useCallback((item: BreadcrumbItem) => {
    setItems(prev => [...prev, item]);
  }, []);

  const removeItem = React.useCallback((index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  const updateItem = React.useCallback((index: number, item: Partial<BreadcrumbItem>) => {
    setItems(prev => prev.map((existingItem, i) => 
      i === index ? { ...existingItem, ...item } : existingItem
    ));
  }, []);

  const clearItems = React.useCallback(() => {
    setItems([]);
  }, []);

  const setItems = React.useCallback((newItems: BreadcrumbItem[]) => {
    setItems(newItems);
  }, []);

  return {
    items,
    addItem,
    removeItem,
    updateItem,
    clearItems,
    setItems,
  };
}

export default Breadcrumb;
