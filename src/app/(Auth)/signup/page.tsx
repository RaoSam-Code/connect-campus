'use client'

import { useState } from 'react'
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

    // 1) Sign up the user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    const userId = signUpData.user?.id
    if (!userId) {
      setError('No user ID returned from signup.')
      return
    }

    // 2) Create their profile row
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        username: email.split('@')[0], // default username
        is_public: true,               // make them public by default
      })

    if (profileError) {
      console.error('Error creating profile:', profileError)
      // you can still proceed to login, or surface an error
    }

    // 3) Redirect to login (or chat)  
    router.push('/login')
  }

  return (
    <div className={styles.container}>
      <h2>Sign Up</h2>
      <input
        className={styles.input}
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        className={styles.input}
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className={styles.button} onClick={handleSignup}>
        Sign Up
      </button>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  )
}
