/**
 * Network status indicator component
 */

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface NetworkStatusProps {
  showBadge?: boolean;
  showTooltip?: boolean;
  className?: string;
}

export function NetworkStatus({ 
  showBadge = true, 
  showTooltip = true, 
  className = "" 
}: NetworkStatusProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');
  const [lastOfflineTime, setLastOfflineTime] = useState<Date | null>(null);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setLastOfflineTime(null);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setLastOfflineTime(new Date());
    };

    // Check connection type if available
    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          setConnectionType(connection.effectiveType || connection.type || 'unknown');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updateConnectionInfo();

    // Check connection info periodically
    const interval = setInterval(updateConnectionInfo, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  const getStatusColor = () => {
    if (!isOnline) return 'destructive';
    if (connectionType === 'slow-2g' || connectionType === '2g') return 'destructive';
    if (connectionType === '3g') return 'warning';
    return 'success';
  };

  const getStatusText = () => {
    if (!isOnline) return 'Offline';
    if (connectionType === 'slow-2g') return 'Very Slow';
    if (connectionType === '2g') return 'Slow';
    if (connectionType === '3g') return 'Fair';
    if (connectionType === '4g') return 'Good';
    return 'Online';
  };

  const getStatusIcon = () => {
    if (!isOnline) return <WifiOff className="h-3 w-3" />;
    if (connectionType === 'slow-2g' || connectionType === '2g') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return <Wifi className="h-3 w-3" />;
  };

  const getTooltipContent = () => {
    if (!isOnline) {
      return (
        <div className="space-y-1">
          <p className="font-medium">You are offline</p>
          {lastOfflineTime && (
            <p className="text-xs text-muted-foreground">
              Since {lastOfflineTime.toLocaleTimeString()}
            </p>
          )}
          <p className="text-xs">Some features may not work properly</p>
        </div>
      );
    }

    return (
      <div className="space-y-1">
        <p className="font-medium">Connection: {getStatusText()}</p>
        <p className="text-xs text-muted-foreground">
          Type: {connectionType}
        </p>
        {connectionType === 'slow-2g' || connectionType === '2g' ? (
          <p className="text-xs text-warning">
            Slow connection detected
          </p>
        ) : null}
      </div>
    );
  };

  if (!showBadge) {
    return null;
  }

  const statusBadge = (
    <Badge 
      variant={getStatusColor() === 'success' ? 'default' : getStatusColor() === 'warning' ? 'secondary' : 'destructive'}
      className={`flex items-center gap-1 ${className}`}
    >
      {getStatusIcon()}
      <span className="text-xs">{getStatusText()}</span>
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {statusBadge}
          </TooltipTrigger>
          <TooltipContent>
            {getTooltipContent()}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return statusBadge;
}

// Hook for network status
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionType, setConnectionType] = useState<string>('unknown');

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    const updateConnectionInfo = () => {
      if ('connection' in navigator) {
        const connection = (navigator as any).connection;
        if (connection) {
          setConnectionType(connection.effectiveType || connection.type || 'unknown');
        }
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    updateConnectionInfo();

    const interval = setInterval(updateConnectionInfo, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    connectionType,
    isSlowConnection: connectionType === 'slow-2g' || connectionType === '2g',
  };
}
