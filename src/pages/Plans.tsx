import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PlanCard } from '@/components/PlanCard';
import { PLANS } from '@/types/plans';
import { useTenant } from '@/contexts/TenantContext';
import { Loader2 } from 'lucide-react';

export default function Plans() {
  const navigate = useNavigate();
  const { tenantId, tenant, isLoading } = useTenant();

  const handleSelectPlan = (planId: string) => {
    navigate(`/${tenantId}/checkout/${planId}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Unable to Load Plans</h1>
          <p className="text-muted-foreground">Please try again later.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="ghost"
          onClick={() => navigate(`/${tenantId}/admin`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
          <p className="text-muted-foreground text-lg">
            Select the perfect plan for your restaurant's needs
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Current Plan: <span className="font-semibold text-primary">{tenant?.plan ? PLANS[tenant.plan as keyof typeof PLANS]?.name : 'Standard'}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(PLANS).map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              currentPlan={tenant?.plan}
              onSelectPlan={handleSelectPlan}
            />
          ))}
        </div>

        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>All plans can be upgraded or downgraded at any time.</p>
          <p className="mt-2">Need help choosing? Contact us at witchcraft912@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
