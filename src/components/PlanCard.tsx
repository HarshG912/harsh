import { Check } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plan } from "@/types/plans";

interface PlanCardProps {
  plan: Plan;
  currentPlan?: string;
  overrideBuyUrl?: string;
  onSelectPlan: (planId: string) => void;
}

export const PlanCard = ({ plan, currentPlan, onSelectPlan, overrideBuyUrl }: PlanCardProps) => {
  const isCurrent = currentPlan === plan.id;
  const isEnterprise = plan.id === "enterprise";

  const handleClick = () => {
    // NEW: If override URL exists (used in plansopen)
    if (overrideBuyUrl) {
      window.location.href = overrideBuyUrl;
      return;
    }

    // Existing enterprise logic
    if (isEnterprise) {
      const subject = encodeURIComponent("Enterprise Plan Inquiry");
      const body = encodeURIComponent("Interested in the enterprise plan, let's talk!");
      window.location.href = `mailto:witchcraft912@gmail.com?subject=${subject}&body=${body}`;
      return;
    }

    // Existing normal checkout behavior
    onSelectPlan(plan.id);
  };

  return (
    <Card className={`relative ${isCurrent ? "border-primary shadow-lg" : ""} ${plan.popular ? "border-accent" : ""}`}>
      {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>}
      {isCurrent && (
        <Badge variant="secondary" className="absolute -top-3 right-4">
          Current Plan
        </Badge>
      )}
      <CardHeader>
        <CardTitle className="text-2xl">{plan.name}</CardTitle>
        <CardDescription className="text-3xl font-bold text-foreground">{plan.priceDisplay}</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-2">
              <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <span className="text-sm">{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          className="w-full"
          variant={isCurrent ? "outline" : "default"}
          disabled={isCurrent}
          onClick={handleClick}
        >
          {isCurrent ? "Current Plan" : isEnterprise ? "Contact Us for Price" : "Buy Plan"}
        </Button>
      </CardFooter>
    </Card>
  );
};
