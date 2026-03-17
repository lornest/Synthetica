import { useRef, useState, useCallback, useEffect, useMemo } from 'react'
import { useKnowledgeStore } from '@/store/useKnowledgeStore'
import { DOMAIN_COLORS } from '@/constants/domains'
import type { Domain } from '@/types'
import useForceSimulation, { type GraphNode, type GraphLink } from './useForceSimulation'
import useGraphZoom from './useGraphZoom'
import { NodeTooltip, LinkTooltip } from './GraphTooltip'
import styles from './GraphVisualization.module.css'

export default function GraphVisualization() {
  const nodes = useKnowledgeStore((s) => s.nodes)
  const connections = useKnowledgeStore((s) => s.connections)
  const selectedNodeId = useKnowledgeStore((s) => s.selectedNodeId)
  const selectNode = useKnowledgeStore((s) => s.selectNode)
  const highlightedNodeIds = useKnowledgeStore((s) => s.highlightedNodeIds)
  const searchQuery = useKnowledgeStore((s) => s.searchQuery)
  const importData = useKnowledgeStore((s) => s.importData)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const containerRef = useRef<HTMLDivElement>(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Tooltip state
  const [hoveredNode, setHoveredNode] = useState<{ node: GraphNode; x: number; y: number } | null>(null)
  const [hoveredLink, setHoveredLink] = useState<{ link: GraphLink; x: number; y: number } | null>(null)

  // Drag state — all tracked via refs to avoid stale closures across mousedown/move/up/click
  const [isDragging, setIsDragging] = useState(false) // only for cursor style + tooltip suppression
  const pendingNodeRef = useRef<string | null>(null) // which node had mousedown
  const didMoveRef = useRef(false) // did the mouse actually move?
  const dragStartedRef = useRef(false) // did we start the simulation drag?

  // Measure container
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setDimensions({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const { nodePositions, simulationRef } = useForceSimulation(
    nodes, connections, dimensions.width, dimensions.height
  )
  const { transform, svgRef, resetZoom } = useGraphZoom()

  // Build link data for rendering
  const graphLinks: GraphLink[] = useMemo(() =>
    connections
      .filter((c) => nodes.has(c.source_id) && nodes.has(c.target_id))
      .map((c) => ({
        source: c.source_id,
        target: c.target_id,
        strength: c.strength,
        type: c.connection_type,
        explanation: c.explanation,
        shared_bridges: c.shared_bridges || [],
      })),
    [connections, nodes]
  )

  // Build node data for rendering
  const graphNodes: GraphNode[] = useMemo(() =>
    Array.from(nodes.values()).map((node) => ({
      id: node.id,
      title: node.title,
      domain: node.domain,
      connectionCount: connections.filter(
        (c) => c.source_id === node.id || c.target_id === node.id
      ).length,
    })),
    [nodes, connections]
  )

  const getNodeRadius = (node: GraphNode) => 10 + Math.min(8, node.connectionCount * 2)

  const getLinkColor = (link: GraphLink) => {
    if (link.type.includes('cross_domain')) return '#e53e3e'
    if (link.shared_bridges && link.shared_bridges.length > 0) return '#38a169'
    return '#a0aec0'
  }

  const isSearchActive = searchQuery.trim().length > 0

  const isNodeDimmed = (nodeId: string) => {
    // Search highlighting takes priority
    if (isSearchActive) {
      return !highlightedNodeIds.has(nodeId)
    }
    if (!selectedNodeId) return false
    if (nodeId === selectedNodeId) return false
    return !connections.some(
      (c) =>
        (c.source_id === selectedNodeId && c.target_id === nodeId) ||
        (c.target_id === selectedNodeId && c.source_id === nodeId)
    )
  }

  const isNodeHighlighted = (nodeId: string) => {
    return isSearchActive && highlightedNodeIds.has(nodeId)
  }

  const isLinkDimmed = (link: GraphLink) => {
    if (!selectedNodeId) return false
    const src = typeof link.source === 'string' ? link.source : link.source.id
    const tgt = typeof link.target === 'string' ? link.target : link.target.id
    return src !== selectedNodeId && tgt !== selectedNodeId
  }

  // ---- Interaction handlers ----

  // mousedown on a node: just record which node, don't touch the simulation yet
  const handleMouseDown = useCallback((nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    pendingNodeRef.current = nodeId
    didMoveRef.current = false
    dragStartedRef.current = false
  }, [])

  // mousemove on SVG: if we have a pending node and moved, START drag
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const nodeId = pendingNodeRef.current
    if (!nodeId) return

    const sim = simulationRef.current
    if (!sim || !svgRef.current) return

    // First movement: start the drag
    if (!dragStartedRef.current) {
      dragStartedRef.current = true
      didMoveRef.current = true
      setIsDragging(true)
      sim.alphaTarget(0.3).restart()
      const simNode = sim.nodes().find((n) => n.id === nodeId)
      if (simNode) {
        simNode.fx = simNode.x
        simNode.fy = simNode.y
      }
    }

    // Update position
    const svg = svgRef.current
    const rect = svg.getBoundingClientRect()
    const x = (e.clientX - rect.left - transform.x) / transform.k
    const y = (e.clientY - rect.top - transform.y) / transform.k
    const simNode = sim.nodes().find((n) => n.id === nodeId)
    if (simNode) {
      simNode.fx = x
      simNode.fy = y
    }
  }, [simulationRef, svgRef, transform])

  // mouseup: end drag if we were dragging
  const handleMouseUp = useCallback(() => {
    const nodeId = pendingNodeRef.current
    if (nodeId && dragStartedRef.current && simulationRef.current) {
      simulationRef.current.alphaTarget(0)
      const simNode = simulationRef.current.nodes().find((n) => n.id === nodeId)
      if (simNode) {
        simNode.fx = null
        simNode.fy = null
      }
    }
    pendingNodeRef.current = null
    dragStartedRef.current = false
    setIsDragging(false)
  }, [simulationRef])

  // click on a node: only fires if mouse didn't move (pure click, no drag)
  const handleNodeClick = useCallback((nodeId: string) => {
    if (didMoveRef.current) return
    selectNode(selectedNodeId === nodeId ? null : nodeId)
  }, [selectNode, selectedNodeId])

  const handleExport = () => {
    const data = useKnowledgeStore.getState()._engine.exportData()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `synthetica-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) {
      document.exitFullscreen()
    } else {
      el.requestFullscreen()
    }
  }

  const handleImport = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      if (text) importData(text)
    }
    reader.readAsText(file)
    // Reset so the same file can be re-imported
    e.target.value = ''
  }

  const isEmpty = nodes.size === 0

  return (
    <div ref={containerRef} className={styles.container}>
      {/* Canvas controls */}
      <div className={styles.controls}>
        <button className={styles.controlBtn} onClick={resetZoom} title="Reset View">H</button>
        <button className={styles.controlBtn} onClick={handleFullscreen} title="Fullscreen">F</button>
        <button className={styles.controlBtn} onClick={handleExport} title="Export">E</button>
        <button className={styles.controlBtn} onClick={handleImport} title="Import">I</button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {isEmpty ? (
        <div className={styles.welcome}>
          <h3>Welcome to Your Knowledge Garden</h3>
          <p>Add multi-format knowledge nodes and watch AI discover amazing connections!</p>
          <p className={styles.welcomeSub}>
            Supporting text, markdown, code, links, images, and audio with
            advanced version control and cross-domain AI discovery.
          </p>
        </div>
      ) : (
        <>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className={styles.svg}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <g transform={`translate(${transform.x},${transform.y}) scale(${transform.k})`}>
              {/* Links */}
              {graphLinks.map((link, i) => {
                const sourceId = typeof link.source === 'string' ? link.source : link.source.id
                const targetId = typeof link.target === 'string' ? link.target : link.target.id
                const sourcePos = nodePositions.get(sourceId)
                const targetPos = nodePositions.get(targetId)
                if (!sourcePos || !targetPos) return null

                return (
                  <line
                    key={`link-${i}`}
                    x1={sourcePos.x}
                    y1={sourcePos.y}
                    x2={targetPos.x}
                    y2={targetPos.y}
                    stroke={getLinkColor(link)}
                    strokeWidth={Math.max(1, link.strength * 4)}
                    strokeDasharray={link.type.includes('cross_domain') ? '5,5' : undefined}
                    opacity={isLinkDimmed(link) ? 0.1 : 0.6}
                    onMouseEnter={(e) => {
                      const rect = containerRef.current?.getBoundingClientRect()
                      if (rect) {
                        setHoveredLink({ link, x: e.clientX - rect.left, y: e.clientY - rect.top })
                      }
                    }}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{ cursor: 'pointer' }}
                  />
                )
              })}

              {/* Nodes */}
              {graphNodes.map((node) => {
                const pos = nodePositions.get(node.id)
                if (!pos) return null

                const radius = getNodeRadius(node)
                const dimmed = isNodeDimmed(node.id)
                const highlighted = isNodeHighlighted(node.id)
                const isSelected = node.id === selectedNodeId
                const color = DOMAIN_COLORS[node.domain as Domain] || '#718096'

                return (
                  <g key={node.id}>
                    {highlighted && (
                      <circle
                        cx={pos.x}
                        cy={pos.y}
                        r={radius + 6}
                        fill="none"
                        stroke={color}
                        strokeWidth={3}
                        opacity={0.6}
                        className={styles.searchGlow}
                      />
                    )}
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={radius}
                      fill={color}
                      stroke={isSelected ? '#2d3748' : highlighted ? color : '#fff'}
                      strokeWidth={isSelected ? 3 : highlighted ? 2.5 : 2}
                      opacity={dimmed ? 0.15 : 1}
                      style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
                      onMouseDown={(e) => handleMouseDown(node.id, e)}
                      onClick={() => handleNodeClick(node.id)}
                      onMouseEnter={(e) => {
                        if (!isDragging) {
                          const rect = containerRef.current?.getBoundingClientRect()
                          if (rect) {
                            setHoveredNode({ node, x: e.clientX - rect.left, y: e.clientY - rect.top })
                          }
                        }
                      }}
                      onMouseLeave={() => setHoveredNode(null)}
                    />
                    <text
                      x={pos.x}
                      y={pos.y + radius + 14}
                      textAnchor="middle"
                      fontSize="11"
                      fontWeight="500"
                      fill="#4a5568"
                      opacity={dimmed ? 0.3 : 1}
                      style={{ pointerEvents: 'none', userSelect: 'none' }}
                    >
                      {node.title.length > 20 ? node.title.substring(0, 18) + '...' : node.title}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>

          {/* Tooltips */}
          {hoveredNode && !isDragging && (
            <NodeTooltip node={hoveredNode.node} x={hoveredNode.x} y={hoveredNode.y} />
          )}
          {hoveredLink && !isDragging && (
            <LinkTooltip link={hoveredLink.link} x={hoveredLink.x} y={hoveredLink.y} />
          )}
        </>
      )}
    </div>
  )
}
