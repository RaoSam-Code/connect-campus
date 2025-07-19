'use client'

import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import MessageItem, { Message } from '@/components/MessageItem'
import styles from '@/styles/Chat.module.css'

interface Props {
  roomId: string
  currentUserId: string
}

export default function MessageList({ roomId, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)

  // fetch existing messages
  useEffect(() => {
    supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data as Message[])
      })

    // subscribe to new inserts
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
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      )
      .subscribe()

    return () => void supabase.removeChannel(channel)
  }, [roomId])

  // auto‐scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className={styles.messageList}>
      {messages.map((msg) => (
        <MessageItem
          key={msg.id}
          message={msg}
          currentUserId={currentUserId}
        />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
