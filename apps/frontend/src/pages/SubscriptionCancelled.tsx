import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { XCircle, ArrowLeft, RefreshCw, Mail } from 'lucide-react';

export default function SubscriptionCancelled() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate('/');
  };

  const handleTryAgain = () => {
    navigate('/#pricing');
  };

  const handleContactSupport = () => {
    window.open('mailto:support@ineat-erp.com?subject=Subscription Support', '_blank');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                <XCircle className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl">Subscription Cancelled</CardTitle>
            <p className="text-muted-foreground">
              Your subscription process was cancelled. No charges have been made.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Information */}
            <div className="text-center space-y-2">
              <h3 className="font-semibold">What happened?</h3>
              <p className="text-sm text-muted-foreground">
                You cancelled the subscription process before completing the payment. 
                Your account remains unchanged and no charges were made.
              </p>
            </div>

            {/* Benefits Reminder */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-2">
              <h4 className="font-medium text-sm">Remember, with iNEAT-ERP you get:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Complete business management solution</li>
                <li>• Advanced analytics and reporting</li>
                <li>• Priority support and updates</li>
                <li>• Secure cloud hosting</li>
                <li>• 24/7 system monitoring</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={handleTryAgain} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleGoBack}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </div>

            {/* Support Information */}
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Need help choosing the right plan?
              </p>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleContactSupport}
                className="text-primary"
              >
                <Mail className="h-4 w-4 mr-2" />
                Contact Support
              </Button>
            </div>

            {/* Alternative Options */}
            <div className="border-t pt-4">
              <p className="text-xs text-muted-foreground mb-3">
                Not ready for a paid plan? Try our free Community Edition:
              </p>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://github.com/ineat/ineat-erp', '_blank')}
                className="w-full"
              >
                Download Community Edition
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
