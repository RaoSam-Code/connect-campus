// src/components/ProtectedRoute.tsx
'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabaseClient'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // not logged in → redirect
        router.push('/login')
      } else {
        // user is logged in → show protected content
        setLoading(false)
      }
    })
  }, [router])

  if (loading) {
    return <p className="text-center mt-20">Loading...</p>
  }

  return <>{children}</>
}
