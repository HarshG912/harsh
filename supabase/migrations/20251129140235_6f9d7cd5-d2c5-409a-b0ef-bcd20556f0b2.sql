-- Fix RLS policies for razorpay_tenant_secrets to support universal admins and proper upsert

-- Drop existing policies
DROP POLICY IF EXISTS "Tenant admins can view their tenant secrets" ON public.razorpay_tenant_secrets;
DROP POLICY IF EXISTS "Tenant admins can insert their tenant secrets" ON public.razorpay_tenant_secrets;
DROP POLICY IF EXISTS "Tenant admins can update their tenant secrets" ON public.razorpay_tenant_secrets;

-- Create improved policies that support universal admins and cascading hierarchy
CREATE POLICY "Admins can view tenant secrets"
  ON public.razorpay_tenant_secrets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND (
          -- Universal admin can access all
          user_roles.tenant_id IS NULL
          OR 
          -- Tenant admin can access their own tenant
          (user_roles.tenant_id = razorpay_tenant_secrets.tenant_id 
           AND user_roles.role = 'tenant_admin')
        )
    )
  );

CREATE POLICY "Admins can insert tenant secrets"
  ON public.razorpay_tenant_secrets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND (
          -- Universal admin can insert for any tenant
          user_roles.tenant_id IS NULL
          OR 
          -- Tenant admin can insert for their own tenant
          (user_roles.tenant_id = razorpay_tenant_secrets.tenant_id 
           AND user_roles.role = 'tenant_admin')
        )
    )
  );

CREATE POLICY "Admins can update tenant secrets"
  ON public.razorpay_tenant_secrets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles
      WHERE user_roles.user_id = auth.uid()
        AND (
          -- Universal admin can update any tenant
          user_roles.tenant_id IS NULL
          OR 
          -- Tenant admin can update their own tenant
          (user_roles.tenant_id = razorpay_tenant_secrets.tenant_id 
           AND user_roles.role = 'tenant_admin')
        )
    )
  );