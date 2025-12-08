"use client"

import * as React from "react"
import { createMap } from "svg-dotted-map"
import { cn } from "@/lib/utils"

interface Marker {
  lat: number
  lng: number
  size?: number
  label?: string
  count?: number
}

export interface DottedMapProps extends React.SVGProps<SVGSVGElement> {
  width?: number
  height?: number
  mapSamples?: number
  markers?: Marker[]
  markerColor?: string
  dotRadius?: number
  stagger?: boolean
}

export function DottedMap({
  width = 150,
  height = 75,
  mapSamples = 5000,
  markers = [],
  markerColor = "#10b981",
  dotRadius = 0.2,
  stagger = true,
  className,
  style,
}: DottedMapProps) {
  // Create map data
  const { points, processedMarkers, xStep, yToRowIndex } = React.useMemo(() => {
    const mapData = createMap({ width, height, mapSamples })
    const pts = mapData.points
    const processed = mapData.addMarkers(markers)

    // Compute stagger helpers
    const sorted = [...pts].sort((a, b) => a.y - b.y || a.x - b.x)
    const rowMap = new Map<number, number>()
    let step = 0
    let prevY = Number.NaN
    let prevXInRow = Number.NaN

    for (const p of sorted) {
      if (p.y !== prevY) {
        prevY = p.y
        prevXInRow = Number.NaN
        if (!rowMap.has(p.y)) rowMap.set(p.y, rowMap.size)
      }
      if (!Number.isNaN(prevXInRow)) {
        const delta = p.x - prevXInRow
        if (delta > 0) step = step === 0 ? delta : Math.min(step, delta)
      }
      prevXInRow = p.x
    }

    return {
      points: pts,
      processedMarkers: processed,
      xStep: step || 1,
      yToRowIndex: rowMap,
    }
  }, [width, height, mapSamples, markers])

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("text-zinc-700", className)}
      style={{ width: "100%", height: "100%", ...style }}
    >
      {/* Background dots */}
      {points.map((point, index) => {
        const rowIndex = yToRowIndex.get(point.y) ?? 0
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0
        return (
          <circle
            cx={point.x + offsetX}
            cy={point.y}
            r={dotRadius}
            fill="currentColor"
            key={`dot-${index}`}
          />
        )
      })}

      {/* Marker dots with native SVG title tooltip */}
      {processedMarkers.map((marker, index) => {
        const rowIndex = yToRowIndex.get(marker.y) ?? 0
        const offsetX = stagger && rowIndex % 2 === 1 ? xStep / 2 : 0
        const original = markers[index]
        const nodeCount = original?.count || 1
        const tooltipText = original?.label
          ? `${original.label} - ${nodeCount} node${nodeCount > 1 ? "s" : ""}`
          : undefined

        return (
          <g key={`marker-${index}`}>
            {/* Glow effect */}
            <circle
              cx={marker.x + offsetX}
              cy={marker.y}
              r={(marker.size ?? dotRadius) * 3}
              fill={markerColor}
              opacity="0.2"
            />
            {/* Main marker with native title tooltip */}
            <circle
              cx={marker.x + offsetX}
              cy={marker.y}
              r={marker.size ?? dotRadius}
              fill={markerColor}
              style={{ cursor: "pointer" }}
            >
              {tooltipText && <title>{tooltipText}</title>}
            </circle>
          </g>
        )
      })}
    </svg>
  )
}
