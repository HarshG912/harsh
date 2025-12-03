-- Update public_tenant_settings view to include Razorpay settings
DROP VIEW IF EXISTS public_tenant_settings;

CREATE VIEW public_tenant_settings AS
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