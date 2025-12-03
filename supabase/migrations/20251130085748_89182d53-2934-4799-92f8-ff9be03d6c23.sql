-- Fix infinite recursion in tenants table RLS policies
-- The issue is that one policy checks the public_tenant_info view which creates circular dependency

-- Drop the problematic policy
DROP POLICY IF EXISTS "Public can view basic tenant info via view" ON public.tenants;

-- Create a simpler policy that just checks if tenant is active without the view
CREATE POLICY "Public can view active tenants"
ON public.tenants
FOR SELECT
USING (is_active = true);