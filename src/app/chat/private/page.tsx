'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import ChatContainer from '@/components/ChatContainer'

export default function PrivateChatPage() {
  const params = useSearchParams()
  const chatId = params.get('chatId') ?? 'general'
  return <ChatContainer roomId={chatId} />
}
