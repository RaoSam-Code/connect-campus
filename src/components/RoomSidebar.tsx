'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/Sidebar.module.css'

interface Room {
  id: string
  name: string
}

export default function RoomSidebar() {
  const [rooms, setRooms] = useState<Room[]>([])

  useEffect(() => {
    supabase
      .from('rooms')
      .select('id, name')
      .eq('is_public', true)
      .order('created_at', { ascending: true })
      .then(({ data, error }) => {
        if (error) console.error(error)
        else setRooms(data as Room[])
      })
  }, [])

  return (
    <aside className={styles.sidebar}>
      <h3>Rooms</h3>
      <ul className={styles.list}>
        {rooms.map((r) => (
          <li key={r.id}>
            <Link href={`/chat?roomId=${r.id}`} className={styles.link}>
              {r.name}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  )
}
