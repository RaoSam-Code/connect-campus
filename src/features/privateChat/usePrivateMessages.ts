import useSWR from 'swr'
import { supabase } from '@/lib/supabaseClient'
import type { PrivateMessage } from '@/types/privateChat'
import React from 'react'

export function usePrivateMessages(chatId: string) {
  const key = chatId ? `/private-messages/${chatId}` : null

  const fetcher = async () => {
    const { data, error } = await supabase
      .from('private_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    if (error) throw error
    return (data as PrivateMessage[]) || []
  }

  const { data, error, mutate } = useSWR<PrivateMessage[]>(key, fetcher)

  React.useEffect(() => {
    if (!chatId) return
    const channel = supabase
      .channel(`pm-${chatId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        ({ new: msg }) => {
          mutate((curr = []) => [...curr, msg as PrivateMessage], false)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId, mutate])

  return {
    messages: data,
    isLoading: !error && !data,
    isError: !!error,
    mutate,
  }
}
