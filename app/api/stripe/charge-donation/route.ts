import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { userId, labId, goalId, goalName, amount, caption } = await req.json();

  // Always fetch the fund name from the DB to guarantee correctness
  let finalGoalName = goalName;
  if (goalId) {
    const { data: fund, error: fundError } = await supabase
      .from('funding_goals')
      .select('goalName')
      .eq('id', goalId)
      .single();
    if (!fundError && fund?.goalName) {
      finalGoalName = fund.goalName;
    }
  }

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
  console.log('[charge-donation] Customer:', customer);
  
  let paymentMethodId = null;
  if (customer.invoice_settings?.default_payment_method) {
    paymentMethodId = typeof customer.invoice_settings.default_payment_method === 'string'
      ? customer.invoice_settings.default_payment_method
      : customer.invoice_settings.default_payment_method.id;
    console.log('[charge-donation] Using default payment method:', paymentMethodId);
  } else {
    // fallback: get first attached payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: userProfile.payment_acc_id,
      type: "us_bank_account", // Changed from "card" to "us_bank_account"
      limit: 1,
    });
    console.log('[charge-donation] Found payment methods:', paymentMethods);
    if (paymentMethods.data.length > 0) {
      paymentMethodId = paymentMethods.data[0].id;
      console.log('[charge-donation] Using first payment method:', paymentMethodId);
    }
  }
  if (!paymentMethodId) {
    console.log('[charge-donation] No payment method found');
    return NextResponse.json({ error: "No payment method found for user." }, { status: 400 });
  }

  // 4. Calculate fee and net
  const fee = Math.round(amount * 0.025);
  const net = amount - fee;
  console.log('[charge-donation] Amount:', amount, 'Fee:', fee, 'Net:', net);

  // 5. Create PaymentIntent with destination charge
  let paymentIntent;
  try {
    console.log('[charge-donation] Creating payment intent with:', {
      amount,
      customer: userProfile.payment_acc_id,
      payment_method: paymentMethodId,
      lab_funding_id: lab.funding_id
    });
    
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
      payment_method_types: ['card', 'us_bank_account'],
    });
    console.log('[charge-donation] Payment intent created:', paymentIntent.id);
  } catch (err: any) {
    console.error('[charge-donation] Error creating payment intent:', err);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 6. Log donation in labDonors
  try {
    const { error: insertError } = await supabase.from("labDonors").insert({
      userId,
      labId,
      donationAmount: amount / 100,
      towards_goal: finalGoalName,
      transaction_id: paymentIntent.id,
      caption: caption || null,
    });
    
    if (insertError) {
      console.error('[charge-donation] Error inserting into labDonors:', insertError);
      return NextResponse.json({ error: "Failed to log donation" }, { status: 500 });
    }
    console.log('[charge-donation] Successfully logged donation');

    // Update the amount_contributed in funding_goals (use goalId)
    const donationAmount = amount / 100;
    const { data: goal, error: goalError } = await supabase
      .from("funding_goals")
      .select("amount_contributed")
      .eq("lab_id", labId)
      .eq("id", goalId)
      .single();

    if (!goalError && goal) {
      const newAmount = (goal.amount_contributed || 0) + donationAmount;
      const { error: updateError } = await supabase
        .from("funding_goals")
        .update({ amount_contributed: newAmount })
        .eq("lab_id", labId)
        .eq("id", goalId);
      if (updateError) {
        console.error('[charge-donation] Error updating funding_goals:', updateError);
      }
    }
  } catch (err: any) {
    console.error('[charge-donation] Error in labDonors insert:', err);
    return NextResponse.json({ error: "Failed to log donation" }, { status: 500 });
  }

  return NextResponse.json({ success: true, paymentIntentId: paymentIntent.id });
} 