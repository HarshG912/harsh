import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { plan_id, user_id, user_email, business_name, restaurant_name, contact_phone } = await req.json();
    
    console.log('Creating subscription order:', { plan_id, user_id, user_email, business_name });

    if (!plan_id || !user_id || !user_email) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Plan prices mapping
    const planPrices: Record<string, number> = {
      standard: 250,
      pro: 600,
      premium: 850,
    };

    const planPrice = planPrices[plan_id];
    if (!planPrice) {
      return new Response(JSON.stringify({ error: 'Invalid plan selected' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get platform Razorpay config
    const { data: config, error: configError } = await supabase
      .from('platform_razorpay_config')
      .select('*')
      .eq('is_active', true)
      .single();

    if (configError || !config) {
      console.error('Platform Razorpay config not found:', configError);
      return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const setupFee = config.setup_fee || 1200;
    const totalAmount = setupFee + planPrice;
    const amountInPaise = totalAmount * 100;

    // Create Razorpay order
    const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${btoa(`${config.razorpay_key_id}:${config.razorpay_key_secret}`)}`,
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: `sub_${Date.now()}`,
        notes: {
          plan_id,
          user_id,
          user_email,
          business_name,
          restaurant_name,
          payment_type: 'new_subscription',
        },
      }),
    });

    if (!razorpayResponse.ok) {
      const errorText = await razorpayResponse.text();
      console.error('Razorpay order creation failed:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to create payment order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const razorpayOrder = await razorpayResponse.json();
    console.log('Razorpay order created:', razorpayOrder.id);

    // Store pending subscription payment
    const { error: insertError } = await supabase
      .from('subscription_payments')
      .insert({
        user_id,
        plan: plan_id,
        amount: planPrice,
        setup_fee: setupFee,
        razorpay_order_id: razorpayOrder.id,
        status: 'pending',
        payment_type: 'new',
        business_name,
        restaurant_name,
        contact_phone,
        contact_email: user_email,
      });

    if (insertError) {
      console.error('Error storing subscription payment:', insertError);
    }

    return new Response(JSON.stringify({
      order_id: razorpayOrder.id,
      key_id: config.razorpay_key_id,
      amount: amountInPaise,
      currency: 'INR',
      plan_price: planPrice,
      setup_fee: setupFee,
      total: totalAmount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in create-subscription-order:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
