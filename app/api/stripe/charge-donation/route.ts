import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { userId, labId, goalId, amount } = await req.json();

  // 1. Get user's Stripe customer/payment method from your profiles table
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("payment_acc_id")
    .eq("user_id", userId)
    .single();

  if (!userProfile?.payment_acc_id) {
    return NextResponse.json({ error: "No Stripe customer/payment_acc_id found for user." }, { status: 400 });
  }

  // 2. Get lab's Stripe account from labs table
  const { data: lab } = await supabase
    .from("labs")
    .select("funding_id")
    .eq("labId", labId)
    .single();

  if (!lab?.funding_id) {
    return NextResponse.json({ error: "Lab does not have a connected Stripe account." }, { status: 400 });
  }

  // 3. Get user's default payment method
  const customerObj = await stripe.customers.retrieve(userProfile.payment_acc_id);
  const customer = customerObj as Stripe.Customer;
  let paymentMethodId = null;
  if (customer.invoice_settings?.default_payment_method) {
    paymentMethodId = typeof customer.invoice_settings.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings.default_payment_method.id;
  } else {
    // fallback: get first attached card
    const paymentMethods = await stripe.paymentMethods.list({
      customer: userProfile.payment_acc_id,
      type: "card",
      limit: 1,
    });
    if (paymentMethods.data.length > 0) {
      paymentMethodId = paymentMethods.data[0].id;
    }
  }
  if (!paymentMethodId) {
    return NextResponse.json({ error: "No payment method found for user." }, { status: 400 });
  }

  // 4. Calculate fee and net
  const fee = Math.round(amount * 0.025);
  const net = amount - fee;

  // 5. Create PaymentIntent with destination charge
  let paymentIntent;
  try {
    paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      customer: userProfile.payment_acc_id,
      payment_method: paymentMethodId,
      off_session: true,
      confirm: true,
      application_fee_amount: fee,
      on_behalf_of: lab.funding_id,
      transfer_data: {
        destination: lab.funding_id,
      },
      metadata: {
        userId,
        labId,
        goalId,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 6. Log donation in labDonors
  await supabase.from("labDonors").insert({
    userId,
    labId,
    donationAmount: amount,
    towards_goal: goalId,
    transaction_id: paymentIntent.id,
  });

  return NextResponse.json({ success: true, paymentIntentId: paymentIntent.id });
} 