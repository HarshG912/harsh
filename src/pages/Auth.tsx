import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  const redirectBasedOnRole = async (userId: string) => {
    const { data: rolesData, error: roleError } = await supabase
      .from("user_roles")
      .select("role, tenant_id")
      .eq("user_id", userId);

    console.log("redirectBasedOnRole - Roles query result:", { rolesData, roleError });

    if (roleError) {
      console.error("redirectBasedOnRole - Role fetch error:", roleError);
      return false;
    }

    if (!rolesData || rolesData.length === 0) {
      console.log("redirectBasedOnRole - No roles found");
      return false;
    }

    // Role priority: universal admin > manager > tenant_admin > chef > waiter
    const universalAdmin = rolesData.find((r) => r.role === "admin" && r.tenant_id === null);
    const manager = rolesData.find((r) => r.role === "manager" && r.tenant_id);
    const tenantAdmin = rolesData.find((r) => r.role === "tenant_admin" && r.tenant_id);
    const chef = rolesData.find((r) => r.role === "chef" && r.tenant_id);
    const waiter = rolesData.find((r) => r.role === "waiter" && r.tenant_id);

    if (universalAdmin) {
      navigate("/admin");
    } else if (manager) {
      navigate(`/${manager.tenant_id}/analytics`);
    } else if (tenantAdmin) {
      navigate(`/${tenantAdmin.tenant_id}/admin`);
    } else if (chef) {
      navigate(`/${chef.tenant_id}/chef`);
    } else if (waiter) {
      navigate(`/${waiter.tenant_id}/waiter`);
    } else {
      return false;
    }
    return true;
  };

  useEffect(() => {
    // Check for message from redirect
    const message = searchParams.get("message");
    if (message) {
      toast({
        title: "Info",
        description: decodeURIComponent(message),
      });
    }

    // Listen for auth state changes (handles OAuth redirect)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.id);
        
        if (event === "SIGNED_IN" && session) {
          const hasRole = await redirectBasedOnRole(session.user.id);
          if (!hasRole) {
            // User exists but has no role - redirect to plans
            toast({
              title: "No Active Subscription",
              description: "Please purchase a plan to activate your account.",
            });
            await supabase.auth.signOut();
            navigate("/plansopen?message=" + encodeURIComponent("Purchase a plan to activate your account"));
          }
        }
      }
    );

    // Check if user is already logged in
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session) {
        await redirectBasedOnRole(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast, searchParams]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Google Sign-in failed",
        description: error.message || "Could not sign in with Google",
      });
      setGoogleLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Fetch user roles to redirect appropriately
      const hasRole = await redirectBasedOnRole(data.user.id);

      if (!hasRole) {
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "No valid role assigned to this account.",
        });
        await supabase.auth.signOut();
        return;
      }

      toast({
        title: "Login successful",
        description: "Redirecting...",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login failed",
        description: error.message || "Invalid credentials",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Staff Login</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Sign-in Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleSignIn}
            disabled={googleLoading || loading}
          >
            {googleLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="staff@scanthetable.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading || googleLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading || googleLoading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || googleLoading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login with Email"
              )}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => navigate("/plansopen")}
            >
              View Plans
            </Button>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
