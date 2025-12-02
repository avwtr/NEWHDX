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
    const experimentId = searchParams.get('experimentId')

    if (!experimentId) {
      return NextResponse.json({ error: 'experimentId is required' }, { status: 400 })
    }

    // Fetch final video path from experiment_summary
    const { data, error } = await supabaseAdmin
      .from('experiment_summary')
      .select('final_video_path')
      .eq('experiment_id', experimentId)
      .single()

    if (error || !data?.final_video_path) {
      return NextResponse.json({ data: { videoUrl: null } })
    }

    // Get signed URL (1 hour expiry)
    const { data: signed, error: signErr } = await supabaseAdmin.storage
      .from('experiment-engine')
      .createSignedUrl(data.final_video_path, 3600)

    if (!signErr && signed?.signedUrl) {
      return NextResponse.json({ data: { videoUrl: signed.signedUrl } })
    }

    // Fallback to public URL
    const { data: pub } = supabaseAdmin.storage
      .from('experiment-engine')
      .getPublicUrl(data.final_video_path)

    return NextResponse.json({ data: { videoUrl: pub?.publicUrl || null } })
  } catch (error) {
    console.error('Error in /api/experiment-engine/concluded-video:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

