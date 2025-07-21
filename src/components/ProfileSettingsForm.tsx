'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Settings.module.css'

interface Profile {
  id: string
  username: string
  avatar_url: string | null
  is_public: boolean
}

export default function ProfileSettingsForm() {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [username, setUsername] = useState('')
  const [avatarUrl, setAvatarUrl] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)

  // Load current profile
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      const userId = data.session?.user.id
      if (!userId) return

      supabase
        .from('profiles')
        .select('id, username, avatar_url, is_public')
        .eq('id', userId)
        .single()
        .then(({ data, error }) => {
          if (error) {
            console.error(error)
          } else if (data) {
            setProfile(data)
            setUsername(data.username || '')
            setAvatarUrl(data.avatar_url || '')
            setIsPublic(data.is_public)
          }
        })
    })
  }, [])

  // Save updates
  const handleSave = async () => {
    if (!profile) return
    setLoading(true)

    const { error } = await supabase
      .from('profiles')
      .upsert(
        {
          id: profile.id,
          username,
          avatar_url: avatarUrl,
          is_public: isPublic,
        },
        { onConflict: 'id' }
      )

    setLoading(false)

    if (error) {
      console.error(error)
      alert('Error saving profile: ' + error.message)
    } else {
      alert('Profile updated successfully')
    }
  }

  return (
    <div className={styles.container}>
      <h2>Profile Settings</h2>

      <div className={styles.formGroup}>
        <label className={styles.label}>Username</label>
        <input
          className={styles.input}
          type="text"
          value={username}
          disabled={loading}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>Avatar URL</label>
        <input
          className={styles.input}
          type="text"
          value={avatarUrl}
          disabled={loading}
          onChange={(e) => setAvatarUrl(e.target.value)}
        />
      </div>

      <div className={styles.formGroup}>
        <label className={styles.label}>
          <input
            type="checkbox"
            checked={isPublic}
            disabled={loading}
            onChange={(e) => setIsPublic(e.target.checked)}
          />{' '}
          Public Profile
        </label>
      </div>

      <button
        className={styles.button}
        onClick={handleSave}
        disabled={loading}
      >
        {loading ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
