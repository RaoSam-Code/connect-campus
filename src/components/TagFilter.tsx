import styles from '../styles/TagFilter.module.css';

export default function TagFilter({
  tags,
  selected,
  onChange
}: {
  tags: string[],
  selected: string[],
  onChange: (tags: string[]) => void
}) {
  const toggleTag = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag));
    } else {
      onChange([...selected, tag]);
    }
  };

  return (
    <div className={styles.filter}>
      {tags.map(tag => (
        <button
          key={tag}
          className={selected.includes(tag) ? styles.selected : ''}
          onClick={() => toggleTag(tag)}
          type="button"
        >
          {tag}
        </button>
      ))}
    </div>
  );
}
