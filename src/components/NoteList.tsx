import Link from 'next/link';
import styles from '../styles/NoteList.module.css';

export default function NoteList({ notes, loading }: { notes: any[], loading: boolean }) {
  if (loading) return <div>Loading notes…</div>;
  if (!notes.length) return <div>No notes found.</div>;

  return (
    <ul className={styles.list}>
      {notes.map(note => (
        <li key={note.id} className={styles.item}>
          <Link href={`/apps/notes/edit/${note.id}`}>
            <div className={styles.title}>{note.title}</div>
            <div className={styles.meta}>
              <span>{new Date(note.updated_at).toLocaleString()}</span>
              <span className={styles.tags}>{note.tags?.join(', ')}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
