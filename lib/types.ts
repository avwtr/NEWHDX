// User role types
export type UserRole = "admin" | "user" | "guest"

// User profile type
export interface UserProfile {
  id: string
  name: string
  role: UserRole
  avatar?: string
  initials: string
}
