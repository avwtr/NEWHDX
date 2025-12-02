import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const labId = searchParams.get('labId')

    if (!labId) {
      return NextResponse.json({ error: 'labId is required' }, { status: 400 })
    }

    // Fetch experiment_details
    const { data: experiments, error: expError } = await supabaseAdmin
      .from('experiment_details')
      .select(`
        experiment_id,
        experiment_name,
        lab_id,
        created_by_user_id,
        experiment_status,
        created_at,
        updated_at
      `)
      .eq('lab_id', labId)
      .order('created_at', { ascending: false })

    if (expError) {
      console.error('Error fetching Experiment Engine experiments:', expError)
      return NextResponse.json({ error: expError.message }, { status: 500 })
    }

    return NextResponse.json({ data: experiments || [] })
  } catch (error) {
    console.error('Error in /api/experiment-engine/experiments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

