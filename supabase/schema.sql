-- ============================================
-- COMPLETE SCHEMA FOR SCAN THE TABLE
-- This file contains the entire database schema
-- Run this in SQL Editor when deploying to a new Supabase project
-- ============================================

-- ============================================
-- ENUMS
-- ============================================
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('admin', 'cook', 'chef', 'waiter', 'manager', 'tenant_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- TABLES
-- ============================================

-- Global Settings Table
CREATE TABLE IF NOT EXISTS public.global_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  login_type text NOT NULL DEFAULT 'google'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Settings Table (Legacy - for backward compatibility)
CREATE TABLE IF NOT EXISTS public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  merchant_upi_id text NOT NULL DEFAULT 'merchant@upi'::text,
  service_charge numeric NOT NULL DEFAULT 0,
  restaurant_name text NOT NULL DEFAULT 'Scan The Table'::text,
  menu_sheet_url text,
  restaurant_address text DEFAULT ''::text,
  table_count integer NOT NULL DEFAULT 10,
  payment_modes jsonb NOT NULL DEFAULT '{"upi": true, "card": true, "cash": true}'::jsonb,
  login_type text NOT NULL DEFAULT 'google'::text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tenants Table
CREATE TABLE IF NOT EXISTS public.tenants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_name text NOT NULL,
  restaurant_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  is_active boolean DEFAULT true,
  plan text NOT NULL DEFAULT 'standard'::text,
  plan_start_date timestamp with time zone DEFAULT now(),
  plan_end_date timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tenant Settings Table
CREATE TABLE IF NOT EXISTS public.tenant_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  merchant_upi_id text NOT NULL DEFAULT 'merchant@upi'::text,
  service_charge numeric NOT NULL DEFAULT 0,
  restaurant_name text NOT NULL,
  restaurant_address text DEFAULT ''::text,
  table_count integer NOT NULL DEFAULT 10,
  menu_sheet_url text,
  payment_modes jsonb NOT NULL DEFAULT '{"upi": true, "card": true, "cash": true}'::jsonb,
  theme_config jsonb DEFAULT '{}'::jsonb,
  require_customer_auth boolean NOT NULL DEFAULT true,
  razorpay_enabled boolean DEFAULT false,
  razorpay_key_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Razorpay Tenant Secrets Table
CREATE TABLE IF NOT EXISTS public.razorpay_tenant_secrets (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  key_secret text NOT NULL,
  webhook_secret text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(tenant_id)
);

-- Platform Razorpay Config Table
CREATE TABLE IF NOT EXISTS public.platform_razorpay_config (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  razorpay_key_id text NOT NULL,
  razorpay_key_secret text NOT NULL,
  setup_fee numeric NOT NULL DEFAULT 1200,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Restaurant Tables Table
CREATE TABLE IF NOT EXISTS public.restaurant_tables (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  table_number integer NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now()
);

-- Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid NOT NULL PRIMARY KEY,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  needs_password_setup boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- User Roles Table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE CASCADE,
  email text,
  name text,
  created_at timestamp with time zone DEFAULT now()
);

-- Subscription Payments Table
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  plan text NOT NULL,
  amount numeric NOT NULL,
  setup_fee numeric DEFAULT 0,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  status text NOT NULL DEFAULT 'pending'::text,
  payment_type text NOT NULL DEFAULT 'new'::text,
  business_name text,
  restaurant_name text,
  contact_phone text,
  contact_email text,
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone
);

