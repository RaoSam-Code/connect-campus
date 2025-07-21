'use client'

import React, { ReactNode } from 'react'
import ProtectedRoute from '@/components/ProtectedRoute'
import RoomSidebar from '@/components/RoomSidebar'
import styles from '@/styles/ChatLayout.module.css'

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className={styles.wrapper}>
        <RoomSidebar />
        <div className={styles.main}>{children}</div>
      </div>
    </ProtectedRoute>
  )
}
