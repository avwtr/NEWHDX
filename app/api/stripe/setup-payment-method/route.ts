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
    // Get or create a Stripe customer for this user
    const { data: profile } = await supabase
      .from('profiles')
      .select('payment_acc_id')
      .eq('user_id', userId)
      .single();

    let customerId = profile?.payment_acc_id;

    if (!customerId) {
      // Create a new customer
      const customer = await stripe.customers.create({
        metadata: {
          userId: userId,
        },
      });
      customerId = customer.id;

      // Save the customer ID to the profile
      await supabase
        .from('profiles')
        .update({ payment_acc_id: customerId })
        .eq('user_id', userId);
    }

    // Create a SetupIntent
    const setupIntent = await stripe.setupIntents.create({
      customer: customerId,
      payment_method_types: ['card', 'us_bank_account'],
    });

    // NOTE: After confirming the SetupIntent on the frontend, you must call a backend endpoint to set the new payment method as default for the customer.
    // This will ensure the payment method is always set as default.

    return new Response(JSON.stringify({ 
      clientSecret: setupIntent.client_secret 
    }), { status: 200 });
  } catch (err: any) {
    console.error('Error setting up payment method:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
} 