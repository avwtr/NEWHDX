import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { grant_id } = await req.json();
  const userId = req.headers.get('x-user-id');
  if (!grant_id || !userId) return NextResponse.json({ error: "Missing grant_id or user" }, { status: 400 });

  // 1. Fetch grant
  const { data: grant, error: grantError } = await supabase
    .from("grants")
    .select("*")
    .eq("grant_id", grant_id)
    .single();
  if (grantError || !grant) return NextResponse.json({ error: "Grant not found" }, { status: 404 });
  if (grant.closure_status !== "AWARDED" || grant.user_accepted !== userId) {
    return NextResponse.json({ error: "Not authorized or grant not awarded to you" }, { status: 403 });
  }

  // 2. Fetch grant issuer's payment_acc_id
  const { data: issuerProfile } = await supabase
    .from("profiles")
    .select("payment_acc_id")
    .eq("user_id", grant.created_by)
    .single();
  if (!issuerProfile?.payment_acc_id) {
    return NextResponse.json({ error: "Grant issuer has no payment method on file." }, { status: 400 });
  }

  // 3. Fetch awarded user's funding_id
  const { data: winnerProfile } = await supabase
    .from("profiles")
    .select("funding_id")
    .eq("user_id", userId)
    .single();
  if (!winnerProfile?.funding_id) {
    return NextResponse.json({ error: "No payout bank account connected." }, { status: 400 });
  }

  // 4. Get issuer's default payment method
  const customerObj = await stripe.customers.retrieve(issuerProfile.payment_acc_id, {
    expand: ['invoice_settings.default_payment_method'],
  });
  const customer = customerObj as Stripe.Customer;
  let paymentMethodId = null;
  if (customer.invoice_settings?.default_payment_method &&
      typeof customer.invoice_settings.default_payment_method !== 'string' &&
      customer.invoice_settings.default_payment_method.type === 'card') {
    paymentMethodId = customer.invoice_settings.default_payment_method.id;
  }
  if (!paymentMethodId) {
    // fallback: get first attached card
    const paymentMethods = await stripe.paymentMethods.list({
      customer: issuerProfile.payment_acc_id,
      type: 'card',
      limit: 1,
    });
    if (paymentMethods.data.length > 0) {
      paymentMethodId = paymentMethods.data[0].id;
    }
  }
  if (!paymentMethodId) {
    return NextResponse.json({ error: "No card payment method found for grant issuer." }, { status: 400 });
  }

  // 5. Create PaymentIntent with transfer to winner
  const amount = Math.round(Number(grant.grant_amount) * 100); // USD cents
  const MAX_AMOUNT = 5000 * 100; // $5,000 in cents
  const finalAmount = Math.min(amount, MAX_AMOUNT);
  
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount: finalAmount,
      currency: "usd",
      customer: issuerProfile.payment_acc_id,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      transfer_data: {
        destination: winnerProfile.funding_id,
      },
      metadata: {
        grant_id,
        awarded_to: userId,
        original_amount: amount,
        final_amount: finalAmount,
      },
      payment_method_types: ['card'],
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 6. Update grants table with transaction id
  const { error: updateError, data: updatedGrant } = await supabase
    .from("grants")
    .update({ stripe_id: paymentIntent.id })
    .eq("grant_id", grant_id)
    .select()
    .single();
  if (updateError) {
    return NextResponse.json({ error: "Failed to update grant with Stripe transaction ID: " + updateError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, paymentIntentId: paymentIntent.id, grant: updatedGrant });
} 