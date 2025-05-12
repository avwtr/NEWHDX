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
    const customer = await stripe.customers.retrieve(profile.payment_acc_id, {
      expand: ['invoice_settings.default_payment_method'],
    });

    if (customer.deleted) {
      return new Response(JSON.stringify({ error: 'Customer account deleted' }), { status: 404 });
    }

    let paymentMethod = (customer as Stripe.Customer).invoice_settings?.default_payment_method;

    // If no default, fetch the first attached payment method
    if (!paymentMethod || typeof paymentMethod === 'string') {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: profile.payment_acc_id,
        type: 'card',
        limit: 1,
      });
      if (paymentMethods.data.length > 0) {
        paymentMethod = paymentMethods.data[0];
      } else {
        // Try bank account if no card
        const bankMethods = await stripe.paymentMethods.list({
          customer: profile.payment_acc_id,
          type: 'us_bank_account',
          limit: 1,
        });
        if (bankMethods.data.length > 0) {
          paymentMethod = bankMethods.data[0];
        } else {
          return new Response(JSON.stringify({ error: 'No payment method found' }), { status: 404 });
        }
      }
    }

    // Return payment method details
    return new Response(JSON.stringify({
      type: paymentMethod.type,
      brand: paymentMethod.card?.brand,
      last4: paymentMethod.card?.last4 || paymentMethod.us_bank_account?.last4,
      exp_month: paymentMethod.card?.exp_month,
      exp_year: paymentMethod.card?.exp_year,
      bank_name: paymentMethod.us_bank_account?.bank_name,
    }), { status: 200 });
  } catch (err: any) {
    console.error('Error getting payment info:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
} 