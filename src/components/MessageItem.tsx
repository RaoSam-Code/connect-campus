'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Message.module.css'

interface Message {
  id: string
  content: string
  user_id: string
  created_at: string
}

export default function MessageItem({ message }: { message: Message }) {
  const [isOwn, setIsOwn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsOwn(data.session?.user.id === message.user_id)
    })
  }, [message.user_id])

  const ts = new Date(message.created_at).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className={styles.messageItem}>
      <div className={`${styles.content} ${isOwn ? styles.own : ''}`}>
        {message.content}
      </div>
      <span className={styles.timestamp}>{ts}</span>
    </div>
  )
}
