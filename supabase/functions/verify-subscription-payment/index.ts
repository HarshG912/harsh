import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { crypto } from "https://deno.land/std@0.168.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      plan_id,
      user_id,
      user_email,
      business_name,
      restaurant_name,
      contact_phone
    } = await req.json();

    console.log('Verifying subscription payment:', { razorpay_order_id, plan_id, user_id });

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return new Response(JSON.stringify({ error: 'Missing payment details' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get platform Razorpay config for signature verification
    const { data: config, error: configError } = await supabase
      .from('platform_razorpay_config')
      .select('razorpay_key_secret')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      console.error('Platform config not found:', configError);
      return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify Razorpay signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const key = new TextEncoder().encode(config.razorpay_key_secret);
    const message = new TextEncoder().encode(body);
    
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      key,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    
    const signatureBuffer = await crypto.subtle.sign("HMAC", cryptoKey, message);
    const expectedSignature = Array.from(new Uint8Array(signatureBuffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (expectedSignature !== razorpay_signature) {
      console.error('Signature verification failed');
      return new Response(JSON.stringify({ error: 'Payment verification failed - invalid signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Signature verified successfully');

    // Calculate plan dates
    const planStartDate = new Date();
    const planEndDate = new Date();
    planEndDate.setDate(planEndDate.getDate() + 30);

    // Create tenant
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .insert({
        tenant_name: business_name || restaurant_name,
        restaurant_name: restaurant_name,
        contact_email: user_email,
        contact_phone: contact_phone,
        plan: plan_id,
        plan_start_date: planStartDate.toISOString(),
        plan_end_date: planEndDate.toISOString(),
        is_active: true,
      })
      .select()
      .single();

    if (tenantError) {
      console.error('Error creating tenant:', tenantError);
      return new Response(JSON.stringify({ error: 'Failed to create tenant' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Tenant created:', tenant.id);

    // Create tenant settings with defaults
    const { error: settingsError } = await supabase
      .from('tenant_settings')
      .insert({
        tenant_id: tenant.id,
        restaurant_name: restaurant_name,
        merchant_upi_id: 'merchant@upi',
        service_charge: 0,
        table_count: plan_id === 'standard' ? 5 : plan_id === 'pro' ? 10 : 25,
      });

    if (settingsError) {
      console.error('Error creating tenant settings:', settingsError);
    }

    // Create user role as tenant_admin
    const { error: roleError } = await supabase
      .from('user_roles')
      .insert({
        user_id: user_id,
        tenant_id: tenant.id,
        role: 'tenant_admin',
        email: user_email,
        name: business_name,
      });

    if (roleError) {
      console.error('Error creating user role:', roleError);
      return new Response(JSON.stringify({ error: 'Failed to assign admin role' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('User role created');

    // Update profile with needs_password_setup flag
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        needs_password_setup: true,
        tenant_id: tenant.id 
      })
      .eq('id', user_id);

    if (profileError) {
      console.error('Error updating profile:', profileError);
    }

    // Update subscription payment record
    const { error: paymentUpdateError } = await supabase
      .from('subscription_payments')
      .update({
        tenant_id: tenant.id,
        razorpay_payment_id: razorpay_payment_id,
        razorpay_signature: razorpay_signature,
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('razorpay_order_id', razorpay_order_id);

    if (paymentUpdateError) {
      console.error('Error updating payment record:', paymentUpdateError);
    }

    return new Response(JSON.stringify({
      success: true,
      tenant_id: tenant.id,
      message: 'Subscription activated successfully',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in verify-subscription-payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
