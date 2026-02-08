import { auth } from "./config"
import type { User } from "firebase/auth"

export async function getCurrentUser(): Promise<User | null> {
  return auth.currentUser
}

// For server components, we'll use the client auth state
// Next.js 13+ with Firebase requires client-side auth check
export async function getUser(): Promise<{ user: User | null; error: Error | null }> {
  try {
    const user = auth.currentUser
    return { user, error: null }
  } catch (error) {
    return { user: null, error: error as Error }
  }
}