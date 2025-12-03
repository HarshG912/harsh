import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlanCard } from "@/components/PlanCard";
import { PLANS } from "@/types/plans";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function PlansOpen() {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showBusinessForm, setShowBusinessForm] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  const [businessName, setBusinessName] = useState("");
  const [restaurantName, setRestaurantName] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  useEffect(() => {
    // Check if user is already signed in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      }
    };
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setShowAuthDialog(false);
        setShowBusinessForm(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSelectPlan = (planId: string) => {
    if (planId === "enterprise") {
      window.location.href = "mailto:witchcraft912@gmail.com?subject=Enterprise Plan Inquiry";
      return;
    }
    
    setSelectedPlan(planId);
    
    if (user) {
      setShowBusinessForm(true);
    } else {
      setShowAuthDialog(true);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/plansopen?plan=${selectedPlan}`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      console.error("Auth error:", error);
      toast({
        variant: "destructive",
        title: "Authentication Failed",
        description: error.message || "Failed to sign in with Google",
      });
      setAuthLoading(false);
    }
  };

  const handleBusinessFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!businessName.trim() || !restaurantName.trim()) {
      toast({
        variant: "destructive",
        title: "Required Fields",
        description: "Please fill in business name and restaurant name",
      });
      return;
    }

    // Navigate to checkout with business details
    const params = new URLSearchParams({
      business: businessName,
      restaurant: restaurantName,
      phone: contactPhone,
    });
    
    navigate(`/subscribe/${selectedPlan}?${params.toString()}`);
  };

  // Check for plan in URL (after OAuth redirect)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const planFromUrl = urlParams.get("plan");
    if (planFromUrl && user) {
      setSelectedPlan(planFromUrl);
      setShowBusinessForm(true);
      // Clean URL
      window.history.replaceState({}, "", "/plansopen");
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button variant="ghost" onClick={() => navigate(`/`)} className="mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Our Plans</h1>
          <p className="text-muted-foreground text-lg">Choose the perfect plan for your business</p>
          <p className="text-sm text-muted-foreground mt-2">Start your journey with Scan The Table</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(PLANS).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelectPlan={handleSelectPlan}
              currentPlan={undefined}
            />
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans include a one-time setup fee of ₹1200.</p>
          <p className="mt-2">Need help? Contact us at witchcraft912@gmail.com</p>
        </div>
      </div>

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sign In to Continue</DialogTitle>
            <DialogDescription>
              Sign in with Google to subscribe to {selectedPlan && PLANS[selectedPlan as keyof typeof PLANS]?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <Button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="w-full"
              size="lg"
            >
              {authLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                  </svg>
                  Sign in with Google
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              By signing in, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Business Details Form Dialog */}
      <Dialog open={showBusinessForm} onOpenChange={setShowBusinessForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Business Details</DialogTitle>
            <DialogDescription>
              Tell us about your business to set up your account
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleBusinessFormSubmit} className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="businessName">Business Name *</Label>
              <Input
                id="businessName"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="Your Business Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="restaurantName">Restaurant Name *</Label>
              <Input
                id="restaurantName"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Your Restaurant Name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
              <Input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div className="bg-secondary/50 rounded-lg p-3">
              <p className="text-sm text-muted-foreground">
                <span className="font-medium">Email:</span> {user?.email}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Plan:</span> {selectedPlan && PLANS[selectedPlan as keyof typeof PLANS]?.name}
              </p>
            </div>

            <Button type="submit" className="w-full" size="lg">
              Continue to Payment
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
