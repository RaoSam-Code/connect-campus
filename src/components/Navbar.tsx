'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'
import styles from '@/styles/Navbar.module.css'

export default function Navbar() {
  const router = useRouter()
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setLoggedIn(!!data.session)
    })
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.refresh()
    router.push('/login')
  }

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.link}>Home</Link>
      {loggedIn && (
        <>
          <Link href="/chat" className={styles.link}>Chat</Link>
          <Link href="/users" className={styles.link}>Users</Link>
          <Link href="/settings" className={styles.link}>Settings</Link>
          <button className={styles.button} onClick={handleSignOut}>
            Sign Out
          </button>
        </>
      )}
      {!loggedIn && (
        <>
          <Link href="/login" className={styles.link}>Login</Link>
          <Link href="/signup" className={styles.link}>Signup</Link>
        </>
      )}
    </nav>
  )
}
