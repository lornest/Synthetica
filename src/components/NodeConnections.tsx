import { useMemo } from 'react'
import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import { DOMAIN_COLORS } from '@/constants/domains'
import type { Domain } from '@/types'
import styles from './NodeConnections.module.css'

interface Props {
  nodeId: string
}

export default function NodeConnections({ nodeId }: Props) {
  const nodes = useKnowledgeStore((s) => s.nodes)
  const allConnections = useKnowledgeStore((s) => s.connections)
  const selectNode = useKnowledgeStore((s) => s.selectNode)
  const currentNode = nodes.get(nodeId)

  const connections = useMemo(
    () => allConnections.filter((c) => c.source_id === nodeId || c.target_id === nodeId),
    [allConnections, nodeId]
  )

  if (connections.length === 0) {
    return <p className={styles.empty}>No connections yet. Add more nodes to discover relationships!</p>
  }

  return (
    <div className={styles.list}>
      {connections.map((conn, i) => {
        const otherNodeId = conn.source_id === nodeId ? conn.target_id : conn.source_id
        const otherNode = nodes.get(otherNodeId)
        if (!otherNode) return null

        const isXDomain = currentNode && currentNode.domain !== otherNode.domain
        const strengthPct = Math.round(conn.strength * 100)

        return (
          <div
            key={i}
            className={styles.item}
            style={{ borderLeftColor: isXDomain ? '#e53e3e' : DOMAIN_COLORS[otherNode.domain as Domain] || '#718096' }}
            onClick={() => selectNode(otherNode.id)}
          >
            <div className={styles.itemHeader}>
              <strong>{otherNode.title}</strong>
              <span className={styles.strength}>{strengthPct}%</span>
            </div>
            <div className={styles.type}>
              {conn.connection_type.replace(/_/g, ' ')}
              {isXDomain && <span className={styles.xDomainBadge}>Cross-Domain</span>}
            </div>
            <div className={styles.explanation}>{conn.explanation}</div>
            {conn.shared_bridges && conn.shared_bridges.length > 0 && (
              <div className={styles.bridges}>
                Bridges: {conn.shared_bridges.join(', ')}
              </div>
            )}
            <div className={styles.strengthBar}>
              <div className={styles.strengthFill} style={{ width: `${strengthPct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}
