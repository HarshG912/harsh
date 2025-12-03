import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { tenant_id, amount, cart_items, table_id, customer_info } = await req.json();

    console.log('Creating Razorpay order:', { tenant_id, amount, table_id });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch tenant's Razorpay credentials
    const { data: tenantSettings, error: settingsError } = await supabase
      .from('tenant_settings')
      .select('razorpay_key_id, razorpay_enabled')
      .eq('tenant_id', tenant_id)
      .single();

    if (settingsError || !tenantSettings) {
      console.error('Error fetching tenant settings:', settingsError);
      throw new Error('Failed to fetch tenant settings');
    }

    if (!tenantSettings.razorpay_enabled) {
      throw new Error('Razorpay is not enabled for this tenant');
    }

    // Fetch Razorpay secret key
    const { data: secretData, error: secretError } = await supabase
      .from('razorpay_tenant_secrets')
      .select('key_secret')
      .eq('tenant_id', tenant_id)
      .single();

    if (secretError || !secretData) {
      console.error('Error fetching Razorpay secret:', secretError);
      throw new Error('Razorpay credentials not configured');
    }

    // Recalculate amount from cart items to prevent manipulation
    const calculatedSubtotal = cart_items.reduce((sum: number, item: any) => {
      return sum + (item.Price * item.quantity);
    }, 0);

    const { data: settingsData } = await supabase
      .from('tenant_settings')
      .select('service_charge')
      .eq('tenant_id', tenant_id)
      .single();

    const serviceChargeRate = settingsData?.service_charge || 0;
    const serviceChargeAmount = calculatedSubtotal * serviceChargeRate / 100;
    const calculatedTotal = calculatedSubtotal + serviceChargeAmount;

    // Verify amount matches (with small tolerance for floating point)
    if (Math.abs(calculatedTotal - amount) > 0.01) {
      throw new Error('Amount mismatch detected');
    }

    // Create Razorpay order
    const razorpayAuth = btoa(`${tenantSettings.razorpay_key_id}:${secretData.key_secret}`);
    
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${razorpayAuth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Convert to paise
        currency: 'INR',
        receipt: `table_${table_id}_${Date.now()}`,
        notes: {
          tenant_id,
          table_id,
          customer_name: customer_info?.name || 'Guest',
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay API error:', errorText);
      throw new Error('Failed to create Razorpay order');
    }

    const razorpayOrder = await razorpayResponse.json();

    console.log('Razorpay order created:', razorpayOrder.id);

    return new Response(
      JSON.stringify({
        razorpay_order_id: razorpayOrder.id,
        razorpay_key_id: tenantSettings.razorpay_key_id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in create-razorpay-order:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});