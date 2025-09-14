import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Calendar, CreditCard, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getCurrentSubscription, formatPrice } from '@/services/paymentService';

export default function SubscriptionSuccess() {
  const [subscription, setSubscription] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const sessionId = searchParams.get('session_id');
  const subscriptionId = searchParams.get('subscription_id');

  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        // In a real implementation, you would fetch the subscription details
        // based on the session_id or subscription_id from the URL
        const subscriptionData = await getCurrentSubscription();
        setSubscription(subscriptionData);
      } catch (error) {
        console.error('Failed to fetch subscription details:', error);
        // Set mock data for demonstration
        setSubscription({
          planName: 'Pro SaaS',
          subscriptionId: subscriptionId || 'sub_1234567890',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          amount: 99,
          currency: 'USD',
          status: 'active'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionDetails();
  }, [sessionId, subscriptionId]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleManageSubscription = () => {
    navigate('/dashboard?tab=subscription');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading subscription details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="text-center">
          <CardHeader className="pb-6">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-success" />
              </div>
            </div>
            <CardTitle className="text-2xl">Subscription Successful!</CardTitle>
            <p className="text-muted-foreground">
              Welcome to TidyGen! Your subscription has been activated.
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Subscription Details */}
            {subscription && (
              <div className="space-y-4">
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Plan</span>
                    <Badge variant="secondary">{subscription.planName}</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Amount</span>
                    <span className="text-sm">
                      {formatPrice(subscription.amount, subscription.currency)}/month
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status</span>
                    <Badge variant="default" className="bg-success text-success-foreground">
                      {subscription.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Subscription ID</span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {subscription.subscriptionId}
                    </span>
                  </div>
                  
                  {subscription.nextBillingDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Next Billing</span>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">
                          {new Date(subscription.nextBillingDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Welcome Message */}
            <div className="text-center space-y-2">
              <h3 className="font-semibold">What's Next?</h3>
              <p className="text-sm text-muted-foreground">
                You now have access to all premium features. Start by exploring your dashboard 
                and setting up your business profile.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button onClick={handleGoToDashboard} className="w-full">
                Go to Dashboard
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleManageSubscription}
                className="w-full"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscription
              </Button>
            </div>

            {/* Support Information */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>Need help getting started?</p>
              <p>
                Contact our support team at{' '}
                <a href="mailto:support@tidygen.com" className="text-primary hover:underline">
                  support@tidygen.com
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
