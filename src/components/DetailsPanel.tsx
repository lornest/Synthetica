import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import ErrorBoundary from './ErrorBoundary'
import NodeDetails from './NodeDetails'
import NodeConnections from './NodeConnections'
import VersionHistory from './VersionHistory'
import SynthesisOpportunities from './SynthesisOpportunities'
import styles from './DetailsPanel.module.css'

export default function DetailsPanel() {
  const selectedNodeId = useKnowledgeStore((s) => s.selectedNodeId)
  const nodes = useKnowledgeStore((s) => s.nodes)
  const node = selectedNodeId ? nodes.get(selectedNodeId) : null

  if (!node) {
    return (
      <div className={styles.panel}>
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Node Details</h3>
          <p className={styles.placeholder}>
            Click on a node to explore its content, connections, and version history.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.panel}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Node Details</h3>
        <ErrorBoundary>
          <NodeDetails node={node} />
        </ErrorBoundary>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Connections</h3>
        <ErrorBoundary>
          <NodeConnections nodeId={node.id} />
        </ErrorBoundary>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Version History</h3>
        <ErrorBoundary>
          <VersionHistory nodeId={node.id} />
        </ErrorBoundary>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Synthesis Opportunities</h3>
        <ErrorBoundary>
          <SynthesisOpportunities nodeId={node.id} />
        </ErrorBoundary>
      </div>
    </div>
  )
}
