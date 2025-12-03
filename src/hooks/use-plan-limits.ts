import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PLANS, PlanType } from '@/types/plans';

export const usePlanLimits = (tenantId: string) => {
  const { data: tenant, isLoading } = useQuery({
    queryKey: ['tenant-plan', tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tenants')
        .select('plan')
        .eq('id', tenantId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!tenantId,
  });

  const plan = tenant?.plan as PlanType || 'standard';
  const planConfig = PLANS[plan];

  const { data: usage } = useQuery({
    queryKey: ['plan-usage', tenantId],
    queryFn: async () => {
      // Get table count
      const { count: tableCount } = await supabase
        .from('restaurant_tables')
        .select('*', { count: 'exact', head: true })
        .eq('tenant_id', tenantId);

      // Get user counts by role
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('tenant_id', tenantId);

      const chefCount = roles?.filter(r => r.role === 'chef').length || 0;
      const managerCount = roles?.filter(r => r.role === 'manager').length || 0;
      const waiterCount = roles?.filter(r => r.role === 'waiter').length || 0;

      return {
        tables: tableCount || 0,
        chefs: chefCount,
        managers: managerCount,
        waiters: waiterCount,
      };
    },
    enabled: !!tenantId,
  });

  const canAddTable = () => {
    if (!usage || !planConfig.limits.tables) return true;
    return usage.tables < planConfig.limits.tables;
  };

  const canAddRole = (role: string) => {
    if (!usage) return false;
    if (!planConfig.limits.allowedRoles.includes(role)) return false;

    const limits = planConfig.limits;
    switch (role) {
      case 'chef':
        return limits.chefs === null || usage.chefs < limits.chefs;
      case 'manager':
        return limits.managers === null || usage.managers < limits.managers;
      case 'waiter':
        return limits.waiters === null || usage.waiters < limits.waiters;
      default:
        return true;
    }
  };

  return {
    plan,
    planConfig,
    usage,
    canAddTable,
    canAddRole,
    isLoading,
  };
};
