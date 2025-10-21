'use client';

import { useRouter } from 'next/navigation';
import NoteEditor from '@/components/NoteEditor';

export default function NewNotePage() {
  const router = useRouter();

  return (
    <div>
      <h1>New Note</h1>
      <NoteEditor
        onSaveSuccess={() => router.push('/apps/notes')}
        initialNote={null}
      />
    </div>
  );
}
