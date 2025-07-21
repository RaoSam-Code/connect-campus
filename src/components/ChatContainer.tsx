'use client'

import React, { useEffect, useRef, useState } from 'react'
import MessageItem, { Message } from '@/components/MessageItem'
import { supabase } from '@/lib/supabaseClient'
import {
  subscribeToTable,
  unsubscribeChannel,
} from '@/lib/realtime'
import styles from '@/styles/Chat.module.css'

interface Props {
  roomId: string
  isPrivate?: boolean
}

export default function ChatContainer({ roomId, isPrivate }: Props) {
  const [currentUserId, setCurrentUserId] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const table = isPrivate ? 'private_messages' : 'messages'
  const userField = isPrivate ? 'sender_id' : 'user_id'
  const roomField = isPrivate ? 'chat_id' : 'room_id'

  // Load session
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user?.id) {
        setCurrentUserId(data.session.user.id)
      }
    })
  }, [])

  // Load initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .eq(roomField, roomId)
        .order('created_at', { ascending: true })

      if (!error) {
        setMessages((data as Message[]) || [])
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    }

    fetchMessages()
  }, [roomId])

  // Realtime: on INSERT
  useEffect(() => {
    const channel = subscribeToTable<Message>(
      {
        table,
        event: 'INSERT',
        filter: `${roomField}=eq.${roomId}`,
      },
      ({ new: newMsg }) => {
        if (!newMsg) return
        setMessages((prev) => [...prev, newMsg as Message])
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
      }
    )

    return () => unsubscribeChannel(channel)
  }, [roomId])

  // Polling every 2 seconds as backup or fallback
  useEffect(() => {
    const interval = setInterval(() => {
      supabase
        .from(table)
        .select('*')
        .eq(roomField, roomId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) {
            const latest = data as Message[]
            const lastPrevId = messages.at(-1)?.id
            const lastNewId = latest.at(-1)?.id
            if (lastNewId !== lastPrevId) {
              setMessages(latest)
              bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
            }
          }
        })
    }, 2000)

    return () => clearInterval(interval)
  }, [roomId, messages])

  // Send message
  const handleSend = async () => {
    const body = text.trim()
    if (!body || !currentUserId) return

    const { data: inserted, error } = await supabase
      .from(table)
      .insert({ [roomField]: roomId, [userField]: currentUserId, content: body })
      .select('*')
      .single()

    if (!error && inserted) {
      setMessages((prev) => [...prev, inserted as Message])
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    setText('')
  }

  return (
    <div className={styles.container}>
      <div className={styles.messageList}>
        {messages.map((m) => (
          <MessageItem key={m.id} message={m} currentUserId={currentUserId} />
        ))}
        <div ref={bottomRef} />
      </div>
      <div className={styles.chatBox}>
        <input
          className={styles.input}
          placeholder="Type a message…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
        />
        <button className={styles.sendButton} onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  )
}