-- Orders Table
CREATE TABLE IF NOT EXISTS public.orders (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id text NOT NULL UNIQUE,
  tenant_id uuid REFERENCES public.tenants(id) ON DELETE SET NULL,
  user_id uuid,
  table_id text NOT NULL,
  items_json text NOT NULL,
  subtotal numeric DEFAULT 0,
  service_charge numeric DEFAULT 0,
  service_charge_amount numeric DEFAULT 0,
  total numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending'::text,
  payment_status text NOT NULL DEFAULT 'unpaid'::text,
  payment_mode text DEFAULT 'upi'::text,
  payment_claimed boolean DEFAULT false,
  qr_url text,
  bill_url text,
  bill_downloaded boolean DEFAULT false,
  notes text,
  cook_name text,
  customer_name text,
  customer_email text,
  customer_phone text,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  last_updated_by text,
  last_updated_at timestamp with time zone DEFAULT now(),
  accepted_at timestamp with time zone,
  completed_at timestamp with time zone,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- ============================================
-- VIEWS
-- ============================================

-- Public Settings View (for legacy compatibility)
CREATE OR REPLACE VIEW public.public_settings AS
SELECT 
  service_charge,
  payment_modes,
  table_count,
  restaurant_address,
  menu_sheet_url,
  restaurant_name
FROM public.settings;

-- Public Tenant Info View
CREATE OR REPLACE VIEW public.public_tenant_info AS
SELECT 
  id,
  tenant_name,
  restaurant_name,
  is_active,
  plan,
  plan_start_date,
  plan_end_date,
  created_at
FROM public.tenants;

-- Public Tenant Settings View
CREATE OR REPLACE VIEW public.public_tenant_settings AS
SELECT 
  tenant_id,
  merchant_upi_id,
  service_charge,
  restaurant_name,
  restaurant_address,
  menu_sheet_url,
  payment_modes,
  theme_config,
  require_customer_auth,
  razorpay_enabled,
  razorpay_key_id
FROM public.tenant_settings;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: has_role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function: get_user_tenant_id (no args)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tenant_id
  FROM public.user_roles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Function: get_user_tenant_id (with user_id arg)
CREATE OR REPLACE FUNCTION public.get_user_tenant_id(_user_id uuid)
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tenant_id
  FROM public.user_roles
  WHERE user_id = _user_id 
    AND role = 'tenant_admin'
  LIMIT 1
$$;

-- Function: get_user_tenant_id_bypass
CREATE OR REPLACE FUNCTION public.get_user_tenant_id_bypass()
RETURNS uuid
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT tenant_id 
  FROM user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Function: get_user_role_bypass
CREATE OR REPLACE FUNCTION public.get_user_role_bypass()
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT role 
  FROM user_roles 
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

-- Function: generate_order_id (no args - legacy)
CREATE OR REPLACE FUNCTION public.generate_order_id()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  today_date date;
  reversed_date text;
  order_count int;
  new_order_id text;
BEGIN
  today_date := CURRENT_DATE;
  reversed_date := to_char(today_date, 'YYYYMMDD');
  reversed_date := reverse(reversed_date);
  
  SELECT COUNT(*) + 1 INTO order_count
  FROM public.orders
  WHERE DATE(created_at) = today_date;
  
  new_order_id := 'ORD' || reversed_date || LPAD(order_count::text, 2, '0');
  
  RETURN new_order_id;
END;
$$;

-- Function: generate_order_id (with tenant_id)
CREATE OR REPLACE FUNCTION public.generate_order_id(p_tenant_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  today_date DATE;
  reversed_date TEXT;
  order_count INT;
  new_order_id TEXT;
  lock_key BIGINT;
  max_retries INT := 10;
  retry_count INT := 0;
BEGIN
  today_date := CURRENT_DATE;
  reversed_date := reverse(to_char(today_date, 'YYYYMMDD'));
  
  lock_key := ('x' || substr(md5(p_tenant_id::text || today_date::text), 1, 15))::bit(60)::bigint;
  
  PERFORM pg_advisory_xact_lock(lock_key);
  
  SELECT COALESCE(MAX(
    CASE 
      WHEN order_id ~ ('^ORD' || reversed_date || '[0-9]{2,}$')
      THEN RIGHT(order_id, 2)::INT 
      ELSE 0 
    END
  ), 0) + 1 INTO order_count
  FROM public.orders
  WHERE DATE(created_at) = today_date
    AND tenant_id = p_tenant_id
    AND order_id LIKE 'ORD' || reversed_date || '%';
  
  new_order_id := 'ORD' || reversed_date || LPAD(order_count::text, 2, '0');
  
  WHILE EXISTS (SELECT 1 FROM public.orders WHERE order_id = new_order_id) LOOP
    retry_count := retry_count + 1;
    IF retry_count > max_retries THEN
      RAISE EXCEPTION 'Failed to generate unique order ID after % attempts', max_retries;
    END IF;
    order_count := order_count + 1;
    new_order_id := 'ORD' || reversed_date || LPAD(order_count::text, 2, '0');
  END LOOP;
  
  RETURN new_order_id;
END;
$$;

-- Function: get_orders_by_table (legacy)
CREATE OR REPLACE FUNCTION public.get_orders_by_table(p_table_id text)
RETURNS TABLE(
  id uuid, order_id text, table_id text, items_json text, subtotal numeric,
  service_charge numeric, service_charge_amount numeric, total numeric,
  status text, payment_status text, payment_claimed boolean, qr_url text,
  bill_downloaded boolean, created_at timestamp with time zone,
  paid_at timestamp with time zone, last_updated_by text,
  last_updated_at timestamp with time zone, notes text,
  customer_name text, customer_email text, customer_phone text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    id, order_id, table_id, items_json, subtotal, service_charge,
    service_charge_amount, total, status, payment_status, payment_claimed, 
    qr_url, bill_downloaded, created_at, paid_at, last_updated_by, 
    last_updated_at, notes, customer_name, customer_email, customer_phone
  FROM public.orders 
  WHERE orders.table_id = p_table_id
  AND (
    (status != 'completed' AND status != 'rejected') 
    OR last_updated_at > now() - interval '10 minutes'
  )
  ORDER BY created_at DESC;
$$;

-- Function: get_orders_by_table (with tenant_id)
CREATE OR REPLACE FUNCTION public.get_orders_by_table(p_table_id text, p_tenant_id uuid)
RETURNS TABLE(
  id uuid, order_id text, table_id text, items_json text, subtotal numeric,
  service_charge numeric, service_charge_amount numeric, total numeric,
  status text, payment_status text, payment_claimed boolean, qr_url text,
  bill_downloaded boolean, created_at timestamp with time zone,
  paid_at timestamp with time zone, last_updated_by text,
  last_updated_at timestamp with time zone, notes text,
  customer_name text, customer_email text, customer_phone text
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    id, order_id, table_id, items_json, subtotal, service_charge,
    service_charge_amount, total, status, payment_status, payment_claimed, 
    qr_url, bill_downloaded, created_at, paid_at, last_updated_by, 
    last_updated_at, notes, customer_name, customer_email, customer_phone
  FROM public.orders 
  WHERE orders.table_id = p_table_id
    AND orders.tenant_id = p_tenant_id
    AND (
      (status != 'completed' AND status != 'rejected') 
      OR last_updated_at > now() - interval '10 minutes'
    )
  ORDER BY created_at DESC;
$$;

-- Function: create_new_tenant
CREATE OR REPLACE FUNCTION public.create_new_tenant(
  p_tenant_name text,
  p_restaurant_name text,
  p_contact_email text,
  p_contact_phone text,
  p_table_count integer,
  p_menu_sheet_url text,
  p_merchant_upi_id text,
  p_service_charge numeric
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  new_tenant_id UUID;
BEGIN
  INSERT INTO public.tenants (tenant_name, restaurant_name, contact_email, contact_phone, is_active)
  VALUES (p_tenant_name, p_restaurant_name, p_contact_email, p_contact_phone, true)
  RETURNING id INTO new_tenant_id;
  
  INSERT INTO public.tenant_settings (
    tenant_id, merchant_upi_id, service_charge, restaurant_name,
    restaurant_address, table_count, menu_sheet_url
  )
  VALUES (
    new_tenant_id, p_merchant_upi_id, p_service_charge, p_restaurant_name,
    '', p_table_count, p_menu_sheet_url
  );
  
  RETURN new_tenant_id;
END;
$$;

-- Function: handle_new_user (trigger function)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Guest'),
    COALESCE(NEW.email, '')
  );
  RETURN NEW;
END;
$$;

-- Function: update_settings_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_settings_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: update_profiles_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_profiles_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: update_orders_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_orders_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.last_updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: update_platform_razorpay_updated_at (trigger function)
CREATE OR REPLACE FUNCTION public.update_platform_razorpay_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Function: auto_generate_tables (trigger function)
CREATE OR REPLACE FUNCTION public.auto_generate_tables()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  i INTEGER;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.table_count = NEW.table_count THEN
    RETURN NEW;
  END IF;

  DELETE FROM public.restaurant_tables WHERE tenant_id = NEW.tenant_id;

  FOR i IN 1..NEW.table_count LOOP
    INSERT INTO public.restaurant_tables (tenant_id, table_number, is_active)
    VALUES (NEW.tenant_id, i, true);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Function: prevent_order_price_modification (trigger function)
CREATE OR REPLACE FUNCTION public.prevent_order_price_modification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  is_admin BOOLEAN;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin' AND tenant_id IS NULL
  ) INTO is_admin;
  
  IF is_admin THEN
    RETURN NEW;
  END IF;
  
  IF OLD.tenant_id IS DISTINCT FROM NEW.tenant_id THEN
    RAISE EXCEPTION 'Cannot change tenant_id';
  END IF;
  
  IF OLD.subtotal IS DISTINCT FROM NEW.subtotal THEN
    RAISE EXCEPTION 'Cannot modify subtotal';
  END IF;
  
  IF OLD.service_charge IS DISTINCT FROM NEW.service_charge THEN
    RAISE EXCEPTION 'Cannot modify service_charge';
  END IF;
  
  IF OLD.service_charge_amount IS DISTINCT FROM NEW.service_charge_amount THEN
    RAISE EXCEPTION 'Cannot modify service_charge_amount';
  END IF;
  
  IF OLD.total IS DISTINCT FROM NEW.total THEN
    RAISE EXCEPTION 'Cannot modify total amount';
  END IF;
  
  IF OLD.order_id IS DISTINCT FROM NEW.order_id THEN
    RAISE EXCEPTION 'Cannot modify order_id';
  END IF;
  
  IF OLD.table_id IS DISTINCT FROM NEW.table_id THEN
    RAISE EXCEPTION 'Cannot modify table_id';
  END IF;
  
  IF OLD.items_json IS DISTINCT FROM NEW.items_json THEN
    RAISE EXCEPTION 'Cannot modify items_json';
  END IF;
  
  RETURN NEW;
END;
$$;

-- ============================================
-- TRIGGERS
-- ============================================

-- Trigger: on auth.users insert -> create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger: update settings updated_at
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_settings_updated_at();

-- Trigger: update profiles updated_at
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_profiles_updated_at();

-- Trigger: update orders last_updated_at
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
CREATE TRIGGER update_orders_updated_at
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.update_orders_updated_at();

-- Trigger: update platform_razorpay_config updated_at
DROP TRIGGER IF EXISTS update_platform_razorpay_updated_at ON public.platform_razorpay_config;
CREATE TRIGGER update_platform_razorpay_updated_at
  BEFORE UPDATE ON public.platform_razorpay_config
  FOR EACH ROW EXECUTE FUNCTION public.update_platform_razorpay_updated_at();

-- Trigger: auto generate tables on tenant_settings insert/update
DROP TRIGGER IF EXISTS auto_generate_tables_trigger ON public.tenant_settings;
CREATE TRIGGER auto_generate_tables_trigger
  AFTER INSERT OR UPDATE ON public.tenant_settings
  FOR EACH ROW EXECUTE FUNCTION public.auto_generate_tables();

-- Trigger: prevent order price modification
DROP TRIGGER IF EXISTS prevent_order_price_modification_trigger ON public.orders;
CREATE TRIGGER prevent_order_price_modification_trigger
  BEFORE UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION public.prevent_order_price_modification();

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE public.global_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.razorpay_tenant_secrets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.platform_razorpay_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Global Settings Policies
DROP POLICY IF EXISTS "Public can view global settings" ON public.global_settings;
CREATE POLICY "Public can view global settings" ON public.global_settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Universal admin can manage global settings" ON public.global_settings;
CREATE POLICY "Universal admin can manage global settings" ON public.global_settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

-- Settings Policies
DROP POLICY IF EXISTS "Public can view non-sensitive settings" ON public.settings;
CREATE POLICY "Public can view non-sensitive settings" ON public.settings
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only staff can view full settings" ON public.settings;
CREATE POLICY "Only staff can view full settings" ON public.settings
  FOR SELECT USING (
    has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'manager') OR 
    has_role(auth.uid(), 'chef') OR has_role(auth.uid(), 'waiter')
  );

DROP POLICY IF EXISTS "Only admins can update settings" ON public.settings;
CREATE POLICY "Only admins can update settings" ON public.settings
  FOR UPDATE USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Tenants Policies
DROP POLICY IF EXISTS "Public can view active tenants" ON public.tenants;
CREATE POLICY "Public can view active tenants" ON public.tenants
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Tenant admin can view own tenant" ON public.tenants;
CREATE POLICY "Tenant admin can view own tenant" ON public.tenants
  FOR SELECT USING (id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'tenant_admin'
  ));

DROP POLICY IF EXISTS "Tenant staff can view own tenant" ON public.tenants;
CREATE POLICY "Tenant staff can view own tenant" ON public.tenants
  FOR SELECT USING (id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.tenant_id IS NOT NULL
  ));

