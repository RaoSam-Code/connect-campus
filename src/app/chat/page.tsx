'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import ChatContainer from '@/components/ChatContainer'

export default function ChatPage() {
  const params = useSearchParams()
  const roomId = params.get('roomId') || 'general'
  return <ChatContainer roomId={roomId} />
}
