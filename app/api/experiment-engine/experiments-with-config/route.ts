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
    const { data: expEngineData, error: expEngineError } = await supabaseAdmin
      .from('experiment_details')
      .select(`
        experiment_id,
        experiment_name,
        lab_id,
        created_by_user_id,
        additional_contributors_user_ids,
        experiment_status,
        video_progress_seconds,
        created_at,
        updated_at,
        last_saved
      `)
      .eq('lab_id', labId)
      .order('created_at', { ascending: false })

    if (expEngineError) {
      console.error('Error fetching Experiment Engine experiments:', expEngineError)
      return NextResponse.json({ error: expEngineError.message }, { status: 500 })
    }

    if (!expEngineData || expEngineData.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Fetch experiment_config separately
    const experimentIds = expEngineData.map((exp: any) => exp.experiment_id)
    const { data: configData, error: configError } = await supabaseAdmin
      .from('experiment_config')
      .select('experiment_id, feed_type, experiment_objective')
      .in('experiment_id', experimentIds)

    if (configError) {
      console.error('Error fetching experiment config:', configError)
    }

    // Create a map of config by experiment_id
    const configMap: Record<string, any> = {}
    if (configData) {
      configData.forEach((config: any) => {
        if (!configMap[config.experiment_id]) {
          configMap[config.experiment_id] = []
        }
        configMap[config.experiment_id].push(config)
      })
    }

    // Combine data
    const experiments = expEngineData.map((exp: any) => {
      const config = configMap[exp.experiment_id]?.[0]
      return {
        id: exp.experiment_id,
        experiment_id: exp.experiment_id,
        name: exp.experiment_name,
        experiment_name: exp.experiment_name,
        objective: config?.experiment_objective || '',
        experiment_objective: config?.experiment_objective || '',
        status: exp.experiment_status,
        experiment_status: exp.experiment_status,
        created_at: exp.created_at,
        updated_at: exp.updated_at,
        closed_status: exp.experiment_status === 'concluded' ? 'CLOSED' : null,
        is_experiment_engine: true,
        feed_type: config?.feed_type
      }
    })

    return NextResponse.json({ data: experiments })
  } catch (error) {
    console.error('Error in /api/experiment-engine/experiments-with-config:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

