'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import NoteList from '@/components/NoteList';
import TagFilter from '@/components/TagFilter';
import Link from 'next/link';

export default function NotesPage() {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState<string[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let subscription: any;
    const fetchNotes = async () => {
      setLoading(true);
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;
      let query = supabase.from('notes').select('*').eq('user_id', user.id).order('updated_at', { ascending: false });
      if (selectedTags.length > 0) {
        query = query.contains('tags', selectedTags);
      }
      const { data } = await query;
      setNotes(data || []);
      setLoading(false);

      // Subscribe to realtime updates
      subscription = supabase
        .channel('notes-changes')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notes', filter: `user_id=eq.${user.id}` }, payload => {
          fetchNotes();
        })
        .subscribe();
    };
    fetchNotes();
    return () => { if (subscription) supabase.removeChannel(subscription); };
  }, [selectedTags]);

  // Collect all tags for filter
  useEffect(() => {
    const allTags = new Set<string>();
    notes.forEach((n: any) => n.tags?.forEach((t: string) => allTags.add(t)));
    setTags(Array.from(allTags));
  }, [notes]);

  return (
    <div>
      <h1>My Notes</h1>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TagFilter tags={tags} selected={selectedTags} onChange={setSelectedTags} />
        <Link href="/apps/notes/new" className="button">+ New Note</Link>
      </div>
      <NoteList notes={notes} loading={loading} />
    </div>
  );
}
