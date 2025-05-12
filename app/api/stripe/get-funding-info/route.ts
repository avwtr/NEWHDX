import { NextRequest } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: '2023-10-16',
});

export async function POST(req: NextRequest) {
  const { funding_id } = await req.json();
  if (!funding_id) return new Response(JSON.stringify({ error: 'No funding_id' }), { status: 400 });

  try {
    // List external accounts (bank accounts) for the Stripe account
    const accounts = await stripe.accounts.listExternalAccounts(funding_id, { object: 'bank_account', limit: 1 });
    const bank = accounts.data[0];
    if (!bank) return new Response(JSON.stringify({ error: 'No bank account found' }), { status: 404 });
    return new Response(JSON.stringify({
      last4: bank.last4,
      bankName: bank.bank_name,
      status: bank.status,
      accountHolder: bank.account_holder_name,
    }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
} 