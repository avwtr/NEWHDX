require('dotenv').config();
const Stripe = require('stripe');
const { createClient } = require('@supabase/supabase-js');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2025-04-30.basil' });
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  // 1. Get all profiles with a funding_id
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('user_id, funding_id')
    .not('funding_id', 'is', null);

  if (error) {
    console.error('Error fetching profiles:', error);
    process.exit(1);
  }

  for (const profile of profiles) {
    try {
      // 2. Update the Stripe account to request transfers capability
      await stripe.accounts.update(profile.funding_id, {
        capabilities: {
          transfers: { requested: true }
        }
      });
      console.log(`Enabled transfers for account: ${profile.funding_id}`);
    } catch (err) {
      console.error(`Failed to update account ${profile.funding_id}:`, err.message);
    }
  }
  console.log('Migration complete.');
}

main(); 