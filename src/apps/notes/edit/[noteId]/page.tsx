'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import NoteEditor from '@/components/NoteEditor';

export default function EditNotePage() {
  const router = useRouter();
  const params = useParams();
  const noteId = params?.noteId as string;
  const [note, setNote] = useState<any>(null);

  useEffect(() => {
    if (!noteId) return;
    supabase.from('notes').select('*').eq('id', noteId).single().then(({ data }) => setNote(data));
  }, [noteId]);

  if (!note) return <div>Loading...</div>;

  return (
    <div>
      <h1>Edit Note</h1>
      <NoteEditor
        initialNote={note}
        onSaveSuccess={() => router.push('/apps/notes')}
      />
    </div>
  );
}
