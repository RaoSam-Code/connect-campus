'use client'

import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import MessageItem, { Message } from '@/components/MessageItem'
import styles from '@/styles/Chat.module.css'

interface Props {
  roomId: string
  isPrivate?: boolean          // pass true for private chats
}

export default function ChatContainer({ roomId, isPrivate }: Props) {
  const [currentUserId, setCurrentUserId] = useState<string>('')
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const channelRef = useRef<any>(null)
  const [text, setText] = useState('')

  const table = isPrivate ? 'private_messages' : 'messages'
  const userField = isPrivate ? 'sender_id' : 'user_id'

  // Load session, fetch messages, and subscribe
  useEffect(() => {
    // session
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id
      if (id) setCurrentUserId(id)
    })

    // fetch history
    supabase
      .from(table)
      .select('*')
      .eq(isPrivate ? 'chat_id' : 'room_id', roomId)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error('Fetch error', error)
        else setMessages(data as Message[])
        scrollToBottom()
      })

    // realtime
    setupRealtime()

    // re-subscribe on back-online
    window.addEventListener('online', setupRealtime)
    return () => {
      cleanupRealtime()
      window.removeEventListener('online', setupRealtime)
    }
  }, [roomId])

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  function setupRealtime() {
    if (!navigator.onLine) return
    cleanupRealtime()

    channelRef.current = supabase
      .channel(`${table}-${roomId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table,
          filter: `${isPrivate ? 'chat_id' : 'room_id'}=eq.${roomId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message])
          scrollToBottom()
        }
      )
      .subscribe()
  }

  function cleanupRealtime() {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
  }

  async function handleSend() {
    const content = text.trim()
    if (!content || !currentUserId) return

    // insert + return row
    const { data: inserted, error } = await supabase
      .from(table)
      .insert({
        [isPrivate ? 'chat_id' : 'room_id']: roomId,
        [userField]: currentUserId,
        content,
      })
      .select('*')
      .single()

    if (error) {
      console.error('Send error', error)
    } else if (inserted) {
      // optimistic UI
      setMessages((prev) => [...prev, inserted as Message])
      scrollToBottom()
    }
    setText('')
  }

  return (
    <div className={styles.container}>
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
