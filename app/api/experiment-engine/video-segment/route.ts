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

    // List files in the experiment folder
    const { data: files, error } = await supabaseAdmin.storage
      .from('experiment-engine')
      .list(experimentId, {
        limit: 10,
        sortBy: { column: 'created_at', order: 'asc' }
      })

    if (error || !files || files.length === 0) {
      return NextResponse.json({ data: { videoUrl: null } })
    }

    // Find the first video segment (format: segment_*.webm)
    const videoFile = files.find(file =>
      file.name.startsWith('segment_') && file.name.endsWith('.webm')
    )

    if (!videoFile) {
      return NextResponse.json({ data: { videoUrl: null } })
    }

    // Get signed URL (1 hour expiry)
    const { data, error: signedUrlError } = await supabaseAdmin.storage
      .from('experiment-engine')
      .createSignedUrl(`${experimentId}/${videoFile.name}`, 3600)

    if (!signedUrlError && data?.signedUrl) {
      return NextResponse.json({ data: { videoUrl: data.signedUrl } })
    }

    // Fallback to public URL
    const { data: pub } = supabaseAdmin.storage
      .from('experiment-engine')
      .getPublicUrl(`${experimentId}/${videoFile.name}`)

    return NextResponse.json({ data: { videoUrl: pub?.publicUrl || null } })
  } catch (error) {
    console.error('Error in /api/experiment-engine/video-segment:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

