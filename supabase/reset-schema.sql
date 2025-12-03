-- ============================================
-- RESET SCHEMA FOR SCAN THE TABLE
-- Run this BEFORE schema.sql to clean up existing objects
-- WARNING: This will DELETE ALL DATA!
-- ============================================

-- ============================================
-- DROP ALL POLICIES
-- ============================================

-- Orders Policies
DROP POLICY IF EXISTS "Customers can view own orders" ON public.orders;
DROP POLICY IF EXISTS "Anonymous users cannot view orders" ON public.orders;
DROP POLICY IF EXISTS "Customers can create orders with valid tenant" ON public.orders;
DROP POLICY IF EXISTS "Tenant staff can view tenant orders" ON public.orders;
DROP POLICY IF EXISTS "Tenant staff can update orders" ON public.orders;
DROP POLICY IF EXISTS "Universal admin can view all orders" ON public.orders;
DROP POLICY IF EXISTS "Universal admin full access to orders" ON public.orders;

-- Subscription Payments Policies
DROP POLICY IF EXISTS "Users can view own subscription payments" ON public.subscription_payments;
DROP POLICY IF EXISTS "Users can insert own subscription payments" ON public.subscription_payments;
DROP POLICY IF EXISTS "Universal admin can view all subscription payments" ON public.subscription_payments;
DROP POLICY IF EXISTS "Universal admin can manage subscription payments" ON public.subscription_payments;

-- User Roles Policies
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Tenant admin and manager can view tenant roles" ON public.user_roles;
DROP POLICY IF EXISTS "Tenant admin can manage tenant roles" ON public.user_roles;
DROP POLICY IF EXISTS "Universal admin can manage all roles" ON public.user_roles;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Tenant staff can view tenant profiles" ON public.profiles;
DROP POLICY IF EXISTS "Universal admin can view all profiles" ON public.profiles;

-- Restaurant Tables Policies
DROP POLICY IF EXISTS "Public can view active tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Tenant staff can view tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Tenant admin can manage tables" ON public.restaurant_tables;
DROP POLICY IF EXISTS "Universal admin can manage all tables" ON public.restaurant_tables;

-- Platform Razorpay Config Policies
DROP POLICY IF EXISTS "Universal admin can manage platform razorpay config" ON public.platform_razorpay_config;

-- Razorpay Tenant Secrets Policies
DROP POLICY IF EXISTS "Admins can view tenant secrets" ON public.razorpay_tenant_secrets;
DROP POLICY IF EXISTS "Admins can insert tenant secrets" ON public.razorpay_tenant_secrets;
DROP POLICY IF EXISTS "Admins can update tenant secrets" ON public.razorpay_tenant_secrets;
DROP POLICY IF EXISTS "Tenant admin can view own razorpay settings" ON public.razorpay_tenant_secrets;
DROP POLICY IF EXISTS "Universal admin can manage razorpay secrets" ON public.razorpay_tenant_secrets;

-- Tenant Settings Policies
DROP POLICY IF EXISTS "Public can view active tenant settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "Tenant staff can view settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "Tenant admin can manage own settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "Manager and above can update settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "Universal admin can manage all settings" ON public.tenant_settings;
DROP POLICY IF EXISTS "Universal admin can view all settings" ON public.tenant_settings;

-- Tenants Policies
DROP POLICY IF EXISTS "Public can view active tenants" ON public.tenants;
DROP POLICY IF EXISTS "Tenant admin can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Tenant staff can view own tenant" ON public.tenants;
DROP POLICY IF EXISTS "Universal admin can view all tenants" ON public.tenants;
DROP POLICY IF EXISTS "Universal admin can insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Universal admin can manage all tenant data" ON public.tenants;
DROP POLICY IF EXISTS "Universal admin can manage tenants" ON public.tenants;

-- Settings Policies
DROP POLICY IF EXISTS "Public can view non-sensitive settings" ON public.settings;
DROP POLICY IF EXISTS "Only staff can view full settings" ON public.settings;
DROP POLICY IF EXISTS "Only admins can update settings" ON public.settings;

-- Global Settings Policies
DROP POLICY IF EXISTS "Public can view global settings" ON public.global_settings;
DROP POLICY IF EXISTS "Universal admin can manage global settings" ON public.global_settings;

-- ============================================
-- DROP ALL TRIGGERS
-- ============================================

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS update_settings_updated_at ON public.settings;
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
DROP TRIGGER IF EXISTS update_orders_updated_at ON public.orders;
DROP TRIGGER IF EXISTS update_platform_razorpay_updated_at ON public.platform_razorpay_config;
DROP TRIGGER IF EXISTS auto_generate_tables_trigger ON public.tenant_settings;
DROP TRIGGER IF EXISTS prevent_order_price_modification_trigger ON public.orders;

-- ============================================
-- DROP ALL FUNCTIONS
-- ============================================

DROP FUNCTION IF EXISTS public.has_role(uuid, app_role);
DROP FUNCTION IF EXISTS public.get_user_tenant_id();
DROP FUNCTION IF EXISTS public.get_user_tenant_id(uuid);
DROP FUNCTION IF EXISTS public.get_user_tenant_id_bypass();
DROP FUNCTION IF EXISTS public.get_user_role_bypass();
DROP FUNCTION IF EXISTS public.generate_order_id();
DROP FUNCTION IF EXISTS public.generate_order_id(uuid);
DROP FUNCTION IF EXISTS public.get_orders_by_table(text);
DROP FUNCTION IF EXISTS public.get_orders_by_table(text, uuid);
DROP FUNCTION IF EXISTS public.create_new_tenant(text, text, text, text, integer, text, text, numeric);
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.update_settings_updated_at();
DROP FUNCTION IF EXISTS public.update_profiles_updated_at();
DROP FUNCTION IF EXISTS public.update_orders_updated_at();
DROP FUNCTION IF EXISTS public.update_platform_razorpay_updated_at();
DROP FUNCTION IF EXISTS public.auto_generate_tables();
DROP FUNCTION IF EXISTS public.prevent_order_price_modification();

-- ============================================
-- DROP ALL VIEWS
-- ============================================

DROP VIEW IF EXISTS public.public_settings;
DROP VIEW IF EXISTS public.public_tenant_info;
DROP VIEW IF EXISTS public.public_tenant_settings;

-- ============================================
-- DROP ALL TABLES (in correct order for foreign keys)
-- ============================================

DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.subscription_payments CASCADE;
DROP TABLE IF EXISTS public.user_roles CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.restaurant_tables CASCADE;
DROP TABLE IF EXISTS public.platform_razorpay_config CASCADE;
DROP TABLE IF EXISTS public.razorpay_tenant_secrets CASCADE;
DROP TABLE IF EXISTS public.tenant_settings CASCADE;
DROP TABLE IF EXISTS public.tenants CASCADE;
DROP TABLE IF EXISTS public.settings CASCADE;
DROP TABLE IF EXISTS public.global_settings CASCADE;

-- ============================================
-- DROP ENUM
-- ============================================

DROP TYPE IF EXISTS public.app_role CASCADE;

-- ============================================
-- DONE - Now run schema.sql
-- ============================================
