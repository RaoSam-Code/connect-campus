'use client'

import styles from '@/styles/Auth.module.css'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) setError(error.message)
    else router.push('/')
  }

  return (
    <div className={styles.container}>
      <h2>Login</h2>
      <input className={styles.input} type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input className={styles.input} type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button className={styles.button} onClick={handleLogin}>Login</button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
