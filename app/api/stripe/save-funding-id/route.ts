import { NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const headers = Object.fromEntries(req.headers.entries());
  const userId = req.headers.get('x-user-id');
  const { funding_id } = await req.json();

  if (!userId) {
    return new Response(JSON.stringify({ error: 'No user ID' }), { status: 401 });
  }
  if (!funding_id) {
    return new Response(JSON.stringify({ error: 'No funding_id' }), { status: 400 });
  }

  // Check if a profile row exists for this user_id
  const { data: existing, error: fetchError } = await supabase.from('profiles').select('user_id').eq('user_id', userId).single();
  if (fetchError && fetchError.code !== 'PGRST116') {
    // Not a "row not found" error
    return new Response(JSON.stringify({ error: fetchError.message, details: fetchError }), { status: 500 });
  }

  let result;
  if (!existing) {
    // Insert new row
    const { error: insertError, data: insertData } = await supabase.from('profiles').insert({ user_id: userId, funding_id }).select();
    if (insertError) {
      return new Response(JSON.stringify({ error: insertError.message, details: insertError }), { status: 500 });
    }
    result = insertData;
  } else {
    // Update existing row
    const { error: updateError, data: updateData } = await supabase.from('profiles').update({ funding_id }).eq('user_id', userId).select();
    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message, details: updateError }), { status: 500 });
    }
    result = updateData;
  }

  return new Response(JSON.stringify({ success: true, data: result }), { status: 200 });
} 