import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET(request: NextRequest) {
  try {
    // Fetch public Experiment Engine experiments
    // Must have: lab is public AND experiment_details.public_private = 'public'
    const { data: expEngineData, error: expEngineError } = await supabaseAdmin
      .from('experiment_details')
      .select(`
        experiment_id,
        experiment_name,
        lab_id,
        created_by_user_id,
        additional_contributors_user_ids,
        experiment_status,
        public_private,
        video_progress_seconds,
        created_at,
        updated_at,
        last_saved
      `)
      .eq('public_private', 'public')
      .order('created_at', { ascending: false })
      .limit(100)

    if (expEngineError) {
      console.error('Error fetching Experiment Engine experiments:', expEngineError)
      return NextResponse.json({ error: expEngineError.message }, { status: 500 })
    }

    if (!expEngineData || expEngineData.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Get unique lab IDs
    const labIds = [...new Set(expEngineData.map((exp: any) => exp.lab_id).filter(Boolean))]
    
    // Fetch lab visibility to ensure labs are public
    const { data: labs, error: labsError } = await supabaseAdmin
      .from('labs')
      .select('labId, public_private, labName, profilePic')
      .in('labId', labIds)

    if (labsError) {
      console.error('Error fetching labs:', labsError)
    }

    // Create a map of public labs
    const publicLabIds = new Set(
      (labs || [])
        .filter((lab: any) => lab.public_private === 'public' || lab.public_private === null)
        .map((lab: any) => lab.labId)
    )

    // Filter experiments to only include those from public labs
    const publicExperiments = expEngineData.filter((exp: any) => 
      publicLabIds.has(exp.lab_id)
    )

    if (publicExperiments.length === 0) {
      return NextResponse.json({ data: [] })
    }

    // Fetch experiment_config separately
    const experimentIds = publicExperiments.map((exp: any) => exp.experiment_id)
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

    // Create a map of lab info
    const labMap: Record<string, any> = {}
    if (labs) {
      labs.forEach((lab: any) => {
        if (publicLabIds.has(lab.labId)) {
          labMap[lab.labId] = {
            name: lab.labName,
            profilePic: lab.profilePic
          }
        }
      })
    }

    // Combine data
    const experiments = publicExperiments.map((exp: any) => {
      const config = configMap[exp.experiment_id]?.[0]
      const labInfo = labMap[exp.lab_id] || {}
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
        feed_type: config?.feed_type,
        lab_id: exp.lab_id,
        labName: labInfo.name,
        labProfilePic: labInfo.profilePic,
        created_by_user_id: exp.created_by_user_id
      }
    })

    return NextResponse.json({ data: experiments })
  } catch (error) {
    console.error('Error in /api/experiment-engine/public-experiments:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

