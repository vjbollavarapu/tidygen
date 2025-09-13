/**
 * Global loading component for consistent loading states across the application
 */

import { Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GlobalLoadingProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'pulse' | 'dots';
  fullScreen?: boolean;
  className?: string;
}

export function GlobalLoading({ 
  message = "Loading...", 
  size = 'md', 
  variant = 'spinner',
  fullScreen = false,
  className = ""
}: GlobalLoadingProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  const renderSpinner = () => (
    <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
  );

  const renderPulse = () => (
    <div className={`${sizeClasses[size]} rounded-full bg-primary animate-pulse`} />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      <div className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} rounded-full bg-primary animate-bounce`} style={{ animationDelay: '0ms' }} />
      <div className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} rounded-full bg-primary animate-bounce`} style={{ animationDelay: '150ms' }} />
      <div className={`${size === 'sm' ? 'h-2 w-2' : size === 'md' ? 'h-3 w-3' : 'h-4 w-4'} rounded-full bg-primary animate-bounce`} style={{ animationDelay: '300ms' }} />
    </div>
  );

  const renderLoadingIcon = () => {
    switch (variant) {
      case 'pulse':
        return renderPulse();
      case 'dots':
        return renderDots();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {renderLoadingIcon()}
      {message && (
        <p className="text-sm text-muted-foreground text-center">
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="p-0">
            {content}
          </CardContent>
        </Card>
      </div>
    );
  }

  return content;
}

// Specific loading components for common use cases
export function PageLoading({ message = "Loading page..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <GlobalLoading message={message} size="lg" />
    </div>
  );
}

export function TableLoading({ message = "Loading data..." }: { message?: string }) {
  return (
    <div className="flex items-center justify-center py-12">
      <GlobalLoading message={message} size="md" />
    </div>
  );
}

export function CardLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <Card>
      <CardContent className="p-8">
        <GlobalLoading message={message} size="md" />
      </CardContent>
    </Card>
  );
}

export function ButtonLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
}

export function InlineLoading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{message}</span>
    </div>
  );
}

// Skeleton loading components
export function SkeletonCard() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="h-4 bg-muted rounded animate-pulse" />
          <div className="h-4 bg-muted rounded animate-pulse w-3/4" />
          <div className="h-4 bg-muted rounded animate-pulse w-1/2" />
        </div>
      </CardContent>
    </Card>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex space-x-4">
          <div className="h-4 bg-muted rounded animate-pulse flex-1" />
          <div className="h-4 bg-muted rounded animate-pulse w-24" />
          <div className="h-4 bg-muted rounded animate-pulse w-32" />
          <div className="h-4 bg-muted rounded animate-pulse w-20" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
          <div className="space-y-2 flex-1">
            <div className="h-4 bg-muted rounded animate-pulse" />
            <div className="h-3 bg-muted rounded animate-pulse w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