DROP POLICY IF EXISTS "Universal admin can view all tenants" ON public.tenants;
CREATE POLICY "Universal admin can view all tenants" ON public.tenants
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

DROP POLICY IF EXISTS "Universal admin can insert tenants" ON public.tenants;
CREATE POLICY "Universal admin can insert tenants" ON public.tenants
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

DROP POLICY IF EXISTS "Universal admin can manage all tenant data" ON public.tenants;
CREATE POLICY "Universal admin can manage all tenant data" ON public.tenants
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

DROP POLICY IF EXISTS "Universal admin can manage tenants" ON public.tenants;
CREATE POLICY "Universal admin can manage tenants" ON public.tenants
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

-- Tenant Settings Policies
DROP POLICY IF EXISTS "Public can view active tenant settings" ON public.tenant_settings;
CREATE POLICY "Public can view active tenant settings" ON public.tenant_settings
  FOR SELECT USING (tenant_id IN (SELECT id FROM tenants WHERE is_active = true));

DROP POLICY IF EXISTS "Tenant staff can view settings" ON public.tenant_settings;
CREATE POLICY "Tenant staff can view settings" ON public.tenant_settings
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.tenant_id IS NOT NULL
    AND user_roles.role IN ('tenant_admin', 'manager', 'chef', 'cook', 'waiter')
  ));

