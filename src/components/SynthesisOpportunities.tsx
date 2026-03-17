import { useMemo } from 'react'
import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import type { NovelCombination } from '@/types'
import styles from './SynthesisOpportunities.module.css'

interface Props {
  nodeId: string
}

export default function SynthesisOpportunities({ nodeId }: Props) {
  const nodes = useKnowledgeStore((s) => s.nodes)
  const allConnections = useKnowledgeStore((s) => s.connections)
  const getNovelCombinations = useKnowledgeStore((s) => s.getNovelCombinations)
  const selectNode = useKnowledgeStore((s) => s.selectNode)
  const currentNode = nodes.get(nodeId)

  const crossDomainConnections = useMemo(() => {
    if (!currentNode) return []
    const nodeConns = allConnections.filter((c) => c.source_id === nodeId || c.target_id === nodeId)
    return nodeConns.filter((conn) => {
      const otherNodeId = conn.source_id === nodeId ? conn.target_id : conn.source_id
      const otherNode = nodes.get(otherNodeId)
      return otherNode && otherNode.domain !== currentNode.domain
    })
  }, [allConnections, nodes, nodeId, currentNode])

  const novelCombinations = useMemo<NovelCombination[]>(() => {
    if (!currentNode) return []
    try {
      return getNovelCombinations(nodeId)
    } catch {
      return []
    }
  }, [currentNode, nodeId, getNovelCombinations])

  if (!currentNode) return null

  const hasContent = crossDomainConnections.length > 0 || novelCombinations.length > 0

  if (!hasContent) {
    return (
      <p className={styles.empty}>
        Add nodes from different domains to discover synthesis opportunities!
      </p>
    )
  }

  return (
    <div className={styles.list}>
      {crossDomainConnections.map((conn, i) => {
        const otherNodeId = conn.source_id === nodeId ? conn.target_id : conn.source_id
        const otherNode = nodes.get(otherNodeId)
        if (!otherNode) return null

        return (
          <div key={`cross-${i}`} className={styles.card}>
            <div className={styles.cardTitle}>
              {currentNode.domain} x {otherNode.domain} Synthesis
            </div>
            <div className={styles.question}>
              <strong>Research Question:</strong> How might {otherNode.domain} principles
              enhance {currentNode.domain} approaches?
            </div>
            <div className={styles.bridges}>
              <strong>Key Bridges:</strong>{' '}
              {conn.shared_bridges?.join(', ') || 'Pattern similarity'}
            </div>
            <div className={styles.potential}>
              <strong>Potential:</strong> {Math.round(conn.strength * 100)}% match suggests
              strong synthesis opportunities
            </div>
          </div>
        )
      })}

      {novelCombinations.length > 0 && (
        <>
          <div className={styles.sectionTitle}>Novel Combinations</div>
          {novelCombinations.map((combo, i) => (
            <div
              key={`novel-${i}`}
              className={styles.novelCard}
              onClick={() => selectNode(combo.combination.id)}
            >
              <div className={styles.cardTitle}>
                {combo.combination.title}
              </div>
              <div className={styles.bridges}>
                <strong>Shared Bridges:</strong> {combo.bridges.join(', ')}
              </div>
              <div className={styles.potential}>
                <strong>Novelty:</strong> {Math.round(combo.novelty * 100)}%
              </div>
              <div className={styles.reasoning}>{combo.reasoning}</div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
