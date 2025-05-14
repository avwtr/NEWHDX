import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: NextRequest) {
  try {
    const { goalId } = await req.json();
    if (!goalId) {
      return NextResponse.json({ error: "Missing goalId" }, { status: 400 });
    }
    const { error } = await supabase
      .from("funding_goals")
      .delete()
      .eq("id", goalId);
    if (error) {
      return NextResponse.json({ error: "Failed to delete funding goal.", details: error }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 