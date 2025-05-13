import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
  try {
    const { activity_name, activity_type, performed_by, lab_from } = await request.json()

    if (!activity_name || !activity_type || !performed_by || !lab_from) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('activity')
      .insert({
        activity_id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        activity_name,
        activity_type,
        performed_by,
        lab_from
      })
      .select()
      .single()

    if (error) {
      console.error('Error logging activity:', error)
      return NextResponse.json(
        { error: 'Failed to log activity' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in log-activity route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 