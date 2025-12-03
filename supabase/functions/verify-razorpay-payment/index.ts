import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.74.0";
import { createHmac } from "https://deno.land/std@0.177.0/node/crypto.ts";

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
      order_data,
    } = await req.json();

    console.log('Verifying Razorpay payment:', { razorpay_order_id, razorpay_payment_id });

    // Initialize Supabase client with service role
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch tenant's Razorpay secret
    const { data: secretData, error: secretError } = await supabase
      .from('razorpay_tenant_secrets')
      .select('key_secret')
      .eq('tenant_id', order_data.tenant_id)
      .single();

    if (secretError || !secretData) {
      console.error('Error fetching Razorpay secret:', secretError);
      throw new Error('Razorpay credentials not found');
    }

    // Verify signature
    const generatedSignature = createHmac('sha256', secretData.key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      console.error('Signature verification failed');
      throw new Error('Invalid payment signature');
    }

    console.log('Signature verified successfully');

    // Generate order ID
    const { data: orderIdData, error: orderIdError } = await supabase.rpc("generate_order_id", {
      p_tenant_id: order_data.tenant_id
    });
    
    if (orderIdError) {
      console.error("Order ID generation failed:", orderIdError);
      throw new Error("Failed to generate order ID");
    }

    // Create order in database
    const { data: insertedOrder, error: insertError } = await supabase
      .from('orders')
      .insert({
        tenant_id: order_data.tenant_id,
        order_id: orderIdData,
        table_id: order_data.table_id,
        items_json: JSON.stringify(order_data.cart_items),
        subtotal: order_data.subtotal,
        service_charge: order_data.service_charge_rate,
        service_charge_amount: order_data.service_charge_amount,
        total: order_data.total,
        status: 'pending',
        payment_status: 'paid',
        payment_mode: 'razorpay',
        payment_claimed: true,
        paid_at: new Date().toISOString(),
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        user_id: order_data.user_id || null,
        customer_name: order_data.customer_name || 'Guest',
        customer_email: order_data.customer_email || '',
        customer_phone: order_data.customer_phone || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error creating order:', insertError);
      throw new Error('Failed to create order');
    }

    console.log('Order created successfully:', insertedOrder.order_id);

    return new Response(
      JSON.stringify({
        success: true,
        order_id: insertedOrder.order_id,
        message: 'Payment verified and order created successfully',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('Error in verify-razorpay-payment:', error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Payment verification failed' 
      }),
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});