import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id');
  console.log('Received userId:', userId);
  if (!userId) return new Response(JSON.stringify({ error: 'No user ID' }), { status: 401 });

  try {
    // Get the customer ID from the profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('payment_acc_id')
      .eq('user_id', userId)
      .single();

    console.log('Supabase profile lookup:', profile, profileError);

    if (!profile?.payment_acc_id) {
      return new Response(JSON.stringify({ error: 'No payment account found' }), { status: 404 });
    }

    // Get the customer's default payment method
    const customer = await stripe.customers.retrieve(profile.payment_acc_id);
    if (customer.deleted) {
      return new Response(JSON.stringify({ error: 'Customer account deleted' }), { status: 404 });
    }

    let paymentMethodId = customer.invoice_settings?.default_payment_method;

    // If no default, get the first attached payment method (card or bank)
    if (!paymentMethodId) {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: profile.payment_acc_id,
        type: 'card',
        limit: 1,
      });
      if (paymentMethods.data.length > 0) {
        paymentMethodId = paymentMethods.data[0].id;
      } else {
        const bankMethods = await stripe.paymentMethods.list({
          customer: profile.payment_acc_id,
          type: 'us_bank_account',
          limit: 1,
        });
        if (bankMethods.data.length > 0) {
          paymentMethodId = bankMethods.data[0].id;
        }
      }
    }

    if (!paymentMethodId) {
      return new Response(JSON.stringify({ error: 'No payment method found' }), { status: 404 });
    }

    // Detach the payment method
    await stripe.paymentMethods.detach(paymentMethodId as string);

    // Clear the default payment method in Stripe
    await stripe.customers.update(profile.payment_acc_id, {
      invoice_settings: {
        default_payment_method: undefined,
      },
    });

    // Clear the payment_acc_id in the profiles table
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ payment_acc_id: null })
      .eq('user_id', userId);

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('Error removing payment method:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
} 