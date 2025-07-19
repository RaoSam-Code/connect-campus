'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Message.module.css'

export interface Message {
  id: string
  content: string
  created_at: string
  room_id?: string        // only for group chat
  user_id?: string        // for public/group chat
  chat_id?: string        // only for private chat
  sender_id?: string      // for private chat
}

interface Props {
  message: Message
  currentUserId: string
}

export default function MessageItem({ message, currentUserId }: Props) {
  // pick the right sender field
  const senderId = message.sender_id ?? message.user_id
  const isOwn = senderId === currentUserId

  // state to show name of other person
  const [senderName, setSenderName] = useState('')

  // fetch the username only for non‐own messages
  useEffect(() => {
    if (!isOwn && senderId) {
      supabase
        .from('profiles')
        .select('username')
        .eq('id', senderId)
        .single()
        .then(({ data }) => {
          setSenderName(data?.username ?? 'Unknown')
        })
    }
  }, [isOwn, senderId])

  // format time
  const time = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={`${styles.messageItem} ${isOwn ? styles.ownItem : ''}`}>
      <div className={`${styles.bubble} ${isOwn ? styles.ownBubble : ''}`}>
        {!isOwn && senderName && (
          <div className={styles.sender}>{senderName}</div>
        )}
        {message.content}
      </div>
      <div className={styles.time}>{time}</div>
    </div>
  )
}
