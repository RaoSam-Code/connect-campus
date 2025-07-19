'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Chat.module.css'

interface Props {
  chatId: string
  onMessageSent: (msg: {
    id: string
    chat_id: string
    sender_id: string
    content: string
    created_at: string
  }) => void
}

export default function PrivateChatBox({ chatId, onMessageSent }: Props) {
  const [text, setText] = useState('')

  const handleSend = async () => {
    if (!text.trim()) return
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return

    // insert and pull back the inserted row
    const { data: inserted } = await supabase
      .from('private_messages')
      .insert({
        chat_id: chatId,
        sender_id: session.user.id,
        content: text.trim(),
      })
      .select()
      .single()

    if (inserted) {
      onMessageSent(inserted as any)
    }

    setText('')
  }

  return (
    <div className={styles.chatBox}>
      <input
        className={styles.input}
        type="text"
        placeholder="Type a message…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
      />
      <button className={styles.sendButton} onClick={handleSend}>
        Send
      </button>
    </div>
  )
}
