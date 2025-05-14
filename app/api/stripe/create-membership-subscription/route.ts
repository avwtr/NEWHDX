import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const { userId, labId, goalId } = await req.json();

  // Ensure userId is trimmed for lookup (do not lowercase)
  const normalizedUserId = typeof userId === 'string' ? userId.trim() : userId;
  console.log("[Membership Subscription] Received userId:", userId, "Normalized:", normalizedUserId);

  // 1. Get the current monthly amount for the lab
  const { data: lab, error: labError } = await supabase
    .from("recurring_funding")
    .select("monthly_amount")
    .eq("labId", labId)
    .single();
  if (labError || !lab) {
    return NextResponse.json({ error: "Lab membership not found." }, { status: 400 });
  }
  const monthlyAmount = lab.monthly_amount;

  // 2. Get user's Stripe customer/payment method from profiles
  const { data: userProfile, error: userProfileError } = await supabase
    .from("profiles")
    .select("payment_acc_id, user_id")
    .eq("user_id", normalizedUserId)
    .single();
  console.log("[Membership Subscription] Profile lookup result:", userProfile, userProfileError);
  if (!userProfile?.payment_acc_id) {
    return NextResponse.json({ error: "No Stripe customer/payment_acc_id found for user.", debug: { userId, normalizedUserId, userProfile, userProfileError } }, { status: 400 });
  }

  // Update Stripe customer with user_id as name
  await stripe.customers.update(userProfile.payment_acc_id, { 
    name: userProfile.user_id 
  });

  // Get the user's default card payment method
  const customerObj = await stripe.customers.retrieve(userProfile.payment_acc_id, {
    expand: ['invoice_settings.default_payment_method'],
  });
  const customer = customerObj as Stripe.Customer;

  let defaultPaymentMethodId = null;
  if (customer.invoice_settings?.default_payment_method &&
      typeof customer.invoice_settings.default_payment_method !== 'string' &&
      customer.invoice_settings.default_payment_method.type === 'card') {
    defaultPaymentMethodId = customer.invoice_settings.default_payment_method.id;
  }

  // If no default card, try first attached card
  if (!defaultPaymentMethodId) {
    const cardMethods = await stripe.paymentMethods.list({
      customer: userProfile.payment_acc_id,
      type: 'card',
      limit: 1,
    });
    if (cardMethods.data.length > 0) {
      defaultPaymentMethodId = cardMethods.data[0].id;
    }
  }

  if (!defaultPaymentMethodId) {
    return NextResponse.json({ error: "No card payment method found for user." }, { status: 400 });
  }

  // Set the default payment method on the customer
  await stripe.customers.update(userProfile.payment_acc_id, {
    invoice_settings: { default_payment_method: defaultPaymentMethodId },
  });

  // 3. Get lab's Stripe account from labs table
  const { data: labData } = await supabase
    .from("labs")
    .select("funding_id")
    .eq("labId", labId)
    .single();
  if (!labData?.funding_id) {
    return NextResponse.json({ error: "Lab does not have a connected Stripe account." }, { status: 400 });
  }

  // 4. Create a Stripe product/price if needed (or use a generic one)
  // For simplicity, create a price on the fly
  const product = await stripe.products.create({
    name: `Lab Membership for ${labId}`,
    metadata: { labId, goalId }
  });
  const price = await stripe.prices.create({
    unit_amount: Math.round(monthlyAmount * 100),
    currency: "usd",
    recurring: { interval: "month" },
    product: product.id,
  });

  // 5. Create the subscription, explicitly set default_payment_method
  let subscription;
  try {
    subscription = await stripe.subscriptions.create({
      customer: userProfile.payment_acc_id,
      items: [{ price: price.id }],
      application_fee_percent: 2.5,
      transfer_data: { destination: labData.funding_id },
      metadata: { labId, goalId },
      payment_behavior: "default_incomplete",
      default_payment_method: defaultPaymentMethodId,
      off_session: true,
      // Stripe will use the default payment method for recurring billing
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // 6. Store in labSubscribers
  const { error: subError } = await supabase.from("labSubscribers").insert({
    userId,
    labId,
    monthlyAmount,
    stripe_id: subscription.id,
    created_at: new Date().toISOString(),
  });
  if (subError) {
    return NextResponse.json({ error: "Failed to store subscription." }, { status: 500 });
  }

  // 7. Increment amount_contributed for the selected funding goal
  if (goalId) {
    // Fetch current amount_contributed
    const { data: goal, error: goalError } = await supabase
      .from("funding_goals")
      .select("amount_contributed")
      .eq("id", goalId)
      .single();
    if (!goalError && goal) {
      const newAmount = Number(goal.amount_contributed || 0) + Number(monthlyAmount);
      await supabase
        .from("funding_goals")
        .update({ amount_contributed: newAmount })
        .eq("id", goalId);
    }
  }

  return NextResponse.json({ success: true, subscriptionId: subscription.id });
} 