/**
 * Global error handler for API errors and network issues
 */

import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { X, AlertTriangle, Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

export interface GlobalError {
  id: string;
  type: 'api' | 'network' | 'validation' | 'auth' | 'general';
  message: string;
  details?: string;
  timestamp: Date;
  retryable: boolean;
  retryAction?: () => void;
}

interface GlobalErrorContextType {
  errors: GlobalError[];
  addError: (error: Omit<GlobalError, 'id' | 'timestamp'>) => void;
  removeError: (id: string) => void;
  clearAllErrors: () => void;
  isOnline: boolean;
}

const GlobalErrorContext = createContext<GlobalErrorContextType | undefined>(undefined);

export function useGlobalError() {
  const context = useContext(GlobalErrorContext);
  if (!context) {
    throw new Error('useGlobalError must be used within a GlobalErrorProvider');
  }
  return context;
}

interface GlobalErrorProviderProps {
  children: ReactNode;
}

export function GlobalErrorProvider({ children }: GlobalErrorProviderProps) {
  const [errors, setErrors] = useState<GlobalError[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      addError({
        type: 'network',
        message: 'You are currently offline',
        details: 'Please check your internet connection and try again.',
        retryable: true,
        retryAction: () => window.location.reload(),
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const addError = (error: Omit<GlobalError, 'id' | 'timestamp'>) => {
    const newError: GlobalError = {
      ...error,
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      timestamp: new Date(),
    };

    setErrors(prev => [newError, ...prev]);

    // Show toast notification
    toast.error(error.message, {
      description: error.details,
      action: error.retryable && error.retryAction ? {
        label: 'Retry',
        onClick: error.retryAction,
      } : undefined,
    });
  };

  const removeError = (id: string) => {
    setErrors(prev => prev.filter(error => error.id !== id));
  };

  const clearAllErrors = () => {
    setErrors([]);
  };

  return (
    <GlobalErrorContext.Provider value={{
      errors,
      addError,
      removeError,
      clearAllErrors,
      isOnline,
    }}>
      {children}
      <GlobalErrorDisplay />
    </GlobalErrorContext.Provider>
  );
}

function GlobalErrorDisplay() {
  const { errors, removeError, clearAllErrors, isOnline } = useGlobalError();

  if (errors.length === 0 && isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {/* Offline indicator */}
      {!isOnline && (
        <Alert className="border-warning bg-warning/10">
          <WifiOff className="h-4 w-4 text-warning" />
          <AlertDescription className="text-warning">
            You are currently offline. Some features may not work properly.
          </AlertDescription>
        </Alert>
      )}

      {/* Error alerts */}
      {errors.slice(0, 3).map((error) => (
        <Alert key={error.id} className="border-destructive bg-destructive/10">
          <AlertTriangle className="h-4 w-4 text-destructive" />
          <AlertDescription className="flex-1">
            <div className="space-y-1">
              <p className="text-destructive font-medium">{error.message}</p>
              {error.details && (
                <p className="text-destructive/80 text-sm">{error.details}</p>
              )}
              <div className="flex items-center gap-2 mt-2">
                {error.retryable && error.retryAction && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={error.retryAction}
                    className="h-6 px-2 text-xs"
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Retry
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeError(error.id)}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </AlertDescription>
        </Alert>
      ))}

      {/* Show all errors button */}
      {errors.length > 3 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{errors.length - 3} more errors</span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={clearAllErrors}
                className="h-6 px-2 text-xs"
              >
                Clear All
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

// Hook for handling API errors
export function useApiErrorHandler() {
  const { addError } = useGlobalError();

  const handleApiError = (error: any, context?: string) => {
    let errorType: GlobalError['type'] = 'api';
    let message = 'An error occurred';
    let details = '';
    let retryable = false;

    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const data = error.response.data;

      switch (status) {
        case 400:
          errorType = 'validation';
          message = 'Invalid request';
          details = data?.message || 'Please check your input and try again.';
          break;
        case 401:
          errorType = 'auth';
          message = 'Authentication required';
          details = 'Please log in to continue.';
          retryable = true;
          break;
        case 403:
          errorType = 'auth';
          message = 'Access denied';
          details = 'You do not have permission to perform this action.';
          break;
        case 404:
          message = 'Resource not found';
          details = 'The requested resource could not be found.';
          retryable = true;
          break;
        case 422:
          errorType = 'validation';
          message = 'Validation error';
          details = data?.message || 'Please check your input and try again.';
          break;
        case 429:
          message = 'Too many requests';
          details = 'Please wait a moment before trying again.';
          retryable = true;
          break;
        case 500:
          message = 'Server error';
          details = 'Something went wrong on our end. Please try again later.';
          retryable = true;
          break;
        default:
          message = `Error ${status}`;
          details = data?.message || 'An unexpected error occurred.';
          retryable = status >= 500;
      }
    } else if (error.request) {
      // Network error
      errorType = 'network';
      message = 'Network error';
      details = 'Unable to connect to the server. Please check your internet connection.';
      retryable = true;
    } else {
      // Other error
      errorType = 'general';
      message = error.message || 'An unexpected error occurred';
      details = 'Please try again or contact support if the problem persists.';
      retryable = true;
    }

    if (context) {
      message = `${context}: ${message}`;
    }

    addError({
      type: errorType,
      message,
      details,
      retryable,
      retryAction: retryable ? () => window.location.reload() : undefined,
    });
  };

  return { handleApiError };
}
