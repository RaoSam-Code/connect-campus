import ProtectedRoute from '@/components/ProtectedRoute'
import ClientUserDirectory from '@/components/ClientUserDirectory'

export default function UsersPage() {
  return (
    <ProtectedRoute>
      <ClientUserDirectory />
    </ProtectedRoute>
  )
}
