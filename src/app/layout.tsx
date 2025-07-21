import '@/styles/globals.css'
import Navbar from '@/components/Navbar'
import type { ReactNode } from 'react'

export const metadata = {
  title: 'Campus Connect',
  description: 'Real-time chat & collaboration',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
      </body>
    </html>
  )
}
