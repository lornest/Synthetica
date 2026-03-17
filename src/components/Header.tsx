import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import styles from './Header.module.css'

export default function Header() {
  const stats = useKnowledgeStore((s) => s.stats)

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>
        <span className={styles.logo}>S</span>
        Synthetica
        <span className={styles.badge}>Interactive</span>
      </h1>
      <div className={styles.statsBar}>
        <div className={styles.statItem}>
          <span>Nodes:</span>
          <span className={styles.statNumber}>{stats.total_nodes}</span>
        </div>
        <div className={styles.statItem}>
          <span>Connections:</span>
          <span className={styles.statNumber}>{stats.total_connections}</span>
        </div>
        <div className={styles.statItem}>
          <span>Cross-Domain:</span>
          <span className={styles.statNumber}>{stats.cross_domain_connections}</span>
        </div>
        <div className={styles.statItem}>
          <span>Versions:</span>
          <span className={styles.statNumber}>{stats.total_versions}</span>
        </div>
      </div>
    </header>
  )
}
