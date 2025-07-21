import { supabase } from './supabaseClient'
import type { Session, User, AuthChangeEvent, AuthError } from '@supabase/supabase-js'

/** Returns the current session, or null if none. */
export async function getSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession()
  return data.session
}

/** Sign in with email & password. */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  return { user: data.user, error }
}

/** Sign up with email & password. */
export async function signUpWithPassword(
  email: string,
  password: string
): Promise<{ user: User | null; error: AuthError | null }> {
  const { data, error } = await supabase.auth.signUp({ email, password })
  return { user: data.user, error }
}

/** Sign out the current user. */
export async function signOut(): Promise<void> {
  await supabase.auth.signOut()
}

/**
 * Listen to auth state changes (SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED…).
 * Returns an unsubscribe function.
 */
export function onAuthStateChange(
  callback: (event: AuthChangeEvent, session: Session | null) => void
) {
  const { data: sub } = supabase.auth.onAuthStateChange(callback)
  return () => sub.subscription.unsubscribe()
}
