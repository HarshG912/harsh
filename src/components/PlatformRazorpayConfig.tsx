import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, CreditCard, Eye, EyeOff, Save } from "lucide-react";

interface PlatformConfig {
  id?: string;
  razorpay_key_id: string;
  razorpay_key_secret: string;
  setup_fee: number;
  is_active: boolean;
}

export function PlatformRazorpayConfig() {
  const [config, setConfig] = useState<PlatformConfig>({
    razorpay_key_id: "",
    razorpay_key_secret: "",
    setup_fee: 1200,
    is_active: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showSecret, setShowSecret] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const { data, error } = await supabase
        .from("platform_razorpay_config")
        .select("*")
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data) {
        setConfig(data);
      }
    } catch (error) {
      console.error("Error fetching platform config:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!config.razorpay_key_id || !config.razorpay_key_secret) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Razorpay Key ID and Secret are required",
      });
      return;
    }

    setSaving(true);
    try {
      if (config.id) {
        const { error } = await supabase
          .from("platform_razorpay_config")
          .update({
            razorpay_key_id: config.razorpay_key_id,
            razorpay_key_secret: config.razorpay_key_secret,
            setup_fee: config.setup_fee,
            is_active: config.is_active,
          })
          .eq("id", config.id);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("platform_razorpay_config")
          .insert({
            razorpay_key_id: config.razorpay_key_id,
            razorpay_key_secret: config.razorpay_key_secret,
            setup_fee: config.setup_fee,
            is_active: config.is_active,
          })
          .select()
          .single();

        if (error) throw error;
        setConfig(data);
      }

      toast({
        title: "Configuration Saved",
        description: "Platform Razorpay settings updated successfully",
      });
    } catch (error) {
      console.error("Error saving config:", error);
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: "Failed to save Razorpay configuration",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-5 w-5" />
          Subscription Payment Settings
        </CardTitle>
        <CardDescription>
          Configure Razorpay credentials for collecting subscription payments from new tenants
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="key_id">Razorpay Key ID</Label>
          <Input
            id="key_id"
            value={config.razorpay_key_id}
            onChange={(e) => setConfig({ ...config, razorpay_key_id: e.target.value })}
            placeholder="rzp_live_..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="key_secret">Razorpay Key Secret</Label>
          <div className="relative">
            <Input
              id="key_secret"
              type={showSecret ? "text" : "password"}
              value={config.razorpay_key_secret}
              onChange={(e) => setConfig({ ...config, razorpay_key_secret: e.target.value })}
              placeholder="Enter key secret"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3"
              onClick={() => setShowSecret(!showSecret)}
            >
              {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="setup_fee">Setup Fee (₹)</Label>
          <Input
            id="setup_fee"
            type="number"
            value={config.setup_fee}
            onChange={(e) => setConfig({ ...config, setup_fee: Number(e.target.value) })}
            placeholder="1200"
          />
          <p className="text-xs text-muted-foreground">
            One-time setup fee charged to new subscribers
          </p>
        </div>

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>

        {config.id && (
          <p className="text-xs text-muted-foreground text-center">
            Configuration is {config.is_active ? "active" : "inactive"}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