DROP POLICY IF EXISTS "Tenant admin can manage own settings" ON public.tenant_settings;
CREATE POLICY "Tenant admin can manage own settings" ON public.tenant_settings
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'tenant_admin'
  ));

DROP POLICY IF EXISTS "Manager and above can update settings" ON public.tenant_settings;
CREATE POLICY "Manager and above can update settings" ON public.tenant_settings
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.tenant_id IS NOT NULL
    AND user_roles.role IN ('tenant_admin', 'manager')
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.tenant_id IS NOT NULL
    AND user_roles.role IN ('tenant_admin', 'manager')
  ));

DROP POLICY IF EXISTS "Universal admin can manage all settings" ON public.tenant_settings;
CREATE POLICY "Universal admin can manage all settings" ON public.tenant_settings
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

DROP POLICY IF EXISTS "Universal admin can view all settings" ON public.tenant_settings;
CREATE POLICY "Universal admin can view all settings" ON public.tenant_settings
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

-- Razorpay Tenant Secrets Policies
DROP POLICY IF EXISTS "Admins can view tenant secrets" ON public.razorpay_tenant_secrets;
CREATE POLICY "Admins can view tenant secrets" ON public.razorpay_tenant_secrets
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND (user_roles.tenant_id IS NULL OR (user_roles.tenant_id = razorpay_tenant_secrets.tenant_id AND user_roles.role = 'tenant_admin'))
  ));

