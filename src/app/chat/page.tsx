'use client'

import React, { useState } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoomSidebar from '@/components/RoomSidebar'
import MessageList from '@/components/MessageList'
import ChatBox from '@/components/ChatBox'
import styles from '@/styles/Chat.module.css'

export default function ChatPage() {
  const [roomId, setRoomId] = useState<string>('general')

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <RoomSidebar roomId={roomId} setRoomId={setRoomId} />

        <div className={styles.chatArea}>
          <MessageList roomId={roomId} />
          <ChatBox roomId={roomId} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
