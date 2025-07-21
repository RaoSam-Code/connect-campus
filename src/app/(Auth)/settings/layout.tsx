'use client'

import ProtectedRoute from '@/components/ProtectedRoute'
import { ReactNode } from 'react'

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return <ProtectedRoute>{children}</ProtectedRoute>
}
