-- Add subscription plan fields to tenants table
ALTER TABLE public.tenants 
ADD COLUMN plan text NOT NULL DEFAULT 'standard',
ADD COLUMN plan_start_date timestamp with time zone DEFAULT now(),
ADD COLUMN plan_end_date timestamp with time zone;

-- Add constraint for valid plans
ALTER TABLE public.tenants
ADD CONSTRAINT valid_plan CHECK (plan IN ('standard', 'pro', 'premium', 'enterprise'));

-- Add comment for clarity
COMMENT ON COLUMN public.tenants.plan IS 'Subscription plan: standard, pro, premium, or enterprise';
COMMENT ON COLUMN public.tenants.plan_start_date IS 'Date when the current plan started';
COMMENT ON COLUMN public.tenants.plan_end_date IS 'Date when the current plan ends (null for unlimited)';