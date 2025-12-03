import { Navigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';
import { hasAnyPermission, type AppRole } from '@/lib/permissions';

interface TenantRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export const TenantRoute = ({ children, allowedRoles }: TenantRouteProps) => {
  const { tenantId } = useParams<{ tenantId: string }>();

  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  const { data: roleData, isLoading: roleLoading } = useQuery({
    queryKey: ['userRole', session?.user?.id, tenantId],
    queryFn: async () => {
      if (!session?.user?.id) return null;
      
      // Fetch ALL roles for the user (including universal admin with tenant_id = null)
      const { data, error } = await supabase
        .from('user_roles')
        .select('role, tenant_id')
        .eq('user_id', session.user.id);
      
      if (error) {
        console.error('Role fetch error:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!session?.user?.id && !!tenantId,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });

  // Show loading state while checking authentication
  if (sessionLoading || (session && roleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to auth if no session
  if (!session) {
    return <Navigate to="/auth" replace />;
  }

  // Redirect to auth if no roles found
  if (!roleData || roleData.length === 0) {
    return <Navigate to="/auth" replace />;
  }

  // Check if user has permission using cascading hierarchy
  // Universal admins (tenant_id = null) can access all tenant routes
  const userRoles = roleData
    .filter(r => r.tenant_id === tenantId || r.tenant_id === null)
    .map(r => r.role as AppRole);

  const hasPermission = hasAnyPermission(userRoles, allowedRoles as AppRole[]);

  if (!hasPermission) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
};
