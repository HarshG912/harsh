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
      action, // 'create_order' or 'verify_payment'
      tenant_id,
      new_plan_id,
      user_id,
      // For verify_payment
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = await req.json();

    console.log('Process plan change:', { action, tenant_id, new_plan_id });

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Plan prices
    const planPrices: Record<string, number> = {
      standard: 250,
      pro: 600,
      premium: 850,
    };

    if (action === 'create_order') {
      // Get current tenant plan
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .select('plan')
        .eq('id', tenant_id)
        .single();

      if (tenantError || !tenant) {
        return new Response(JSON.stringify({ error: 'Tenant not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const currentPlan = tenant.plan;
      const currentPrice = planPrices[currentPlan] || 0;
      const newPrice = planPrices[new_plan_id];

      if (!newPrice) {
        return new Response(JSON.stringify({ error: 'Invalid plan selected' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Get platform Razorpay config
      const { data: config, error: configError } = await supabase
        .from('platform_razorpay_config')
        .select('*')
        .eq('is_active', true)
        .single();

      if (configError || !config) {
        return new Response(JSON.stringify({ error: 'Payment gateway not configured' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Calculate amount (for upgrade, charge difference; for downgrade, no charge - just update)
      const isUpgrade = newPrice > currentPrice;
      const priceDifference = newPrice - currentPrice;
      
      // For downgrades, just process immediately without payment
      if (!isUpgrade) {
        // Update tenant plan
        const planEndDate = new Date();
        planEndDate.setDate(planEndDate.getDate() + 30);

        await supabase
          .from('tenants')
          .update({
            plan: new_plan_id,
            plan_end_date: planEndDate.toISOString(),
          })
          .eq('id', tenant_id);

        // Record the plan change
        await supabase
          .from('subscription_payments')
          .insert({
            user_id,
            tenant_id,
            plan: new_plan_id,
            amount: 0,
            status: 'completed',
            payment_type: 'downgrade',
            completed_at: new Date().toISOString(),
          });

        return new Response(JSON.stringify({
          success: true,
          message: 'Plan downgraded successfully',
          requires_payment: false,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // For upgrades, create Razorpay order
      const amountInPaise = priceDifference * 100;

      const razorpayResponse = await fetch('https://api.razorpay.com/v1/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${btoa(`${config.razorpay_key_id}:${config.razorpay_key_secret}`)}`,
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `upgrade_${Date.now()}`,
          notes: {
            tenant_id,
            current_plan: currentPlan,
            new_plan: new_plan_id,
            payment_type: 'upgrade',
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

      // Store pending payment
      await supabase
        .from('subscription_payments')
        .insert({
          user_id,
          tenant_id,
          plan: new_plan_id,
          amount: priceDifference,
          razorpay_order_id: razorpayOrder.id,
          status: 'pending',
          payment_type: 'upgrade',
        });

      return new Response(JSON.stringify({
        requires_payment: true,
        order_id: razorpayOrder.id,
        key_id: config.razorpay_key_id,
        amount: amountInPaise,
        currency: 'INR',
        price_difference: priceDifference,
        current_plan: currentPlan,
        new_plan: new_plan_id,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'verify_payment') {
      // Get platform config for verification
      const { data: config, error: configError } = await supabase
        .from('platform_razorpay_config')
        .select('razorpay_key_secret')
        .eq('is_active', true)
        .single();

      if (configError || !config) {
        return new Response(JSON.stringify({ error: 'Payment verification failed' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Verify signature
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
        return new Response(JSON.stringify({ error: 'Invalid payment signature' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Update tenant plan
      const planEndDate = new Date();
      planEndDate.setDate(planEndDate.getDate() + 30);

      await supabase
        .from('tenants')
        .update({
          plan: new_plan_id,
          plan_start_date: new Date().toISOString(),
          plan_end_date: planEndDate.toISOString(),
        })
        .eq('id', tenant_id);

      // Update payment record
      await supabase
        .from('subscription_payments')
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('razorpay_order_id', razorpay_order_id);

      return new Response(JSON.stringify({
        success: true,
        message: 'Plan upgraded successfully',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Error in process-plan-change:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
