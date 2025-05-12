import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response(JSON.stringify({ error: 'No user ID' }), { status: 401 });

  try {
    // Get the customer ID from the profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('payment_acc_id')
      .eq('user_id', userId)
      .single();

    if (!profile?.payment_acc_id) {
      return new Response(JSON.stringify({ error: 'No payment account found' }), { status: 404 });
    }

    // Get the customer's default payment method
    const customer = await stripe.customers.retrieve(profile.payment_acc_id);
    if (customer.deleted) {
      return new Response(JSON.stringify({ error: 'Customer account deleted' }), { status: 404 });
    }

    const defaultPaymentMethod = customer.invoice_settings?.default_payment_method;
    if (!defaultPaymentMethod) {
      return new Response(JSON.stringify({ error: 'No payment method found' }), { status: 404 });
    }

    // Detach the payment method
    await stripe.paymentMethods.detach(defaultPaymentMethod as string);

    // Clear the default payment method
    await stripe.customers.update(profile.payment_acc_id, {
      invoice_settings: {
        default_payment_method: undefined,
      },
    });

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('Error removing payment method:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
} 