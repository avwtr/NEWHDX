import { supabase } from "./supabase"

export type SignUpData = {
  email: string
  password: string
  firstName: string
  lastName: string
  researchInterests: string[]
}

export type LoginData = {
  email: string
  password: string
}

export type AuthError = {
  message: string
}

// Sign up a new user
export async function signUp(data: SignUpData) {
  try {
    // First, create the user account with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.firstName,
          last_name: data.lastName,
          research_interests: data.researchInterests,
          full_name: `${data.firstName} ${data.lastName}`,
        },
      },
    })

    if (authError) {
      throw authError
    }

    // Insert into profiles table
    let profileError = null
    if (authData.user) {
      const { error: insertError } = await supabase.from('profiles').insert({
        user_id: authData.user.id,
        username: `${data.firstName}${data.lastName}`,
        research_interests: data.researchInterests,
      })
      if (insertError) {
        profileError = insertError
      }
    }

    return { user: authData.user, session: authData.session, error: profileError }
  } catch (error) {
    console.error("Error signing up:", error)
    return { user: null, session: null, error: error as AuthError }
  }
}

// Log in an existing user
export async function login(data: LoginData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })

    if (authError) {
      return { user: null, session: null, error: authError }
    }

    return { user: authData.user, session: authData.session, error: null }
  } catch (error) {
    console.error("Error logging in:", error)
    return { user: null, session: null, error: error as AuthError }
  }
}

// Log out the current user
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error) {
    console.error("Error logging out:", error)
    return { error: error as AuthError }
  }
}

// Get the current session
export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession()

    if (error) {
      throw error
    }

    return { session: data.session, error: null }
  } catch (error) {
    console.error("Error getting session:", error)
    return { session: null, error: error as AuthError }
  }
}

// Get the current user
export async function getUser() {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) {
      throw error
    }

    return { user, error: null }
  } catch (error) {
    console.error("Error getting user:", error)
    return { user: null, error: error as AuthError }
  }
}
