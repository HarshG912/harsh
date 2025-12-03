import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Clock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { differenceInDays, format } from "date-fns";

interface PlanExpiryNotificationProps {
  tenantId: string;
}

export function PlanExpiryNotification({ tenantId }: PlanExpiryNotificationProps) {
  const [tenant, setTenant] = useState<{
    plan: string;
    plan_end_date: string | null;
    restaurant_name: string;
  } | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTenantPlan();
  }, [tenantId]);

  const fetchTenantPlan = async () => {
    const { data, error } = await supabase
      .from("tenants")
      .select("plan, plan_end_date, restaurant_name")
      .eq("id", tenantId)
      .single();

    if (!error && data) {
      setTenant(data);
    }
  };

  if (!tenant || !tenant.plan_end_date || dismissed) {
    return null;
  }

  const endDate = new Date(tenant.plan_end_date);
  const today = new Date();
  const daysRemaining = differenceInDays(endDate, today);

  // Don't show notification if more than 7 days remaining
  if (daysRemaining > 7) {
    return null;
  }

  // Determine urgency level
  const isExpired = daysRemaining < 0;
  const isCritical = daysRemaining <= 1 && !isExpired;
  const isWarning = daysRemaining <= 3 && !isCritical && !isExpired;

  const getVariant = () => {
    if (isExpired) return "destructive";
    if (isCritical) return "destructive";
    return "default";
  };

  const getMessage = () => {
    if (isExpired) {
      return `Your plan expired ${Math.abs(daysRemaining)} day(s) ago. Renew now to continue using all features.`;
    }
    if (daysRemaining === 0) {
      return "Your plan expires today! Renew now to avoid service interruption.";
    }
    if (daysRemaining === 1) {
      return "Your plan expires tomorrow! Renew now to avoid service interruption.";
    }
    return `Your plan expires in ${daysRemaining} days (${format(endDate, "MMM dd, yyyy")}). Renew soon to continue enjoying all features.`;
  };

  return (
    <Alert 
      variant={getVariant()} 
      className={`mb-4 relative ${
        isExpired || isCritical 
          ? "bg-destructive/10 border-destructive" 
          : isWarning 
            ? "bg-orange-500/10 border-orange-500" 
            : "bg-yellow-500/10 border-yellow-500"
      }`}
    >
      <div className="flex items-start gap-3">
        {isExpired || isCritical ? (
          <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        ) : (
          <Clock className={`h-5 w-5 flex-shrink-0 mt-0.5 ${isWarning ? "text-orange-500" : "text-yellow-500"}`} />
        )}
        <div className="flex-1">
          <AlertTitle className="text-base font-semibold">
            {isExpired ? "Plan Expired" : "Plan Expiring Soon"}
          </AlertTitle>
          <AlertDescription className="mt-1 text-sm">
            {getMessage()}
          </AlertDescription>
          <Button 
            size="sm" 
            className="mt-3"
            onClick={() => navigate(`/${tenantId}/plans`)}
          >
            {isExpired ? "Renew Now" : "View Plans"}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={() => setDismissed(true)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </Alert>
  );
}
