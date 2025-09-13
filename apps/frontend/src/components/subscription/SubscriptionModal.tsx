import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, CreditCard, Check, X, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  PaymentPlan, 
  createStripeCheckoutSession, 
  createPayPalSubscription, 
  formatPrice,
  getPlanById 
} from '@/services/paymentService';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
}

export function SubscriptionModal({ isOpen, onClose, planId }: SubscriptionModalProps) {
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'stripe' | 'paypal' | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const plan = getPlanById(planId);

  const handlePaymentMethodSelect = (method: 'stripe' | 'paypal') => {
    setSelectedPaymentMethod(method);
    setError(null);
  };

  const handleSubscribe = async () => {
    if (!selectedPaymentMethod || !user) {
      setError('Please select a payment method');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      if (selectedPaymentMethod === 'stripe') {
        const session = await createStripeCheckoutSession(planId, user.id);
        // Redirect to Stripe checkout
        window.location.href = session.url;
      } else if (selectedPaymentMethod === 'paypal') {
        const subscription = await createPayPalSubscription(planId, user.id);
        // Redirect to PayPal approval
        const approvalUrl = subscription.links.find(link => link.rel === 'approve')?.href;
        if (approvalUrl) {
          window.location.href = approvalUrl;
        } else {
          throw new Error('PayPal approval URL not found');
        }
      }
    } catch (error: any) {
      setError(error.message);
      toast({
        title: "Payment Error",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPaymentMethod(null);
    setError(null);
    onClose();
  };

  if (!plan) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to {plan.name}</DialogTitle>
          <DialogDescription>
            Choose your payment method to complete your subscription.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Plan Summary */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <Badge variant="secondary">
                  {formatPrice(plan.price, plan.currency)}/{plan.interval}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center space-x-2 text-sm">
                    <Check className="h-4 w-4 text-success flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Choose Payment Method</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPaymentMethod === 'stripe' 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handlePaymentMethodSelect('stripe')}
              >
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-primary" />
                  <div className="font-medium">Credit Card</div>
                  <div className="text-xs text-muted-foreground">Powered by Stripe</div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all ${
                  selectedPaymentMethod === 'paypal' 
                    ? 'ring-2 ring-primary border-primary' 
                    : 'hover:border-primary/50'
                }`}
                onClick={() => handlePaymentMethodSelect('paypal')}
              >
                <CardContent className="p-4 text-center">
                  <CreditCard className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="font-medium">PayPal</div>
                  <div className="text-xs text-muted-foreground">Pay with PayPal</div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubscribe}
              disabled={!selectedPaymentMethod || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                `Subscribe for ${formatPrice(plan.price, plan.currency)}/${plan.interval}`
              )}
            </Button>
          </div>

          {/* Security Notice */}
          <div className="text-xs text-muted-foreground text-center">
            <div className="flex items-center justify-center space-x-1">
              <Check className="h-3 w-3" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center justify-center space-x-1">
              <Check className="h-3 w-3" />
              <span>Cancel anytime</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
