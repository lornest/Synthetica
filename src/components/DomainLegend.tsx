import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import { DOMAIN_COLORS, DOMAIN_LABELS } from '@/constants/domains'
import type { Domain } from '@/types'
import styles from './DomainLegend.module.css'

export default function DomainLegend() {
  const stats = useKnowledgeStore((s) => s.stats)

  const domains = Object.entries(stats.domains) as [Domain, number][]
  if (domains.length === 0) {
    return <p className={styles.empty}>No nodes yet</p>
  }

  return (
    <div className={styles.legend}>
      {domains.map(([domain, count]) => (
        <div key={domain} className={styles.item}>
          <div
            className={styles.dot}
            style={{ background: DOMAIN_COLORS[domain] || '#718096' }}
          />
          <span>
            {DOMAIN_LABELS[domain] || domain} ({count})
          </span>
        </div>
      ))}
    </div>
  )
}
