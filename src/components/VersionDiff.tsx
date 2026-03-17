import { useMemo } from 'react'
import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import styles from './VersionDiff.module.css'

interface Props {
  nodeId: string
  versionId1: string
  versionId2: string
}

export default function VersionDiff({ nodeId, versionId1, versionId2 }: Props) {
  const engine = useKnowledgeStore((s) => s._engine)
  const updateNode = useKnowledgeStore((s) => s.updateNode)

  const diff = useMemo(() => {
    try {
      return engine.compareNodeVersions(nodeId, versionId1, versionId2)
    } catch {
      return null
    }
  }, [engine, nodeId, versionId1, versionId2])

  if (!diff) {
    return <p className={styles.empty}>Could not compute diff</p>
  }

  const { differences, version1, version2 } = diff
  const fields = Object.keys(differences)

  const handleRestore = (versionId: string) => {
    const version = versionId === versionId1 ? version1 : version2
    if (!version?.nodeState) return
    const { title, content, domain, tags } = version.nodeState
    updateNode(nodeId, { title, content, domain, tags }, `Restored to version ${versionId.substring(0, 8)}`)
  }

  if (fields.length === 0) {
    return <p className={styles.empty}>No differences between these versions</p>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.label}>Comparing</span>
        <span className={styles.versionTag}>{versionId1.substring(0, 10)}</span>
        <span className={styles.arrow}>&rarr;</span>
        <span className={styles.versionTag}>{versionId2.substring(0, 10)}</span>
      </div>

      {fields.map((field) => {
        const { from, to } = differences[field]
        const fromStr = Array.isArray(from) ? from.join(', ') : String(from ?? '')
        const toStr = Array.isArray(to) ? to.join(', ') : String(to ?? '')

        return (
          <div key={field} className={styles.fieldDiff}>
            <div className={styles.fieldName}>{field}</div>
            <div className={styles.diffRow}>
              <div className={styles.removed}>{fromStr || '(empty)'}</div>
              <div className={styles.added}>{toStr || '(empty)'}</div>
            </div>
          </div>
        )
      })}

      <div className={styles.actions}>
        <button
          className={styles.restoreBtn}
          onClick={() => handleRestore(versionId1)}
        >
          Restore older version
        </button>
      </div>
    </div>
  )
}
