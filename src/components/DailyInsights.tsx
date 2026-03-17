import { useState, useEffect } from 'react'
import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import styles from './DailyInsights.module.css'

export default function DailyInsights() {
  const nodes = useKnowledgeStore((s) => s.nodes)
  const getCrossDomainInsights = useKnowledgeStore((s) => s.getCrossDomainInsights)
  const selectNode = useKnowledgeStore((s) => s.selectNode)
  const [dismissed, setDismissed] = useState(false)

  const [insights, setInsights] = useState<
    Array<{ source: any; target: any; connection: any }>
  >([])

  useEffect(() => {
    if (nodes.size < 5) return
    try {
      const all = getCrossDomainInsights()
      const top = all.slice(0, 3).map(([source, target, connection]) => ({
        source,
        target,
        connection,
      }))
      setInsights(top)
    } catch {
      // engine not ready yet
    }
  }, [nodes, getCrossDomainInsights])

  if (dismissed || nodes.size < 5 || insights.length === 0) {
    return null
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h3 className={styles.title}>Daily Insights</h3>
          <button className={styles.closeBtn} onClick={() => setDismissed(true)}>
            &times;
          </button>
        </div>
        <p className={styles.subtitle}>Interesting connections in your knowledge garden</p>

        <div className={styles.insightList}>
          {insights.map((insight, i) => (
            <div key={i} className={styles.insight}>
              <div className={styles.insightHeader}>
                <span className={styles.domainTag}>{insight.source.domain}</span>
                <span className={styles.connector}>&harr;</span>
                <span className={styles.domainTag}>{insight.target.domain}</span>
              </div>
              <div className={styles.insightBody}>
                <strong>{insight.source.title}</strong> &amp; <strong>{insight.target.title}</strong>
              </div>
              {insight.connection.shared_bridges?.length > 0 && (
                <div className={styles.bridges}>
                  Bridges: {insight.connection.shared_bridges.join(', ')}
                </div>
              )}
              <div className={styles.strength}>
                {Math.round(insight.connection.strength * 100)}% match
              </div>
              <button
                className={styles.exploreBtn}
                onClick={() => {
                  selectNode(insight.source.id)
                  setDismissed(true)
                }}
              >
                Explore
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
