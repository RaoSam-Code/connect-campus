'use client'

import { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Chat.module.css'

interface PrivateMessage {
  id: string
  chat_id: string
  sender_id: string
  content: string
  created_at: string
}

export default function PrivateMessageList({ chatId }: { chatId: string }) {
  const [msgs, setMsgs] = useState<PrivateMessage[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    supabase
      .from('private_messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })
      .then(({ data }) => data && setMsgs(data as PrivateMessage[]))

    const channel = supabase
      .channel('pm_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          setMsgs((prev) => [...prev, payload.new as PrivateMessage])
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [msgs.length])

  return (
    <div className={styles.messageList}>
      {msgs.map((m) => (
        <div key={m.id} className={styles.messageItem}>
          <div className={styles.content}>{m.content}</div>
          <span className={styles.timestamp}>
            {new Date(m.created_at).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
