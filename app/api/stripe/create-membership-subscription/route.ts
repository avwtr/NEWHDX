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
  let paymentIntentStatus = null;
  let paymentIntentError = null;
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
      expand: ['latest_invoice.payment_intent'],
    });
    console.log('[create-membership-subscription] Subscription created:', JSON.stringify(subscription, null, 2));

    // After creating the subscription, fetch the latest invoice and confirm its payment intent
    const invoiceId = typeof subscription.latest_invoice === 'string'
      ? subscription.latest_invoice
      : subscription.latest_invoice?.id;

    if (invoiceId) {
      // Retrieve the invoice and log the raw response
      const invoiceResponse = await stripe.invoices.retrieve(invoiceId, { expand: ['payment_intent'] });
      console.log('[create-membership-subscription] Raw invoice response:', JSON.stringify(invoiceResponse, null, 2));
      let invoice: any = invoiceResponse;
      if (!invoice.payment_intent && invoice.data && invoice.data.payment_intent) {
        invoice = invoice.data;
      }
      // If invoice is open and not auto-advanced, finalize it to generate payment intent
      if (invoice.status === 'open' && invoice.auto_advance === false) {
        try {
          const finalizedInvoice = await stripe.invoices.finalizeInvoice(invoice.id, {});
          invoice = finalizedInvoice; // Use the finalized invoice for next steps
          console.log('[create-membership-subscription] Finalized invoice:', JSON.stringify(finalizedInvoice, null, 2));
        } catch (err) {
          console.error('[create-membership-subscription] Error finalizing invoice:', err);
        }
      }
      // Now, extract the payment intent
      const paymentIntentId = typeof invoice.payment_intent === 'string'
        ? invoice.payment_intent
        : invoice.payment_intent?.id;
      console.log('[create-membership-subscription] Extracted paymentIntentId:', paymentIntentId);
      if (paymentIntentId) {
        try {
          const confirmedIntent = await stripe.paymentIntents.confirm(paymentIntentId, { off_session: true });
          console.log('[create-membership-subscription] Confirmed payment intent:', JSON.stringify(confirmedIntent, null, 2));
          if (confirmedIntent.status !== 'succeeded') {
            console.error('Payment intent not succeeded:', confirmedIntent.status, confirmedIntent.last_payment_error);
          }
        } catch (err) {
          console.error('[create-membership-subscription] Error confirming payment intent:', err);
        }
      } else {
        console.error('[create-membership-subscription] No payment intent ID found to confirm.');
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }

  // Convert monthlyAmount to cents (integer)
  const monthlyAmountCents = Math.round(Number(monthlyAmount) * 100);

  // 6. Store in labSubscribers (amount in cents)
  const { error: subError } = await supabase.from("labSubscribers").insert({
    userId: normalizedUserId,
    labId,
    monthlyAmount: monthlyAmountCents, // store as integer cents
    stripe_id: subscription.id,
    created_at: new Date().toISOString(),
  });
  
  if (subError) {
    console.error("[Membership Subscription] Failed to store subscription:", {
      error: subError,
      data: {
        userId: normalizedUserId,
        labId,
        monthlyAmount: monthlyAmountCents,
        stripe_id: subscription.id
      }
    });
    return NextResponse.json({ 
      error: "Failed to store subscription.", 
      details: subError 
    }, { status: 500 });
  }

  // 7. Increment amount_contributed for the selected funding goal (in cents)
  if (goalId) {
    // Fetch current amount_contributed
    const { data: goal, error: goalError } = await supabase
      .from("funding_goals")
      .select("amount_contributed")
      .eq("id", goalId)
      .single();
    if (!goalError && goal) {
      const newAmount = Number(goal.amount_contributed || 0) + monthlyAmountCents;
      await supabase
        .from("funding_goals")
        .update({ amount_contributed: newAmount })
        .eq("id", goalId);
    }
  }

  // At the end, return payment intent status and error for debugging
  return NextResponse.json({ success: true, subscriptionId: subscription.id, paymentIntentStatus, paymentIntentError });
} 