DROP POLICY IF EXISTS "Admins can insert tenant secrets" ON public.razorpay_tenant_secrets;
CREATE POLICY "Admins can insert tenant secrets" ON public.razorpay_tenant_secrets
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND (user_roles.tenant_id IS NULL OR (user_roles.tenant_id = razorpay_tenant_secrets.tenant_id AND user_roles.role = 'tenant_admin'))
  ));

DROP POLICY IF EXISTS "Admins can update tenant secrets" ON public.razorpay_tenant_secrets;
CREATE POLICY "Admins can update tenant secrets" ON public.razorpay_tenant_secrets
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid()
    AND (user_roles.tenant_id IS NULL OR (user_roles.tenant_id = razorpay_tenant_secrets.tenant_id AND user_roles.role = 'tenant_admin'))
  ));

DROP POLICY IF EXISTS "Tenant admin can view own razorpay settings" ON public.razorpay_tenant_secrets;
CREATE POLICY "Tenant admin can view own razorpay settings" ON public.razorpay_tenant_secrets
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'tenant_admin'
  ));

DROP POLICY IF EXISTS "Universal admin can manage razorpay secrets" ON public.razorpay_tenant_secrets;
CREATE POLICY "Universal admin can manage razorpay secrets" ON public.razorpay_tenant_secrets
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

