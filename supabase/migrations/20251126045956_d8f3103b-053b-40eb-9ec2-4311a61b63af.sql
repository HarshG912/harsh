
-- Drop existing problematic policies
DROP POLICY IF EXISTS "Tenant admin and manager can view tenant roles" ON user_roles;
DROP POLICY IF EXISTS "Tenant admin can manage tenant roles" ON user_roles;

-- Create security definer functions to get user info without triggering RLS
CREATE OR REPLACE FUNCTION get_user_tenant_id_bypass()
RETURNS uuid
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT tenant_id 
  FROM user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION get_user_role_bypass()
RETURNS app_role
SECURITY DEFINER
SET search_path = public
LANGUAGE sql
STABLE
AS $$
  SELECT role 
  FROM user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Create new policies that don't cause recursion
CREATE POLICY "Tenant admin and manager can view tenant roles"
ON user_roles
FOR SELECT
TO public
USING (
  tenant_id = get_user_tenant_id_bypass()
  AND get_user_tenant_id_bypass() IS NOT NULL
  AND get_user_role_bypass() IN ('tenant_admin', 'manager')
);

CREATE POLICY "Tenant admin can manage tenant roles"
ON user_roles
FOR ALL
TO public
USING (
  tenant_id = get_user_tenant_id_bypass()
  AND get_user_tenant_id_bypass() IS NOT NULL
  AND get_user_role_bypass() = 'tenant_admin'
)
WITH CHECK (
  tenant_id = get_user_tenant_id_bypass()
  AND get_user_tenant_id_bypass() IS NOT NULL
  AND get_user_role_bypass() = 'tenant_admin'
);
