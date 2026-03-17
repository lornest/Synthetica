import { useMemo, useState } from 'react'
import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import VersionDiff from './VersionDiff'
import styles from './VersionHistory.module.css'

interface Props {
  nodeId: string
}

const CHANGE_TYPE_COLORS: Record<string, string> = {
  initial: '#48bb78',
  update: '#667eea',
  'branch-update': '#9f7aea',
  merge: '#ed64a6',
}

export default function VersionHistory({ nodeId }: Props) {
  const engine = useKnowledgeStore((s) => s._engine)
  const nodes = useKnowledgeStore((s) => s.nodes)
  const [compareFrom, setCompareFrom] = useState<string | null>(null)
  const [compareTo, setCompareTo] = useState<string | null>(null)

  // Recompute when nodes change (signals the engine state changed)
  const history = useMemo(() => {
    if (!nodes.has(nodeId)) return []
    try {
      const timeline = engine.getNodeEvolution(nodeId)
      return timeline?.versions || []
    } catch {
      return []
    }
  }, [engine, nodes, nodeId])

  if (history.length === 0) {
    return <p className={styles.empty}>No version history</p>
  }

  return (
    <div>
      <div className={styles.timeline}>
        {history.map((version: any, i: number) => {
          const prevVersion = i > 0 ? history[i - 1] : null
          const wordDelta = prevVersion
            ? ((version.metadata?.wordCount ?? 0) - (prevVersion.metadata?.wordCount ?? 0))
            : 0

          return (
            <div key={version.versionId || i} className={styles.item}>
              <div className={styles.dot} style={{ background: CHANGE_TYPE_COLORS[version.changeType] || '#718096' }} />
              <div className={styles.content}>
                <div className={styles.header}>
                  <span
                    className={styles.badge}
                    style={{ background: CHANGE_TYPE_COLORS[version.changeType] || '#718096' }}
                  >
                    {version.changeType}
                  </span>
                  <span className={styles.timestamp}>
                    {version.timestamp ? new Date(version.timestamp).toLocaleString() : ''}
                  </span>
                </div>
                <div className={styles.description}>{version.description || ''}</div>
                {version.metadata && (
                  <div className={styles.meta}>
                    {version.metadata.wordCount ?? 0} words
                    {wordDelta !== 0 && (
                      <span className={wordDelta > 0 ? styles.added : styles.removed}>
                        {wordDelta > 0 ? `+${wordDelta}` : wordDelta}
                      </span>
                    )}
                  </div>
                )}
                {history.length > 1 && (
                  <div className={styles.compareControls}>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name={`compare-from-${nodeId}`}
                        checked={compareFrom === version.versionId}
                        onChange={() => setCompareFrom(version.versionId)}
                      />
                      From
                    </label>
                    <label className={styles.radioLabel}>
                      <input
                        type="radio"
                        name={`compare-to-${nodeId}`}
                        checked={compareTo === version.versionId}
                        onChange={() => setCompareTo(version.versionId)}
                      />
                      To
                    </label>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {compareFrom && compareTo && compareFrom !== compareTo && (
        <VersionDiff nodeId={nodeId} versionId1={compareFrom} versionId2={compareTo} />
      )}
    </div>
  )
}
