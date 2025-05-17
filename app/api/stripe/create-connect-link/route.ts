import { NextRequest } from "next/server";
import Stripe from "stripe";

// Use your secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: NextRequest) {
  // TODO: Get the current user from your auth/session
  const userId = 'demo-user-id'; // Replace with real user ID from session
  let stripeAccountId = null; // Fetch from your DB if user already has one

  // Read businessType from POST body
  const body = await req.json();
  const businessType = body.businessType === 'company' ? 'company' : 'individual';

  // 1. Create a Stripe account if not exists
  if (!stripeAccountId) {
    const account = await stripe.accounts.create({
      type: 'express',
      business_type: businessType,
      email: 'user@example.com', // Replace with user's email
      capabilities: {
        card_payments: { requested: true },
        transfers: { requested: true },
      },
    });
    stripeAccountId = account.id;
    // TODO: Save stripeAccountId to your DB for this user!
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
