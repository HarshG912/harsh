import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, CreditCard, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PLANS, PlanType } from '@/types/plans';
import { useEffect, useState } from 'react';
import { useTenant } from '@/contexts/TenantContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useRazorpay } from '@/hooks/use-razorpay';

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function Checkout() {
  const navigate = useNavigate();
  const { tenantId, planId } = useParams<{ tenantId: string; planId: string }>();
  const { tenant } = useTenant();
  const { toast } = useToast();
  const { isLoaded: razorpayLoaded } = useRazorpay();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  const plan = PLANS[planId as PlanType];
  const currentPlan = tenant?.plan ? PLANS[tenant.plan as PlanType] : null;
  const isUpgrade = plan && currentPlan && (plan.price || 0) > (currentPlan.price || 0);
  const isDowngrade = plan && currentPlan && (plan.price || 0) < (currentPlan.price || 0);

  useEffect(() => {
    initializeCheckout();
  }, [plan, tenantId, planId]);

  const initializeCheckout = async () => {
    if (!plan || plan.price === null) {
      navigate(`/${tenantId}/plans`);
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please log in to continue",
      });
      navigate(`/${tenantId}/admin`);
      return;
    }

    setUser(session.user);

    // Create order for plan change
    try {
      const { data, error } = await supabase.functions.invoke("process-plan-change", {
        body: {
          action: 'create_order',
          tenant_id: tenantId,
          new_plan_id: planId,
          user_id: session.user.id,
        },
      });

      if (error) throw error;

      if (data.requires_payment === false) {
        // Downgrade processed immediately
        toast({
          title: "Plan Changed!",
          description: data.message,
        });
        navigate(`/${tenantId}/admin`);
        return;
      }

      setOrderDetails(data);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to process plan change",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!razorpayLoaded || !orderDetails || !user) {
      toast({
        variant: "destructive",
        title: "Not Ready",
        description: "Payment gateway is loading. Please wait.",
      });
      return;
    }

    setProcessing(true);

    const options = {
      key: orderDetails.key_id,
      amount: orderDetails.amount,
      currency: orderDetails.currency,
      name: "Scan The Table",
      description: `Plan Upgrade to ${plan?.name}`,
      order_id: orderDetails.order_id,
      prefill: {
        email: user.email,
      },
      handler: async (response: any) => {
        try {
          const { data, error } = await supabase.functions.invoke("process-plan-change", {
            body: {
              action: 'verify_payment',
              tenant_id: tenantId,
              new_plan_id: planId,
              user_id: user.id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            },
          });

          if (error) throw error;

          toast({
            title: "Plan Upgraded!",
            description: "Your subscription has been upgraded successfully.",
          });

          navigate(`/${tenantId}/admin`);
        } catch (error: any) {
          console.error("Payment verification error:", error);
          toast({
            variant: "destructive",
            title: "Payment Verification Failed",
            description: error.message || "Please contact support",
          });
          setProcessing(false);
        }
      },
      modal: {
        ondismiss: () => {
          setProcessing(false);
        },
      },
      theme: {
        color: "#7c3aed",
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (!plan || plan.price === null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/${tenantId}/plans`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl flex items-center justify-center gap-2">
              <CreditCard className="h-8 w-8" />
              {isUpgrade ? 'Upgrade Your Plan' : 'Change Your Plan'}
            </CardTitle>
            <CardDescription>
              {isUpgrade ? `Upgrade from ${currentPlan?.name} to ${plan.name}` : `Switch to ${plan.name}`}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Plan */}
            {currentPlan && (
              <div className="bg-secondary/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">Current Plan</p>
                <p className="font-semibold">{currentPlan.name} - {currentPlan.priceDisplay}</p>
              </div>
            )}

            {/* New Plan */}
            <div className="bg-primary/10 p-4 rounded-lg border-2 border-primary">
              <p className="text-sm text-muted-foreground">New Plan</p>
              <p className="font-semibold text-lg">{plan.name} - {plan.priceDisplay}</p>
            </div>

            {/* Plan Features */}
            <div className="space-y-2">
              <h3 className="font-medium">What you'll get:</h3>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Payment Summary */}
            {orderDetails && orderDetails.requires_payment && (
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium">Payment Summary</h3>
                <div className="flex justify-between text-sm">
                  <span>Current Plan ({currentPlan?.name})</span>
                  <span>₹{currentPlan?.price}/month</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>New Plan ({plan.name})</span>
                  <span>₹{plan.price}/month</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Upgrade Cost</span>
                  <span>₹{orderDetails.price_difference}</span>
                </div>
              </div>
            )}

            <Button
              onClick={handlePayment}
              disabled={processing || !orderDetails}
              className="w-full"
              size="lg"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay ₹{orderDetails?.price_difference || 0} & Upgrade
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              Your new plan will be activated immediately after payment.
              The billing cycle will reset.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
