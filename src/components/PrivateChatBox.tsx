'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Chat.module.css'

export default function PrivateChatBox({ chatId }: { chatId: string }) {
  const [text, setText] = useState('')

  const handleSend = async () => {
    if (!text.trim()) return
    const { data } = await supabase.auth.getSession()
    const userId = data.session?.user.id
    if (!userId) return

    await supabase.from('private_messages').insert({
      chat_id: chatId,
      sender_id: userId,
      content: text.trim(),
    })
    setText('')
  }

  return (
    <div className={styles.chatBox}>
      <input
        type="text"
        className={styles.input}
        placeholder="Type a private message…"
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
