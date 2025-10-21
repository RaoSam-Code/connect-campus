'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import dynamic from 'next/dynamic';
import styles from '../styles/NoteEditor.module.css';
import ReactMarkdown from 'react-markdown';

const initialState = { title: '', content: '', tags: [] as string[] };

export default function NoteEditor({ initialNote, onSaveSuccess }: { initialNote: any, onSaveSuccess: () => void }) {
  const [note, setNote] = useState(initialNote || initialState);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: any) => {
    setNote((prev: any) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return setError('Not authenticated');
    let result;
    if (note.id) {
      // Update
      result = await supabase.from('notes').update({
        title: note.title,
        content: note.content,
        tags: note.tags,
        updated_at: new Date().toISOString()
      }).eq('id', note.id);
    } else {
      // Create
      result = await supabase.from('notes').insert({
        user_id: user.id,
        title: note.title,
        content: note.content,
        tags: note.tags,
        updated_at: new Date().toISOString()
      });
    }
    setSaving(false);
    if (result.error) setError(result.error.message);
    else onSaveSuccess();
  };

  return (
    <div className={styles.editor}>
      <input
        className={styles.title}
        placeholder="Title"
        value={note.title}
        onChange={e => handleChange('title', e.target.value)}
        disabled={saving}
      />
      <textarea
        className={styles.textarea}
        placeholder="Write your note in Markdown…"
        value={note.content}
        onChange={e => handleChange('content', e.target.value)}
        rows={10}
        disabled={saving}
      />
      <input
        className={styles.tags}
        placeholder="Tags (comma separated)"
        value={note.tags.join(', ')}
        onChange={e => handleChange('tags', e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean))}
        disabled={saving}
      />
      <button className={styles.saveButton} onClick={handleSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save'}
      </button>
      {error && <div className={styles.error}>{error}</div>}
      <div className={styles.preview}>
        <h3>Preview</h3>
        <ReactMarkdown>{note.content}</ReactMarkdown>
      </div>
    </div>
  );
}
