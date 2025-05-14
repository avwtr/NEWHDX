import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: "2025-04-30.basil" });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    let { subscriptionId } = await req.json();
    if (!subscriptionId) {
      return NextResponse.json({ error: "Missing subscriptionId" }, { status: 400 });
    }
    subscriptionId = String(subscriptionId).trim();
    console.log('Cancelling subscriptionId:', subscriptionId);

    // Cancel the Stripe subscription
    await stripe.subscriptions.update(subscriptionId, { cancel_at_period_end: true });

    // Delete the row from labSubscribers
    const { error } = await supabase
      .from("labSubscribers")
      .delete()
      .eq("stripe_id", subscriptionId);
    console.log('Supabase delete result:', { error });
    if (error) {
      return NextResponse.json({ error: "Failed to delete subscription in database.", details: error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 