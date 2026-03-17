import type { GraphNode, GraphLink } from './useForceSimulation'
import { DOMAIN_COLORS } from '@/constants/domains'
import type { Domain } from '@/types'
import styles from './GraphTooltip.module.css'

interface NodeTooltipProps {
  node: GraphNode
  x: number
  y: number
}

interface LinkTooltipProps {
  link: GraphLink
  x: number
  y: number
}

export function NodeTooltip({ node, x, y }: NodeTooltipProps) {
  return (
    <div
      className={styles.tooltip}
      style={{ left: x + 15, top: y - 10 }}
    >
      <div className={styles.title}>{node.title}</div>
      <div className={styles.row}>
        <span
          className={styles.domainDot}
          style={{ background: DOMAIN_COLORS[node.domain as Domain] || '#718096' }}
        />
        <span className={styles.domain}>{node.domain}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Connections:</span>
        <span>{node.connectionCount}</span>
      </div>
    </div>
  )
}

export function LinkTooltip({ link, x, y }: LinkTooltipProps) {
  const source = typeof link.source === 'object' ? link.source : null
  const target = typeof link.target === 'object' ? link.target : null

  return (
    <div
      className={styles.tooltip}
      style={{ left: x + 15, top: y - 10 }}
    >
      <div className={styles.title}>
        {source?.title || '?'} — {target?.title || '?'}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Type:</span>
        <span>{link.type.replace(/_/g, ' ')}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Strength:</span>
        <span>{Math.round(link.strength * 100)}%</span>
      </div>
      {link.shared_bridges.length > 0 && (
        <div className={styles.bridges}>
          Bridges: {link.shared_bridges.join(', ')}
        </div>
      )}
    </div>
  )
}
