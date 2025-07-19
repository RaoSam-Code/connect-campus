'use client'

import styles from '@/styles/Navbar.module.css'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { useEffect, useState } from 'react'

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
    router.refresh()   // 🔄 Refresh App Router state
    router.push('/login')  // ⛳ Redirect to login page
  }

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.link}>Home</Link>
      {!loggedIn && (
        <>
          <Link href="/login" className={styles.link}>Login</Link>
          <Link href="/signup" className={styles.link}>Signup</Link>
        </>
      )}
      {loggedIn && (
        <button className={styles.button} onClick={handleSignOut}>
          Sign Out
        </button>
      )}
    </nav>
  )
}
