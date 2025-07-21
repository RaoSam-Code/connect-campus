'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import styles from '@/styles/Users.module.css'

interface Profile {
  id: string
  username: string
  avatar_url: string | null
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [userId, setUserId] = useState<string>('')
  const [loadingChat, setLoadingChat] = useState<string>('')
  const router = useRouter()

  // 1) Ensure session + get own ID
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const id = data.session?.user.id
      if (!id) return router.push('/login')
      setUserId(id)
    })
  }, [router])

  // 2) Load public profiles
  useEffect(() => {
    if (!userId) return
    supabase
      .from('profiles')
      .select('id, username, avatar_url')
      .eq('is_public', true)
      .neq('id', userId)
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setProfiles(data as Profile[])
      })
  }, [userId])

  // 3) Start or open private chat
  const handleChat = async (otherId: string) => {
    setLoadingChat(otherId)

    const { data: existing } = await supabase
      .from('private_chats')
      .select('id')
      .or(
        `and(user1_id.eq.${userId},user2_id.eq.${otherId}),` +
        `and(user1_id.eq.${otherId},user2_id.eq.${userId})`
      )
      .single()

    let chatId = existing?.id
    if (!chatId) {
      const { data: inserted } = await supabase
        .from('private_chats')
        .insert({ user1_id: userId, user2_id: otherId })
        .select('id')
        .single()
      chatId = inserted?.id
    }

    setLoadingChat('')
    if (chatId) router.push(`/chat/private?chatId=${chatId}`)
  }

  return (
    <div className={styles.container}>
      <h2>Public Users</h2>
      <ul className={styles.list}>
        {profiles.map((p) => (
          <li key={p.id} className={styles.item}>
            {p.avatar_url && (
              <img src={p.avatar_url} alt="" className={styles.avatar} />
            )}
            <span className={styles.name}>{p.username}</span>
            <button
              className={styles.button}
              onClick={() => handleChat(p.id)}
              disabled={loadingChat === p.id}
            >
              {loadingChat === p.id ? 'Loading…' : 'Chat'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
