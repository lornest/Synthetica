import NodeCreationForm from './NodeCreationForm'
import SearchPanel from './SearchPanel'
import DomainLegend from './DomainLegend'
import styles from './ControlPanel.module.css'

export default function ControlPanel() {
  return (
    <div className={styles.panel}>
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Add Knowledge</h3>
        <NodeCreationForm />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Search</h3>
        <SearchPanel />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Domains</h3>
        <DomainLegend />
      </section>

      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Connection Types</h3>
        <div className={styles.legend}>
          <div className={styles.legendItem}>
            <div className={styles.legendLine} style={{ background: '#e53e3e' }} />
            <span>Cross-Domain Insights</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendLine} style={{ background: '#38a169' }} />
            <span>Metaphorical Bridges</span>
          </div>
          <div className={styles.legendItem}>
            <div className={styles.legendLine} style={{ background: '#a0aec0' }} />
            <span>Regular Connections</span>
          </div>
        </div>
      </section>
    </div>
  )
}
