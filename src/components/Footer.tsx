import styles from '@/styles/Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>&copy; {new Date().getFullYear()} Campus Connect. All rights reserved.</p>
    </footer>
  )
}
