'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default function HomePage() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        setLoggedIn(true)
      }
    })
  }, [])

  return (
    <>
      <Navbar />
      <main style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>Campus Connect</h1>
        <p>Your hub for chat, study, and collaboration!</p>

        {loggedIn ? (
          <>
            <p style={{ marginTop: '1rem' }}>Welcome back! 🎉</p>
            <Link href="/chat">
              <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#0070f3', color: '#fff', borderRadius: '4px' }}>
                Go to Chat
              </button>
            </Link>
          </>
        ) : (
          <>
            <p style={{ marginTop: '1rem' }}>Sign up or log in to continue with chat features.</p>
            <Link href="/login">
              <button style={{ marginTop: '1rem', marginRight: '1rem', padding: '0.5rem 1rem', background: '#0070f3', color: '#fff', borderRadius: '4px' }}>
                Log In
              </button>
            </Link>
            <Link href="/signup">
              <button style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#28a745', color: '#fff', borderRadius: '4px' }}>
                Sign Up
              </button>
            </Link>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}
