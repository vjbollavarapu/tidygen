/**
 * Error page component for handling various error states
 */

import { AlertTriangle, Home, RefreshCw, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  type?: '404' | '500' | 'network' | 'auth' | 'generic';
  title?: string;
  message?: string;
  details?: string;
  showRetry?: boolean;
  showGoHome?: boolean;
  showGoBack?: boolean;
  onRetry?: () => void;
  className?: string;
}

export function ErrorPage({
  type = 'generic',
  title,
  message,
  details,
  showRetry = true,
  showGoHome = true,
  showGoBack = true,
  onRetry,
  className = ''
}: ErrorPageProps) {
  const navigate = useNavigate();

  const getErrorConfig = () => {
    switch (type) {
      case '404':
        return {
          title: title || 'Page Not Found',
          message: message || 'The page you are looking for does not exist.',
          details: details || 'The URL might be incorrect or the page may have been moved.',
          icon: <AlertTriangle className="h-12 w-12 text-muted-foreground" />,
        };
      case '500':
        return {
          title: title || 'Server Error',
          message: message || 'Something went wrong on our end.',
          details: details || 'We are working to fix this issue. Please try again later.',
          icon: <AlertTriangle className="h-12 w-12 text-destructive" />,
        };
      case 'network':
        return {
          title: title || 'Network Error',
          message: message || 'Unable to connect to the server.',
          details: details || 'Please check your internet connection and try again.',
          icon: <WifiOff className="h-12 w-12 text-warning" />,
        };
      case 'auth':
        return {
          title: title || 'Authentication Required',
          message: message || 'You need to log in to access this page.',
          details: details || 'Please log in with your credentials to continue.',
          icon: <AlertTriangle className="h-12 w-12 text-warning" />,
        };
      default:
        return {
          title: title || 'Something went wrong',
          message: message || 'An unexpected error occurred.',
          details: details || 'Please try again or contact support if the problem persists.',
          icon: <AlertTriangle className="h-12 w-12 text-muted-foreground" />,
        };
    }
  };

  const config = getErrorConfig();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-background p-4 ${className}`}>
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
            {config.icon}
          </div>
          <CardTitle className="text-2xl">{config.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-muted-foreground">{config.message}</p>
            {config.details && (
              <p className="text-sm text-muted-foreground">{config.details}</p>
            )}
          </div>

          {type === 'network' && (
            <Alert>
              <Wifi className="h-4 w-4" />
              <AlertDescription>
                Check your internet connection and try refreshing the page.
              </AlertDescription>
            </Alert>
          )}

          {type === 'auth' && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Your session may have expired. Please log in again to continue.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {showRetry && (
              <Button onClick={handleRetry} className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
            )}
            {showGoBack && (
              <Button variant="outline" onClick={handleGoBack} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Go Back
              </Button>
            )}
            {showGoHome && (
              <Button variant="outline" onClick={handleGoHome} className="flex items-center gap-2">
                <Home className="h-4 w-4" />
                Go to Dashboard
              </Button>
            )}
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>If the problem persists, please contact support.</p>
            <p>Error ID: {Date.now().toString(36)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Specific error page components
export function NotFoundPage() {
  return <ErrorPage type="404" />;
}

export function ServerErrorPage() {
  return <ErrorPage type="500" />;
}

export function NetworkErrorPage() {
  return <ErrorPage type="network" />;
}

export function AuthErrorPage() {
  return <ErrorPage type="auth" />;
}
