import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useRazorpay } from "@/hooks/use-razorpay";
import { PLANS } from "@/types/plans";
import { Loader2, ArrowLeft, CheckCircle, CreditCard } from "lucide-react";

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function SubscriptionCheckout() {
  const { planId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isLoaded: razorpayLoaded } = useRazorpay();
  
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [orderDetails, setOrderDetails] = useState<any>(null);
  
  const businessName = searchParams.get("business") || "";
  const restaurantName = searchParams.get("restaurant") || "";
  const contactPhone = searchParams.get("phone") || "";

  const plan = planId ? PLANS[planId as keyof typeof PLANS] : null;

  useEffect(() => {
    checkUserAndCreateOrder();
  }, [planId]);

  const checkUserAndCreateOrder = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please sign in to continue",
      });
      navigate("/plansopen");
      return;
    }

    setUser(session.user);

    if (!plan || !plan.price) {
      toast({
        variant: "destructive",
        title: "Invalid Plan",
        description: "Please select a valid plan",
      });
      navigate("/plansopen");
      return;
    }

    // Create subscription order
    try {
      const { data, error } = await supabase.functions.invoke("create-subscription-order", {
        body: {
          plan_id: planId,
          user_id: session.user.id,
          user_email: session.user.email,
          business_name: businessName,
          restaurant_name: restaurantName,
          contact_phone: contactPhone,
        },
      });

      if (error) throw error;

      setOrderDetails(data);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create payment order",
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
      description: `${plan?.name} Subscription`,
      order_id: orderDetails.order_id,
      prefill: {
        email: user.email,
        contact: contactPhone,
      },
      handler: async (response: any) => {
        try {
          const { data, error } = await supabase.functions.invoke("verify-subscription-payment", {
            body: {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              plan_id: planId,
              user_id: user.id,
              user_email: user.email,
              business_name: businessName,
              restaurant_name: restaurantName,
              contact_phone: contactPhone,
            },
          });

          if (error) throw error;

          toast({
            title: "Payment Successful!",
            description: "Your subscription has been activated.",
          });

          // Redirect to password setup
          navigate("/setup-password", { 
            state: { tenantId: data.tenant_id } 
          });
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

  if (!plan || !plan.price) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">Invalid plan selected</p>
            <Button onClick={() => navigate("/plansopen")} className="mt-4">
              Back to Plans
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container max-w-2xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/plansopen")}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Plans
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Complete Your Subscription
            </CardTitle>
            <CardDescription>
              You're subscribing to {plan.name}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Business Details */}
            <div className="bg-secondary/50 rounded-lg p-4 space-y-2">
              <h3 className="font-medium">Business Details</h3>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Business Name:</span> {businessName}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Restaurant:</span> {restaurantName}
              </p>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              {contactPhone && (
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium">Phone:</span> {contactPhone}
                </p>
              )}
            </div>

            {/* Plan Features */}
            <div className="space-y-2">
              <h3 className="font-medium">Plan Features</h3>
              <ul className="space-y-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Price Breakdown */}
            {orderDetails && (
              <div className="border rounded-lg p-4 space-y-3">
                <h3 className="font-medium">Payment Summary</h3>
                <div className="flex justify-between text-sm">
                  <span>Setup Fee (One-time)</span>
                  <span>₹{orderDetails.setup_fee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{plan.name} (Monthly)</span>
                  <span>₹{orderDetails.plan_price}</span>
                </div>
                <div className="border-t pt-3 flex justify-between font-bold">
                  <span>Total</span>
                  <span>₹{orderDetails.total}</span>
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
                  Pay ₹{orderDetails?.total || 0}
                </>
              )}
            </Button>

            <p className="text-xs text-muted-foreground text-center">
              By proceeding, you agree to our Terms of Service and Privacy Policy.
              Subscription renews monthly at ₹{plan.price}.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
