'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Users.module.css'
import type { Profile } from '@/types'

export default function ClientUserDirectory() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // 1) Get session client‐side
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id ?? null
      setUserId(id)
      if (!id) {
        router.push('/login')
        return
      }

      // 2) Fetch public profiles (excluding self)
      supabase
        .from('profiles')
        .select('id, username, avatar_url')
        .eq('is_public', true)
        .neq('id', id)
        .then(({ data, error }) => {
          if (error) console.error(error)
          else setProfiles(data as Profile[])
          setLoading(false)
        })
    })
  }, [router])

  if (loading) {
    return <p className="p-4">Loading users…</p>
  }

  return (
    <div className={styles.container}>
      <h2>Public Users</h2>
      <ul className={styles.list}>
        {profiles.map((p) => (
          <li key={p.id} className={styles.item}>
            {p.avatar_url && <img src={p.avatar_url} className={styles.avatar} />}
            <span className={styles.name}>{p.username}</span>
            <ChatNowButton otherId={p.id} currentUserId={userId!} />
          </li>
        ))}
      </ul>
    </div>
  )
}

function ChatNowButton({ otherId, currentUserId }: { otherId: string; currentUserId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleChat = async () => {
    setLoading(true)
    // try to find existing chat
    const { data: existing } = await supabase
      .from('private_chats')
      .select('id')
      .or(
        `and(user1_id.eq.${currentUserId},user2_id.eq.${otherId}),` +
        `and(user1_id.eq.${otherId},user2_id.eq.${currentUserId})`
      )
      .single()

    let chatId = existing?.id
    if (!chatId) {
      // create if missing
      const { data: inserted } = await supabase
        .from('private_chats')
        .insert({ user1_id: currentUserId, user2_id: otherId })
        .select('id')
        .single()
      chatId = inserted?.id
    }
    setLoading(false)
    if (chatId) router.push(`/chat/private?chatId=${chatId}`)
  }

  return (
    <button
      className={styles.button}
      onClick={handleChat}
      disabled={loading}
    >
      {loading ? '…' : 'Chat Now'}
    </button>
  )
}
