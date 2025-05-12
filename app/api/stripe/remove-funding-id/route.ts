import { NextRequest } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  const userId = req.headers.get('x-user-id'); // Replace with real auth
  if (!userId) return new Response(JSON.stringify({ error: 'No user ID' }), { status: 401 });

  const { error } = await supabase.from('profiles').update({ funding_id: null }).eq('user_id', userId);
  if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });

  return new Response(JSON.stringify({ success: true }), { status: 200 });
} 