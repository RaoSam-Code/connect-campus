'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Users.module.css'
import type { Profile } from '@/types'

interface UserListProps {
  profiles: Profile[]
  currentUserId: string
}

export default function UserList({ profiles, currentUserId }: UserListProps) {
  const router = useRouter()
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const handleChat = async (otherId: string) => {
    setLoadingId(otherId)

    // 1) Look for existing private chat
    const { data: existing } = await supabase
      .from('private_chats')
      .select('id')
      .or(
        `and(user1_id.eq.${currentUserId},user2_id.eq.${otherId}),` +
        `and(user1_id.eq.${otherId},user2_id.eq.${currentUserId})`
      )
      .single()

    let chatId = existing?.id

    // 2) Create one if it doesn't exist
    if (!chatId) {
      const { data: inserted } = await supabase
        .from('private_chats')
        .insert({ user1_id: currentUserId, user2_id: otherId })
        .select('id')
        .single()

      chatId = inserted?.id
    }

    setLoadingId(null)
    if (chatId) {
      router.push(`/chat/private?chatId=${chatId}`)
    }
  }

  return (
    <ul className={styles.list}>
      {profiles.map((p) => (
        <li key={p.id} className={styles.item}>
          {p.avatar_url && (
            <img src={p.avatar_url} alt={p.username} className={styles.avatar} />
          )}
          <span className={styles.name}>{p.username}</span>
          <button
            className={styles.button}
            onClick={() => handleChat(p.id)}
            disabled={loadingId === p.id}
          >
            {loadingId === p.id ? 'Loading…' : 'Chat Now'}
          </button>
        </li>
      ))}
    </ul>
  )
}