-- Platform Razorpay Config Policies
DROP POLICY IF EXISTS "Universal admin can manage platform razorpay config" ON public.platform_razorpay_config;
CREATE POLICY "Universal admin can manage platform razorpay config" ON public.platform_razorpay_config
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

-- Restaurant Tables Policies
DROP POLICY IF EXISTS "Public can view active tables" ON public.restaurant_tables;
CREATE POLICY "Public can view active tables" ON public.restaurant_tables
  FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "Tenant staff can view tables" ON public.restaurant_tables;
CREATE POLICY "Tenant staff can view tables" ON public.restaurant_tables
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.tenant_id IS NOT NULL
    AND user_roles.role IN ('tenant_admin', 'manager', 'chef', 'cook', 'waiter')
  ));

DROP POLICY IF EXISTS "Tenant admin can manage tables" ON public.restaurant_tables;
CREATE POLICY "Tenant admin can manage tables" ON public.restaurant_tables
  FOR ALL USING (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'tenant_admin'
  ));

DROP POLICY IF EXISTS "Universal admin can manage all tables" ON public.restaurant_tables;
CREATE POLICY "Universal admin can manage all tables" ON public.restaurant_tables
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Tenant staff can view tenant profiles" ON public.profiles;
CREATE POLICY "Tenant staff can view tenant profiles" ON public.profiles
  FOR SELECT USING (
    (tenant_id IN (
      SELECT tenant_id FROM user_roles
      WHERE user_roles.user_id = auth.uid() AND user_roles.tenant_id IS NOT NULL
      AND user_roles.role IN ('tenant_admin', 'manager', 'chef', 'cook', 'waiter')
    )) OR (auth.uid() = id)
  );

DROP POLICY IF EXISTS "Universal admin can view all profiles" ON public.profiles;
CREATE POLICY "Universal admin can view all profiles" ON public.profiles
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

-- User Roles Policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Tenant admin and manager can view tenant roles" ON public.user_roles;
CREATE POLICY "Tenant admin and manager can view tenant roles" ON public.user_roles
  FOR SELECT USING (
    (tenant_id = get_user_tenant_id_bypass()) AND 
    (get_user_tenant_id_bypass() IS NOT NULL) AND 
    (get_user_role_bypass() IN ('tenant_admin', 'manager'))
  );

DROP POLICY IF EXISTS "Tenant admin can manage tenant roles" ON public.user_roles;
CREATE POLICY "Tenant admin can manage tenant roles" ON public.user_roles
  FOR ALL USING (
    (tenant_id = get_user_tenant_id_bypass()) AND 
    (get_user_tenant_id_bypass() IS NOT NULL) AND 
    (get_user_role_bypass() = 'tenant_admin')
  )
  WITH CHECK (
    (tenant_id = get_user_tenant_id_bypass()) AND 
    (get_user_tenant_id_bypass() IS NOT NULL) AND 
    (get_user_role_bypass() = 'tenant_admin')
  );

