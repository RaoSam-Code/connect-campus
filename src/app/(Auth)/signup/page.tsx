'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Auth.module.css'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignup = async () => {
    setError(null)
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const userId = data.user?.id
    if (userId) {
      // Create profile row with default username + public visibility
      const defaultName = email.split('@')[0]
      await supabase
        .from('profiles')
        .insert({ id: userId, username: defaultName, is_public: true })
      router.push('/settings')
    }
  }

  return (
    <div className={styles.container}>
      <h2>Sign Up</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className={styles.input}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={styles.input}
      />
      <button onClick={handleSignup} className={styles.button}>
        Create Account
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
