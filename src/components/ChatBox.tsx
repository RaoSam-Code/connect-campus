'use client'

import React, { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Chat.module.css'

export default function ChatBox({ roomId }: { roomId: string }) {
  const [text, setText] = useState('')

  const handleSend = async () => {
    if (!text.trim()) return
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) return

    await supabase.from('messages').insert({
      content: text,
      room_id: roomId,
      user_id: session.user.id,
    })
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
