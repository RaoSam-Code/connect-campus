'use client'

import React, { useEffect, useRef, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import MessageItem from '@/components/MessageItem'
import styles from '@/styles/Chat.module.css'

interface Message {
  id: string
  content: string
  user_id: string
  room_id: string
  created_at: string
}

export default function MessageList({ roomId }: { roomId: string }) {
  const [messages, setMessages] = useState<Message[]>([])
  const bottomRef = useRef<HTMLDivElement>(null)
  const realtimeChannelRef = useRef<any>(null)

  // Fetch the existing messages for this room
  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching messages:', error.message)
    } else {
      setMessages(data as Message[])
    }
  }

  // Set up realtime subscription if online
  const setupRealtime = () => {
    // Skip if offline
    if (typeof window === 'undefined' || !navigator.onLine) {
      console.warn('Offline: skipping realtime subscription')
      return
    }

    // Tear down any existing channel first
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current)
    }

    const channel = supabase
      .channel('messages_channel')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `room_id=eq.${roomId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message
          setMessages((prev) => [...prev, newMsg])
          bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
      )
      .subscribe()

    realtimeChannelRef.current = channel
  }

  // Clean up realtime subscription
  const cleanupRealtime = () => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current)
      realtimeChannelRef.current = null
    }
  }

  // Initial load and subscription setup
  useEffect(() => {
    fetchMessages()
    setupRealtime()

    // Listen for when the browser goes back online
    const handleOnline = () => {
      console.info('Back online: re-subscribing to realtime')
      setupRealtime()
    }
    window.addEventListener('online', handleOnline)

    return () => {
      cleanupRealtime()
      window.removeEventListener('online', handleOnline)
    }
  }, [roomId])

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  return (
    <div className={styles.messageList}>
      {messages.map((msg) => (
        <MessageItem key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}
