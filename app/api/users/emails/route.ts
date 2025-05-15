import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

// IMPORTANT: The service role key must be kept secret and never exposed to the client!
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: Request) {
  try {
    const { userIds } = await request.json()
    
    if (!userIds || !Array.isArray(userIds)) {
      return NextResponse.json({ error: 'Invalid user IDs' }, { status: 400 })
    }

    // Get emails from auth.users using the admin client
    const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
    
    if (error) {
      console.error('Error fetching users:', error)
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
    }

    // Filter users by the provided IDs and map to just id and email
    const userEmails = users.users
      .filter(user => userIds.includes(user.id))
      .map(user => ({
        id: user.id,
        email: user.email
      }))

    return NextResponse.json({ data: userEmails })
  } catch (error) {
    console.error('Error in /api/users/emails:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 