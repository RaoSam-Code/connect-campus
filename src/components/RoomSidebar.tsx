'use client'

import React, { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import styles from '@/styles/RoomSidebar.module.css'

interface Room {
  id: string
  name: string
}

export default function RoomSidebar({
  roomId,
  setRoomId,
}: {
  roomId: string
  setRoomId: (id: string) => void
}) {
  const [rooms, setRooms] = useState<Room[]>([])
  const [newRoomName, setNewRoomName] = useState('')

  useEffect(() => {
    supabase
      .from('rooms')
      .select('*')
      .order('name', { ascending: true })
      .then(({ data }) => {
        if (data) setRooms(data as Room[])
      })
  }, [])

  const handleCreateRoom = async () => {
    if (!newRoomName.trim()) return

    const { data } = await supabase
      .from('rooms')
      .insert({ name: newRoomName })
      .select('*')
      .single()

    if (data) {
      setRooms((prev) => [...prev, data as Room])
      setRoomId((data as Room).id)
      setNewRoomName('')
    }
  }

  return (
    <aside className={styles.sidebar}>
      <h3>Rooms</h3>
      <ul className={styles.roomList}>
        {rooms.map((room) => (
          <li
            key={room.id}
            className={room.id === roomId ? styles.active : ''}
            onClick={() => setRoomId(room.id)}
          >
            {room.name}
          </li>
        ))}
      </ul>

      <div className={styles.newRoom}>
        <input
          type="text"
          placeholder="New room"
          value={newRoomName}
          onChange={(e) => setNewRoomName(e.target.value)}
        />
        <button onClick={handleCreateRoom}>Create</button>
      </div>
    </aside>
  )
}
