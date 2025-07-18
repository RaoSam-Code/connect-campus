'use client'

import styles from './Login.module.css'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else window.location.href = '/chat'
  }

  return (
    <div className={styles.container}>
      <input className={styles.input} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className={styles.button} onClick={handleLogin}>Login</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  )
}
