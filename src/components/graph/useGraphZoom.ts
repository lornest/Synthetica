import { useEffect, useRef, useCallback, useState } from 'react'
import { zoom, zoomIdentity, type ZoomBehavior } from 'd3-zoom'
import { select } from 'd3-selection'
import 'd3-transition'

interface ZoomTransform {
  x: number
  y: number
  k: number
}

interface GraphZoomResult {
  transform: ZoomTransform
  svgRef: React.RefObject<SVGSVGElement | null>
  resetZoom: () => void
}

export default function useGraphZoom(): GraphZoomResult {
  const svgRef = useRef<SVGSVGElement | null>(null)
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)
  const [transform, setTransform] = useState<ZoomTransform>({ x: 0, y: 0, k: 1 })

  useEffect(() => {
    if (!svgRef.current) return

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.2, 4])
      .filter((event) => {
        // Don't start zoom/pan when interacting with nodes (circles) or labels (text)
        const tag = (event.target as Element)?.tagName
        if (tag === 'circle' || tag === 'text') return false
        // Allow wheel zoom everywhere, but only pan from background
        return !event.button
      })
      .on('zoom', (event) => {
        setTransform({
          x: event.transform.x,
          y: event.transform.y,
          k: event.transform.k,
        })
      })

    select(svgRef.current).call(zoomBehavior)
    zoomBehaviorRef.current = zoomBehavior

    return () => {
      if (svgRef.current) {
        select(svgRef.current).on('.zoom', null)
      }
    }
  }, [])

  const resetZoom = useCallback(() => {
    if (svgRef.current && zoomBehaviorRef.current) {
      select<SVGSVGElement, unknown>(svgRef.current)
        .transition()
        .duration(500)
        .call(zoomBehaviorRef.current.transform as any, zoomIdentity)
    }
  }, [])

  return { transform, svgRef, resetZoom }
}
