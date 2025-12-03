-- Create platform_razorpay_config table for universal admin to manage subscription payment credentials
CREATE TABLE public.platform_razorpay_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  razorpay_key_id text NOT NULL,
  razorpay_key_secret text NOT NULL,
  setup_fee numeric NOT NULL DEFAULT 1200,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.platform_razorpay_config ENABLE ROW LEVEL SECURITY;

-- Only universal admin can manage platform razorpay config
CREATE POLICY "Universal admin can manage platform razorpay config"
ON public.platform_razorpay_config
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
  AND user_roles.tenant_id IS NULL
));

-- Create subscription_payments table to track all subscription transactions
CREATE TABLE public.subscription_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  tenant_id uuid REFERENCES public.tenants(id),
  plan text NOT NULL,
  amount numeric NOT NULL,
  setup_fee numeric DEFAULT 0,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text NOT NULL DEFAULT 'pending',
  payment_type text NOT NULL DEFAULT 'new',
  business_name text,
  restaurant_name text,
  contact_phone text,
  contact_email text,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Enable RLS
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Universal admin can view all subscription payments
CREATE POLICY "Universal admin can view all subscription payments"
ON public.subscription_payments
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
  AND user_roles.tenant_id IS NULL
));

-- Universal admin can manage all subscription payments
CREATE POLICY "Universal admin can manage subscription payments"
ON public.subscription_payments
FOR ALL
USING (EXISTS (
  SELECT 1 FROM user_roles
  WHERE user_roles.user_id = auth.uid()
  AND user_roles.role = 'admin'
  AND user_roles.tenant_id IS NULL
));

-- Users can view their own subscription payments
CREATE POLICY "Users can view own subscription payments"
ON public.subscription_payments
FOR SELECT
USING (user_id = auth.uid());

-- Users can insert their own subscription payments (for pending orders)
CREATE POLICY "Users can insert own subscription payments"
ON public.subscription_payments
FOR INSERT
WITH CHECK (user_id = auth.uid());

-- Add needs_password_setup column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS needs_password_setup boolean DEFAULT false;

-- Create function to update timestamp
CREATE OR REPLACE FUNCTION public.update_platform_razorpay_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for platform_razorpay_config
CREATE TRIGGER update_platform_razorpay_config_updated_at
BEFORE UPDATE ON public.platform_razorpay_config
FOR EACH ROW
EXECUTE FUNCTION public.update_platform_razorpay_updated_at();