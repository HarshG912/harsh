-- Add Razorpay fields to tenant_settings
ALTER TABLE tenant_settings 
ADD COLUMN razorpay_key_id TEXT,
ADD COLUMN razorpay_enabled BOOLEAN DEFAULT false;

-- Add Razorpay fields to orders table
ALTER TABLE orders 
ADD COLUMN razorpay_order_id TEXT,
ADD COLUMN razorpay_payment_id TEXT,
ADD COLUMN razorpay_signature TEXT;

-- Create razorpay_tenant_secrets table for secure storage of secrets
CREATE TABLE razorpay_tenant_secrets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE UNIQUE,
  key_secret TEXT NOT NULL,
  webhook_secret TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE razorpay_tenant_secrets ENABLE ROW LEVEL SECURITY;

-- Only universal admin can read/write
CREATE POLICY "Universal admin can manage razorpay secrets"
ON razorpay_tenant_secrets
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_id = auth.uid() 
  AND role = 'admin' 
  AND tenant_id IS NULL
));

-- Tenant admin can view own secrets (read-only for frontend display)
CREATE POLICY "Tenant admin can view own razorpay settings"
ON razorpay_tenant_secrets
FOR SELECT
USING (tenant_id IN (
  SELECT tenant_id FROM user_roles
  WHERE user_id = auth.uid() 
  AND role = 'tenant_admin'
));

-- Create trigger for updated_at
CREATE TRIGGER update_razorpay_secrets_updated_at
BEFORE UPDATE ON razorpay_tenant_secrets
FOR EACH ROW
EXECUTE FUNCTION update_settings_updated_at();