DROP POLICY IF EXISTS "Universal admin can manage all roles" ON public.user_roles;
CREATE POLICY "Universal admin can manage all roles" ON public.user_roles
  FOR ALL USING (has_role(auth.uid(), 'admin'))
  WITH CHECK (has_role(auth.uid(), 'admin'));

-- Subscription Payments Policies
DROP POLICY IF EXISTS "Users can view own subscription payments" ON public.subscription_payments;
CREATE POLICY "Users can view own subscription payments" ON public.subscription_payments
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own subscription payments" ON public.subscription_payments;
CREATE POLICY "Users can insert own subscription payments" ON public.subscription_payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "Universal admin can view all subscription payments" ON public.subscription_payments;
CREATE POLICY "Universal admin can view all subscription payments" ON public.subscription_payments
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

DROP POLICY IF EXISTS "Universal admin can manage subscription payments" ON public.subscription_payments;
CREATE POLICY "Universal admin can manage subscription payments" ON public.subscription_payments
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

-- Orders Policies
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
CREATE POLICY "Customers can view own orders" ON public.orders
  FOR SELECT USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anonymous users cannot view orders" ON public.orders;
CREATE POLICY "Anonymous users cannot view orders" ON public.orders
  FOR SELECT USING ((user_id IS NOT NULL) AND (user_id = auth.uid()));

DROP POLICY IF EXISTS "Customers can create orders with valid tenant" ON public.orders;
CREATE POLICY "Customers can create orders with valid tenant" ON public.orders
  FOR INSERT WITH CHECK (
    ((user_id = auth.uid()) AND (user_id IS NOT NULL)) OR
    ((user_id IS NULL) AND (tenant_id IS NOT NULL) AND (table_id IS NOT NULL) AND
     EXISTS (SELECT 1 FROM tenants WHERE tenants.id = orders.tenant_id AND tenants.is_active = true) AND
     EXISTS (SELECT 1 FROM restaurant_tables WHERE restaurant_tables.tenant_id = orders.tenant_id 
             AND (restaurant_tables.table_number)::text = orders.table_id AND restaurant_tables.is_active = true))
  );

DROP POLICY IF EXISTS "Tenant staff can view tenant orders" ON public.orders;
CREATE POLICY "Tenant staff can view tenant orders" ON public.orders
  FOR SELECT USING (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.tenant_id IS NOT NULL
    AND user_roles.role IN ('tenant_admin', 'manager', 'chef', 'cook', 'waiter')
  ));

DROP POLICY IF EXISTS "Tenant staff can update orders" ON public.orders;
CREATE POLICY "Tenant staff can update orders" ON public.orders
  FOR UPDATE USING (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.tenant_id IS NOT NULL
    AND user_roles.role IN ('tenant_admin', 'manager', 'chef', 'cook', 'waiter')
  ))
  WITH CHECK (tenant_id IN (
    SELECT tenant_id FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.tenant_id IS NOT NULL
    AND user_roles.role IN ('tenant_admin', 'manager', 'chef', 'cook', 'waiter')
  ));

DROP POLICY IF EXISTS "Universal admin can view all orders" ON public.orders;
CREATE POLICY "Universal admin can view all orders" ON public.orders
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

DROP POLICY IF EXISTS "Universal admin full access to orders" ON public.orders;
CREATE POLICY "Universal admin full access to orders" ON public.orders
  FOR ALL USING (EXISTS (
    SELECT 1 FROM user_roles
    WHERE user_roles.user_id = auth.uid() AND user_roles.role = 'admin' AND user_roles.tenant_id IS NULL
  ));

-- ============================================
-- ENABLE REALTIME (optional - uncomment if needed)
-- ============================================
-- ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;

-- ============================================
-- INSERT DEFAULT DATA (optional)
-- ============================================

-- Insert default global settings if not exists
INSERT INTO public.global_settings (login_type)
SELECT 'google'
WHERE NOT EXISTS (SELECT 1 FROM public.global_settings);

-- Insert default settings if not exists (legacy)
INSERT INTO public.settings (restaurant_name, merchant_upi_id)
SELECT 'Scan The Table', 'merchant@upi'
WHERE NOT EXISTS (SELECT 1 FROM public.settings);
