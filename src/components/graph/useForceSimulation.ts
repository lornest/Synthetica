import { useEffect, useRef, useState, useCallback } from 'react'
import {
  forceSimulation,
  forceLink,
  forceManyBody,
  forceCenter,
  forceCollide,
  type Simulation,
  type SimulationNodeDatum,
  type SimulationLinkDatum,
} from 'd3-force'
import type { KnowledgeNode, Connection } from '@/types'

export interface GraphNode extends SimulationNodeDatum {
  id: string
  title: string
  domain: string
  connectionCount: number
}

export interface GraphLink extends SimulationLinkDatum<GraphNode> {
  source: string | GraphNode
  target: string | GraphNode
  strength: number
  type: string
  explanation: string
  shared_bridges: string[]
}

interface ForceSimulationResult {
  nodePositions: Map<string, { x: number; y: number }>
  simulationRef: React.MutableRefObject<Simulation<GraphNode, GraphLink> | null>
  reheat: () => void
}

export default function useForceSimulation(
  nodes: Map<string, KnowledgeNode>,
  connections: Connection[],
  width: number,
  height: number
): ForceSimulationResult {
  const simulationRef = useRef<Simulation<GraphNode, GraphLink> | null>(null)
  const [nodePositions, setNodePositions] = useState<Map<string, { x: number; y: number }>>(new Map())
  const tickCount = useRef(0)

  const reheat = useCallback(() => {
    if (simulationRef.current) {
      simulationRef.current.alpha(0.8).restart()
    }
  }, [])

  useEffect(() => {
    // Convert to D3-compatible format
    const graphNodes: GraphNode[] = Array.from(nodes.values()).map((node) => {
      const existing = simulationRef.current?.nodes().find((n) => n.id === node.id)
      return {
        id: node.id,
        title: node.title,
        domain: node.domain,
        connectionCount: connections.filter(
          (c) => c.source_id === node.id || c.target_id === node.id
        ).length,
        // Preserve existing positions
        x: existing?.x ?? width / 2 + (Math.random() - 0.5) * 200,
        y: existing?.y ?? height / 2 + (Math.random() - 0.5) * 200,
        fx: existing?.fx,
        fy: existing?.fy,
      }
    })

    const nodeIds = new Set(graphNodes.map((n) => n.id))
    const graphLinks: GraphLink[] = connections
      .filter((c) => nodeIds.has(c.source_id) && nodeIds.has(c.target_id))
      .map((conn) => ({
        source: conn.source_id,
        target: conn.target_id,
        strength: conn.strength,
        type: conn.connection_type,
        explanation: conn.explanation,
        shared_bridges: conn.shared_bridges || [],
      }))

    // Stop previous simulation
    if (simulationRef.current) {
      simulationRef.current.stop()
    }

    const sim = forceSimulation<GraphNode>(graphNodes)
      .force(
        'link',
        forceLink<GraphNode, GraphLink>(graphLinks)
          .id((d) => d.id)
          .distance(100)
          .strength(0.5)
      )
      .force('charge', forceManyBody<GraphNode>().strength(-250))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide<GraphNode>().radius((d) => getNodeRadius(d) + 8))

    tickCount.current = 0

    sim.on('tick', () => {
      tickCount.current++
      // Throttle React updates to every 2nd tick
      if (tickCount.current % 2 === 0) {
        const positions = new Map<string, { x: number; y: number }>()
        graphNodes.forEach((n) => {
          positions.set(n.id, { x: n.x ?? 0, y: n.y ?? 0 })
        })
        setNodePositions(new Map(positions))
      }
    })

    simulationRef.current = sim

    return () => {
      sim.stop()
    }
  }, [nodes, connections, width, height])

  return { nodePositions, simulationRef, reheat }
}

function getNodeRadius(node: GraphNode): number {
  return 10 + Math.min(8, node.connectionCount * 2)
}
