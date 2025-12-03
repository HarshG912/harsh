import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Settings } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { DashboardHeader } from "@/components/DashboardHeader";
import { UserManagement } from "@/components/UserManagement";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { PLANS, PlanType } from "@/types/plans";
import { hasAnyPermission, type AppRole } from "@/lib/permissions";
import { PlanExpiryNotification } from "@/components/PlanExpiryNotification";
interface Settings {
  id: string;
  merchant_upi_id: string;
  service_charge: number;
  restaurant_name: string;
  restaurant_address: string;
  table_count: number;
  payment_modes: { cash: boolean; upi: boolean; card: boolean };
  menu_sheet_url: string | null;
  require_customer_auth: boolean;
  razorpay_enabled: boolean;
  razorpay_key_id: string;
  plan?: string;
}

export default function TenantAdmin() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [razorpayKeySecret, setRazorpayKeySecret] = useState("");
  const [isManager, setIsManager] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tenantId } = useParams<{ tenantId: string }>();
  const { planConfig, usage } = usePlanLimits(tenantId!);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    // Fetch ALL roles for the user (including universal admin with tenant_id = null)
    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, tenant_id")
      .eq("user_id", session.user.id);

    if (!roles || roles.length === 0) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this tenant's admin panel.",
        duration: 2000,
      });
      setTimeout(() => navigate("/auth"), 2000);
      return;
    }

    // Check if user has permission using cascading hierarchy
    // Universal admins (tenant_id = null) can access all tenant routes
    const userRoles = roles
      .filter(r => r.tenant_id === tenantId || r.tenant_id === null)
      .map(r => r.role as AppRole);

    const hasPermission = hasAnyPermission(userRoles, ['tenant_admin']);

    if (!hasPermission) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "You don't have permission to access this dashboard.",
        duration: 2000,
      });
      setTimeout(() => navigate("/auth"), 2000);
      return;
    }

    const isManagerRole = userRoles.some(r => r === 'manager');
    setIsManager(isManagerRole);

    await fetchSettings();
  };

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("tenant_settings")
        .select("*")
        .eq("tenant_id", tenantId)
        .limit(1)
        .single();

      const { data: tenantData } = await supabase
        .from('tenants')
        .select('plan')
        .eq('id', tenantId)
        .single();

      if (error) throw error;
      setSettings({
        ...data,
        payment_modes: data.payment_modes as { cash: boolean; upi: boolean; card: boolean },
        plan: tenantData?.plan || 'standard',
      });
    } catch (error) {
      console.error("Error fetching settings:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load settings",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settings) return;

    // Validate table count against plan limit
    const maxTables = planConfig?.limits.tables;
    if (maxTables !== null && settings.table_count > maxTables) {
      toast({
        variant: "destructive",
        title: "Table limit exceeded",
        description: `Your current plan allows maximum ${maxTables} tables. Upgrade your plan to add more tables.`,
      });
      return;
    }

    // Validate Razorpay settings
    if (settings.razorpay_enabled) {
      if (!settings.razorpay_key_id || !razorpayKeySecret) {
        toast({
          variant: "destructive",
          title: "Invalid Razorpay Configuration",
          description: "Please provide both Razorpay Key ID and Key Secret",
        });
        return;
      }
    }

    setSaving(true);

    try {
      // Update tenant settings
      const { error } = await supabase
        .from("tenant_settings")
        .update({
          merchant_upi_id: settings.merchant_upi_id,
          service_charge: settings.service_charge,
          restaurant_name: settings.restaurant_name,
          restaurant_address: settings.restaurant_address,
          table_count: settings.table_count,
          payment_modes: settings.payment_modes,
          menu_sheet_url: settings.menu_sheet_url,
          require_customer_auth: settings.require_customer_auth,
          razorpay_enabled: settings.razorpay_enabled,
          razorpay_key_id: settings.razorpay_key_id,
        })
        .eq("id", settings.id);

      if (error) throw error;

      // Update Razorpay secrets if provided
      if (settings.razorpay_enabled && razorpayKeySecret) {
        const { error: secretError } = await supabase
          .from("razorpay_tenant_secrets")
          .upsert({
            tenant_id: tenantId,
            key_secret: razorpayKeySecret,
          }, {
            onConflict: 'tenant_id'
          });

        if (secretError) throw secretError;
      }

      toast({
        title: "Settings saved",
        description: "Your changes have been saved successfully.",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Save failed",
        description: "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background animate-fade-in">
      <DashboardHeader
        title="Restaurant Admin"
        subtitle={settings?.restaurant_name || "Manage Settings"}
        logo={
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Settings className="h-6 w-6" />
          </div>
        }
        onLogout={handleLogout}
      />

      <div className="pt-14 sm:pt-16 md:pt-20">
        <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
          {/* Plan Expiry Notification */}
          <PlanExpiryNotification tenantId={tenantId!} />
          
          {/* Current Plan Card */}
          <Card className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-xl shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <CardTitle className="text-2xl">Current Plan</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {settings?.plan ? PLANS[settings.plan as PlanType]?.name : 'Standard Plan'}
                  </p>
                </div>
                <Button onClick={() => navigate(`/${tenantId}/plans`)}>
                  View All Plans
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Tables</p>
                  <p className="text-2xl font-bold">
                    {usage?.tables || 0} / {planConfig?.limits.tables || '∞'}
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Chefs</p>
                  <p className="text-2xl font-bold">
                    {usage?.chefs || 0} / {planConfig?.limits.chefs || '∞'}
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Managers</p>
                  <p className="text-2xl font-bold">
                    {usage?.managers || 0} / {planConfig?.limits.managers || '∞'}
                  </p>
                </div>
                <div className="bg-background/50 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">Waiters</p>
                  <p className="text-2xl font-bold">
                    {usage?.waiters || 0} / {planConfig?.limits.waiters || '∞'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* User Management */}
          <UserManagement tenantId={tenantId!} />

          {/* Restaurant Settings Card */}
          <Card className="rounded-xl shadow-lg">
            <CardHeader>
              <CardTitle>Restaurant Settings</CardTitle>
              <CardDescription>
                Configure your restaurant's payment and operational settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="restaurant_name">Restaurant Name</Label>
                <Input
                  id="restaurant_name"
                  value={settings?.restaurant_name || ""}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, restaurant_name: e.target.value } : null)}
                  placeholder="My Restaurant"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="restaurant_address">Restaurant Address</Label>
                <Input
                  id="restaurant_address"
                  value={settings?.restaurant_address || ""}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, restaurant_address: e.target.value } : null)}
                  placeholder="123 Main Street, City"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="merchant_upi">Merchant UPI ID</Label>
                <Input
                  id="merchant_upi"
                  value={settings?.merchant_upi_id || ""}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, merchant_upi_id: e.target.value } : null)}
                  placeholder="merchant@upi"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="service_charge">Service Charge (%)</Label>
                <Input
                  id="service_charge"
                  type="number"
                  value={settings?.service_charge || 0}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, service_charge: parseFloat(e.target.value) } : null)}
                  placeholder="5"
                  min="0"
                  max="100"
                  step="0.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="table_count">Number of Tables</Label>
                <Input
                  id="table_count"
                  type="number"
                  value={settings?.table_count || 0}
                  onChange={(e) => {
                    const newValue = parseInt(e.target.value);
                    const maxTables = planConfig?.limits.tables;
                    
                    if (maxTables !== null && newValue > maxTables) {
                      toast({
                        variant: "destructive",
                        title: "Table limit exceeded",
                        description: `Your plan allows maximum ${maxTables} tables`,
                      });
                      return;
                    }
                    
                    setSettings(prev => prev ? { ...prev, table_count: newValue } : null);
                  }}
                  placeholder="10"
                  min="1"
                  max={planConfig?.limits.tables || undefined}
                />
                {planConfig?.limits.tables && (
                  <p className="text-xs text-muted-foreground">
                    Maximum {planConfig.limits.tables} tables allowed in your current plan
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu_sheet">Google Sheet Link (Menu)</Label>
                <Input
                  id="menu_sheet"
                  value={settings?.menu_sheet_url || ""}
                  onChange={(e) => setSettings(prev => prev ? { ...prev, menu_sheet_url: e.target.value } : null)}
                  placeholder="https://docs.google.com/spreadsheets/..."
                />
              </div>

              <div className="space-y-3">
                <Label>Payment Modes</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="cash"
                      checked={settings?.payment_modes.cash || false}
                      onCheckedChange={(checked) => 
                        setSettings(prev => prev ? {
                          ...prev,
                          payment_modes: { ...prev.payment_modes, cash: checked as boolean }
                        } : null)
                      }
                    />
                    <Label htmlFor="cash" className="font-normal cursor-pointer">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="upi"
                      checked={settings?.payment_modes.upi || false}
                      onCheckedChange={(checked) => 
                        setSettings(prev => prev ? {
                          ...prev,
                          payment_modes: { ...prev.payment_modes, upi: checked as boolean }
                        } : null)
                      }
                    />
                    <Label htmlFor="upi" className="font-normal cursor-pointer">UPI</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="card"
                      checked={settings?.payment_modes.card || false}
                      onCheckedChange={(checked) => 
                        setSettings(prev => prev ? {
                          ...prev,
                          payment_modes: { ...prev.payment_modes, card: checked as boolean }
                        } : null)
                      }
                    />
                    <Label htmlFor="card" className="font-normal cursor-pointer">Card</Label>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Customer Authentication</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="require_customer_auth"
                    checked={settings?.require_customer_auth ?? true}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        require_customer_auth: checked as boolean
                      } : null)
                    }
                  />
                  <Label htmlFor="require_customer_auth" className="font-normal cursor-pointer">
                    Require customers to login before placing orders
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  When disabled, customers can place orders without authentication. Enable for order tracking and customer data collection.
                </p>
              </div>

              <div className="border-t pt-6 space-y-4">
                <div className="space-y-2">
                  <Label className="text-lg font-semibold">Razorpay Payment Gateway</Label>
                  <p className="text-sm text-muted-foreground">
                    Accept online payments securely via Razorpay. Orders are confirmed only after successful payment.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="razorpay_enabled"
                    checked={settings?.razorpay_enabled ?? false}
                    onCheckedChange={(checked) => 
                      setSettings(prev => prev ? {
                        ...prev,
                        razorpay_enabled: checked as boolean
                      } : null)
                    }
                  />
                  <Label htmlFor="razorpay_enabled" className="font-normal cursor-pointer">
                    Enable Razorpay Payments
                  </Label>
                </div>

                {settings?.razorpay_enabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="razorpay_key_id">
                        Razorpay Key ID <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="razorpay_key_id"
                        value={settings?.razorpay_key_id || ""}
                        onChange={(e) => setSettings(prev => prev ? { ...prev, razorpay_key_id: e.target.value } : null)}
                        placeholder="rzp_test_xxxxxxxxxxxxx"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your Razorpay public key (safe to display)
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="razorpay_key_secret">
                        Razorpay Key Secret <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="razorpay_key_secret"
                        type="password"
                        value={razorpayKeySecret}
                        onChange={(e) => setRazorpayKeySecret(e.target.value)}
                        placeholder="Enter your Razorpay Key Secret"
                      />
                      <p className="text-xs text-muted-foreground">
                        Your Razorpay secret key (stored securely, never displayed)
                      </p>
                    </div>

                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">Webhook Configuration (Optional)</p>
                      <p className="text-xs text-muted-foreground">
                        To receive async payment confirmations, configure webhook in Razorpay Dashboard:
                      </p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Go to Settings → Webhooks in Razorpay Dashboard</li>
                        <li className="break-words">Add webhook URL: <code className="bg-background px-1 py-0.5 rounded text-primary break-all">{`${window.location.origin}/functions/v1/razorpay-webhook`}</code></li>
                        <li>Select events: payment.captured, payment.failed</li>
                        <li>Save the webhook secret and add it to Key Secret above</li>
                      </ol>
                    </div>

                    <div className="bg-muted p-4 rounded-lg space-y-2">
                      <p className="text-sm font-medium">How to get Razorpay API keys:</p>
                      <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
                        <li>Sign up at <a href="https://dashboard.razorpay.com/signup" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">razorpay.com</a></li>
                        <li>Go to Settings → API Keys</li>
                        <li>Generate keys (use Test mode for testing)</li>
                        <li>Copy both Key ID and Key Secret here</li>
                      </ol>
                    </div>
                  </>
                )}
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full"
              >
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Settings
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
