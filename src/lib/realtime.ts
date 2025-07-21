// src/lib/realtime.ts

import { supabase } from './supabaseClient'
import type {
  RealtimeChannel,
  RealtimePostgresChangesPayload,
} from '@supabase/supabase-js'

export interface SubscribeOpts {
  table: string
  event: 'INSERT' | 'UPDATE' | 'DELETE'
  filter?: string
  schema?: string
}

/**
 * Subscribe to Postgres changes using Supabase's Realtime API
 */
export function subscribeToTable<T extends Record<string, any>>(
  opts: SubscribeOpts,
  handler: (payload: RealtimePostgresChangesPayload<T>) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`${opts.table}-${opts.event}`)
    .on(
      'postgres_changes',
      {
        event: opts.event,
        schema: opts.schema ?? 'public',
        table: opts.table,
        filter: opts.filter,
      } as any, // Cast to any to bypass type error if needed
      handler
    )
    .subscribe()

  return channel
}

/** Unsubscribe a realtime channel */
export function unsubscribeChannel(channel: RealtimeChannel) {
  supabase.removeChannel(channel)
}
