import useSWR from 'swr'
import { supabase } from '@/lib/supabaseClient'
import type { Message } from '@/types/chat'
import React from 'react'

export function useChatMessages(roomId: string) {
  const key = roomId ? `/messages/${roomId}` : null

  const fetcher = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data as Message[]) || []
  }

  const { data, error, mutate } = useSWR<Message[]>(key, fetcher)

  // subscribe to realtime inserts
  React.useEffect(() => {
    if (!roomId) return
    const channel = supabase
      .channel(`room-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        ({ new: msg }) => {
          mutate((curr = []) => [...curr, msg as Message], false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [roomId, mutate])

  return {
    messages: data,
    isLoading: !error && !data,
    isError: !!error,
    mutate,
  }
}
