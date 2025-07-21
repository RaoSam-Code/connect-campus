'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import ChatContainer from '@/components/ChatContainer'

export default function PrivateChatPage() {
  const params = useSearchParams()
  const chatId = params.get('chatId') || ''

  if (!chatId) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <p>No chat selected.</p>
      </div>
    )
  }

  // `isPrivate` switches ChatContainer to use `private_messages` + `sender_id`
  return <ChatContainer roomId={chatId} isPrivate />
}
