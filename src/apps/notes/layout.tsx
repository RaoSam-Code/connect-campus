import ProtectedRoute from '@/components/ProtectedRoute';

export default function NotesLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  );
}
