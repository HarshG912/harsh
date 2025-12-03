import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { checkPermission, type AppRole } from "@/lib/permissions";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, LayoutDashboard, Users, ChefHat, ClipboardList, Shield } from "lucide-react";

interface DashboardOption {
  role: AppRole;
  label: string;
  path: string;
  icon: React.ReactNode;
}

export function RoleSwitcher() {
  const navigate = useNavigate();
  const { tenantId } = useParams();
  const [userRoles, setUserRoles] = useState<AppRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) return;

      const { data: roles } = await supabase
        .from("user_roles")
        .select("role, tenant_id")
        .eq("user_id", session.user.id);

      if (roles) {
        // Filter roles relevant to current tenant or universal admin
        const relevantRoles = roles
          .filter((r) => r.tenant_id === tenantId || r.tenant_id === null)
          .map((r) => r.role as AppRole);
        setUserRoles(relevantRoles);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Define all possible dashboards with their role requirements
  const allDashboards: DashboardOption[] = [
    {
      role: "admin",
      label: "Universal Admin",
      path: "/universal-admin",
      icon: <Shield className="h-4 w-4" />,
    },
    {
      role: "tenant_admin",
      label: "Tenant Admin",
      path: `/${tenantId}/admin`,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      role: "manager",
      label: "Manager",
      path: `/${tenantId}/analytics`,
      icon: <Users className="h-4 w-4" />,
    },
    {
      role: "chef",
      label: "Chef",
      path: `/${tenantId}/chef`,
      icon: <ChefHat className="h-4 w-4" />,
    },
    {
      role: "waiter",
      label: "Waiter",
      path: `/${tenantId}/waiter`,
      icon: <ClipboardList className="h-4 w-4" />,
    },
  ];

  // Filter dashboards based on user's role permissions
  const accessibleDashboards = allDashboards.filter((dashboard) => {
    // Check if any of the user's roles grants access to this dashboard
    return userRoles.some((userRole) => checkPermission(userRole, dashboard.role));
  });

  if (isLoading || accessibleDashboards.length <= 1) {
    return null; // Don't show dropdown if loading or only one dashboard accessible
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="secondary"
          size="sm"
          className="bg-white/10 text-primary-foreground hover:bg-white/20 backdrop-blur-sm h-9 px-3"
        >
          <LayoutDashboard className="h-4 w-4 mr-2" />
          <span className="hidden sm:inline">Switch Dashboard</span>
          <span className="sm:hidden">Switch</span>
          <ChevronDown className="h-4 w-4 ml-2" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-background/95 backdrop-blur-md z-[100]">
        <DropdownMenuLabel>Available Dashboards</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {accessibleDashboards.map((dashboard) => (
          <DropdownMenuItem key={dashboard.role} onClick={() => navigate(dashboard.path)} className="cursor-pointer">
            {dashboard.icon}
            <span className="ml-2">{dashboard.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
