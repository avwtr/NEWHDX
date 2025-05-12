import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2025-04-30.basil',
});

export async function POST(req: NextRequest) {
  try {
    const { customerId, paymentMethodId } = await req.json();
    if (!customerId || !paymentMethodId) {
      return new Response(JSON.stringify({ error: 'Missing customerId or paymentMethodId' }), { status: 400 });
    }
    await stripe.customers.update(customerId, {
      invoice_settings: {
        default_payment_method: paymentMethodId,
      },
    });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (err: any) {
    console.error('Error setting default payment method:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
} 