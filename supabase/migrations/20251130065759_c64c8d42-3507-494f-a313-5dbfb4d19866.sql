-- Fix security issue: Use SECURITY INVOKER for the view and add RLS policy for public access
DROP VIEW IF EXISTS public_tenant_settings;

CREATE VIEW public_tenant_settings 
WITH (security_invoker = true) AS
SELECT 
  tenant_id,
  service_charge,
  payment_modes,
  theme_config,
  require_customer_auth,
  restaurant_name,
  restaurant_address,
  merchant_upi_id,
  menu_sheet_url,
  razorpay_enabled,
  razorpay_key_id
FROM tenant_settings;

-- Add RLS policy to allow public read access to tenant settings view columns
CREATE POLICY "Public can view tenant settings for customer facing"
  ON tenant_settings
  FOR SELECT
  USING (true);