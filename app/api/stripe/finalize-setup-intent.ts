import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { setupIntentId } = await req.json();
    if (!setupIntentId) {
      return new Response(JSON.stringify({ error: 'Missing setupIntentId' }), { status: 400 });
    }
    const setupIntent = await stripe.setupIntents.retrieve(setupIntentId);
    const customerId = setupIntent.customer;
    const paymentMethodId = setupIntent.payment_method;
    if (!customerId || !paymentMethodId) {
      return new Response(JSON.stringify({ error: 'Missing customer or payment method on SetupIntent' }), { status: 400 });
    }
    await stripe.customers.update(customerId as string, {
      invoice_settings: {
        default_payment_method: paymentMethodId as string,
      },
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('Error finalizing setup intent:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
} 