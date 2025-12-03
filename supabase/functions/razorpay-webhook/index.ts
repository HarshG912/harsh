import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { crypto } from 'https://deno.land/std@0.177.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-razorpay-signature',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Razorpay webhook received');

    // Get webhook signature from headers
    const webhookSignature = req.headers.get('x-razorpay-signature');
    if (!webhookSignature) {
      console.error('Missing webhook signature');
      return new Response(JSON.stringify({ error: 'Missing signature' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the raw body for signature verification
    const rawBody = await req.text();
    const payload = JSON.parse(rawBody);

    console.log('Webhook event:', payload.event);

    // Extract payment details
    const event = payload.event;
    const paymentEntity = payload.payload?.payment?.entity;

    if (!paymentEntity) {
      console.error('Invalid webhook payload - missing payment entity');
      return new Response(JSON.stringify({ error: 'Invalid payload' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const razorpayOrderId = paymentEntity.order_id;
    const razorpayPaymentId = paymentEntity.id;

    console.log('Processing payment:', { razorpayOrderId, razorpayPaymentId, event });

    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find the order by razorpay_order_id
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('id, tenant_id, razorpay_payment_id, payment_status, status')
      .eq('razorpay_order_id', razorpayOrderId)
      .single();

    if (orderError || !orderData) {
      console.error('Order not found:', razorpayOrderId, orderError);
      // Return 200 to prevent Razorpay retries for non-existent orders
      return new Response(JSON.stringify({ received: true, message: 'Order not found' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Found order:', orderData.id, 'Current status:', orderData.payment_status);

    // Get tenant's webhook secret for signature verification
    const { data: secretData, error: secretError } = await supabase
      .from('razorpay_tenant_secrets')
      .select('webhook_secret')
      .eq('tenant_id', orderData.tenant_id)
      .single();

    if (secretError || !secretData?.webhook_secret) {
      console.warn('Webhook secret not configured for tenant:', orderData.tenant_id);
      // If no webhook secret, we can't verify but still process (less secure)
      // In production, you might want to reject this
    } else {
      // Verify webhook signature
      const expectedSignature = await generateWebhookSignature(rawBody, secretData.webhook_secret);
      
      if (expectedSignature !== webhookSignature) {
        console.error('Invalid webhook signature');
        return new Response(JSON.stringify({ error: 'Invalid signature' }), {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.log('Webhook signature verified successfully');
    }

    // Handle different payment events
    let updateData: any = {
      razorpay_payment_id: razorpayPaymentId,
      last_updated_at: new Date().toISOString(),
    };

    switch (event) {
      case 'payment.captured':
        // Payment successful
        console.log('Payment captured successfully');
        updateData.payment_status = 'paid';
        updateData.paid_at = new Date().toISOString();
        // Only update status to pending if it's still in initial state
        if (orderData.status === 'pending' && orderData.payment_status === 'unpaid') {
          updateData.status = 'pending'; // Chef dashboard will pick it up
        }
        break;

      case 'payment.failed':
        // Payment failed
        console.log('Payment failed');
        updateData.payment_status = 'failed';
        updateData.status = 'rejected';
        break;

      case 'payment.authorized':
        // Payment authorized but not captured yet
        console.log('Payment authorized');
        updateData.payment_status = 'authorized';
        break;

      default:
        console.log('Unhandled event type:', event);
        // Return 200 for unhandled events to prevent retries
        return new Response(JSON.stringify({ received: true }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }

    // Update order in database
    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderData.id);

    if (updateError) {
      console.error('Failed to update order:', updateError);
      return new Response(JSON.stringify({ error: 'Database update failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Order updated successfully:', orderData.id);

    return new Response(JSON.stringify({ 
      received: true, 
      orderId: orderData.id,
      event: event 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Generate HMAC SHA256 signature for webhook verification
async function generateWebhookSignature(body: string, secret: string): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const bodyData = encoder.encode(body);

  const key = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, bodyData);
  
  // Convert to hex string
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}
