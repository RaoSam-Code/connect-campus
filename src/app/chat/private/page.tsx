'use client'

import { useSearchParams } from 'next/navigation'
import ProtectedRoute from '@/components/ProtectedRoute'
import PrivateMessageList from '@/components/PrivateMessageList'
import PrivateChatBox from '@/components/PrivateChatBox'
import styles from '@/styles/Chat.module.css'

export default function PrivateChatPage() {
  const params = useSearchParams()
  const chatId = params.get('chatId')

  if (!chatId) {
    return <p className="text-center mt-20">No chat selected.</p>
  }

  return (
    <ProtectedRoute>
      <div className={styles.container}>
        <div className={styles.chatArea}>
          <PrivateMessageList chatId={chatId} />
          <PrivateChatBox chatId={chatId} />
        </div>
      </div>
    </ProtectedRoute>
  )
}
