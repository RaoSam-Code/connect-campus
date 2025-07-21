'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import styles from './home.module.css'
import { supabase } from '@/lib/supabaseClient'
import {
  subscribeToTable,
  unsubscribeChannel,
} from '@/lib/realtime'

export default function HomePage() {
  const [roomsCount, setRoomsCount] = useState(0)
  const [usersCount, setUsersCount] = useState(0)

  // initial counts
  useEffect(() => {
    supabase
      .from('rooms')
      .select('id', { count: 'exact' })
      .eq('is_public', true)
      .then(({ count }) => count !== null && setRoomsCount(count))

    supabase
      .from('profiles')
      .select('id', { count: 'exact' })
      .eq('is_public', true)
      .then(({ count }) => count !== null && setUsersCount(count))
  }, [])

  // realtime updates
  useEffect(() => {
    const rIns = subscribeToTable(
      { table: 'rooms', event: 'INSERT', filter: 'is_public=eq.true' },
      () => setRoomsCount((c) => c + 1)
    )
    const rDel = subscribeToTable(
      { table: 'rooms', event: 'DELETE', filter: 'is_public=eq.true' },
      () => setRoomsCount((c) => c - 1)
    )
    const uIns = subscribeToTable(
      { table: 'profiles', event: 'INSERT', filter: 'is_public=eq.true' },
      () => setUsersCount((u) => u + 1)
    )
    const uDel = subscribeToTable(
      { table: 'profiles', event: 'DELETE', filter: 'is_public=eq.true' },
      () => setUsersCount((u) => u - 1)
    )

    return () => {
      ;[rIns, rDel, uIns, uDel].forEach(unsubscribeChannel)
    }
  }, [])

  return (
    <div className={styles.container}>
      <h1>Campus Connect</h1>
      <p>Public rooms: {roomsCount}</p>
      <p>Public users: {usersCount}</p>
      <div className={styles.actions}>
        <Link href="/login" className={styles.button}>
          Log In
        </Link>
        <Link href="/signup" className={styles.buttonOutline}>
          Sign Up
        </Link>
      </div>
    </div>
  )
}
