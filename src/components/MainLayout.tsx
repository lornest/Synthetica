import { useState } from 'react'
import ControlPanel from './ControlPanel'
import GraphVisualization from './graph/GraphVisualization'
import DetailsPanel from './DetailsPanel'
import styles from './MainLayout.module.css'

type MobileTab = 'graph' | 'add' | 'details'

export default function MainLayout() {
  const [mobileTab, setMobileTab] = useState<MobileTab>('graph')
  const [leftCollapsed, setLeftCollapsed] = useState(false)

  return (
    <>
      <div className={styles.layout}>
        <div className={`${styles.left} ${leftCollapsed ? styles.collapsed : ''}`}>
          <button
            className={styles.collapseBtn}
            onClick={() => setLeftCollapsed(!leftCollapsed)}
            title={leftCollapsed ? 'Expand panel' : 'Collapse panel'}
          >
            {leftCollapsed ? '>' : '<'}
          </button>
          {!leftCollapsed && <ControlPanel />}
        </div>
        <div className={styles.center}>
          <GraphVisualization />
        </div>
        <div className={styles.right}>
          <DetailsPanel />
        </div>
      </div>

      {/* Mobile tab bar */}
      <div className={styles.mobileTabBar}>
        <button
          className={`${styles.mobileTab} ${mobileTab === 'graph' ? styles.active : ''}`}
          onClick={() => setMobileTab('graph')}
        >
          Graph
        </button>
        <button
          className={`${styles.mobileTab} ${mobileTab === 'add' ? styles.active : ''}`}
          onClick={() => setMobileTab('add')}
        >
          Add
        </button>
        <button
          className={`${styles.mobileTab} ${mobileTab === 'details' ? styles.active : ''}`}
          onClick={() => setMobileTab('details')}
        >
          Details
        </button>
      </div>

      {/* Mobile panels */}
      <div className={styles.mobileContent}>
        {mobileTab === 'graph' && (
          <div className={styles.mobileGraph}>
            <GraphVisualization />
          </div>
        )}
        {mobileTab === 'add' && (
          <div className={styles.mobilePanel}>
            <ControlPanel />
          </div>
        )}
        {mobileTab === 'details' && (
          <div className={styles.mobilePanel}>
            <DetailsPanel />
          </div>
        )}
      </div>
    </>
  )
}
