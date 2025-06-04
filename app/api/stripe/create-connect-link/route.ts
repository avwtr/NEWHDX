import { NextRequest } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

// Use your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  // Get user ID from headers
  const userId = req.headers.get('x-user-id');
  if (!userId) return new Response(JSON.stringify({ error: 'No user ID' }), { status: 401 });

  // Fetch user profile from Supabase
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('funding_id, user_id')
    .eq('user_id', userId)
    .single();
  if (profileError) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user profile', details: profileError }), { status: 500 });
  }

  // Fetch email from user_emails view
  const { data: userEmail, error: emailError } = await supabase
    .from('user_emails')
    .select('email')
    .eq('id', userId)
    .single();
  if (emailError || !userEmail) {
    return new Response(JSON.stringify({ error: 'Failed to fetch user email', details: emailError }), { status: 500 });
  }
  const email = userEmail.email;

  let stripeAccountId = profile?.funding_id;

  // Read businessType from POST body
  const body = await req.json();
  const businessType = body.businessType === 'company' ? 'company' : 'individual';

  // 1. Create a Stripe account if not exists
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      business_type: businessType,
      email,
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    stripeAccountId = account.id;
    // Save to Supabase
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ funding_id: stripeAccountId })
      .eq('user_id', userId);
    if (updateError) {
      return new Response(JSON.stringify({ error: 'Failed to save funding_id to Supabase', details: updateError }), { status: 500 });
    }
  }

  // 2. Create an account link for onboarding
  const origin = req.headers.get("origin") || 'http://localhost:3000';
  const accountLink = await stripe.accountLinks.create({
    account: stripeAccountId,
    refresh_url: `${origin}/profile?stripe=refresh`,
    return_url: `${origin}/profile?stripe=success&account=${stripeAccountId}`,
    type: 'account_onboarding',
  });

  return new Response(JSON.stringify({ url: accountLink.url }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
