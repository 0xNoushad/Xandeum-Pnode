"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import geoData from "@/geo.json"

interface Marker {
  lat: number
  lng: number
  size?: number
  label?: string
  count?: number
}

interface GeoJsonGeometry {
  type: string
  coordinates: number[][] | number[][][] | number[][][][]
}

interface GeoJsonFeature {
  id: string
  properties: { name: string }
  geometry: GeoJsonGeometry
}

interface GeoJsonData {
  type: string
  features: GeoJsonFeature[]
}

interface PathData {
  id: string
  name: string
  path: string
}

export interface GeoJsonMapProps {
  markers?: Marker[]
  markerColor?: string
  countryFill?: string
  countryStroke?: string
  className?: string
  showLabel?: boolean
  statusText?: string
  statusColor?: string
  zoomToMarker?: boolean
}

// Convert lat/lng to SVG coordinates (Mercator-ish projection)
function project(lng: number, lat: number, width: number, height: number): [number, number] {
  const x = ((lng + 180) / 360) * width
  const y = ((90 - lat) / 180) * height
  return [x, y]
}

// Convert GeoJSON coordinates to SVG path
function coordsToPath(coords: number[][], width: number, height: number): string {
  return coords
    .map((coord, i) => {
      const [x, y] = project(coord[0], coord[1], width, height)
      return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(" ") + " Z"
}

// Process geometry to SVG paths
function geometryToPath(geometry: GeoJsonGeometry, width: number, height: number): string {
  if (geometry.type === "Polygon") {
    return (geometry.coordinates as number[][][]).map((ring) => coordsToPath(ring, width, height)).join(" ")
  } else if (geometry.type === "MultiPolygon") {
    return (geometry.coordinates as number[][][][])
      .map((polygon) => 
        polygon.map((ring) => coordsToPath(ring, width, height)).join(" ")
      )
      .join(" ")
  }
  return ""
}

export function GeoJsonMap({
  markers = [],
  markerColor = "#f97316",
  countryFill = "#3f3f46",
  countryStroke = "#52525b",
  className,
  showLabel = true,
  statusText,
  statusColor = "#f97316",
  zoomToMarker = false,
}: GeoJsonMapProps) {
  const width = 800
  const height = 400

  // Generate paths from GeoJSON
  const paths = React.useMemo(() => {
    const data = geoData as GeoJsonData
    return data.features
      .filter((f) => f.properties?.name !== "Antarctica")
      .map((feature, index): PathData => ({
        id: feature.id ? `${feature.id}-${index}` : `country-${index}`,
        name: feature.properties?.name,
        path: geometryToPath(feature.geometry, width, height),
      }))
  }, [])

  // Convert markers to SVG coordinates
  const svgMarkers = React.useMemo(() => {
    return markers
      .filter(m => m.lat !== 0 && m.lng !== 0)
      .map(m => {
        const [x, y] = project(m.lng, m.lat, width, height)
        return { ...m, x, y }
      })
  }, [markers])

  // Calculate viewBox - zoom to marker region if enabled
  const viewBox = React.useMemo(() => {
    if (zoomToMarker && svgMarkers.length > 0) {
      const marker = svgMarkers[0]
      // Tighter zoom - show regional view like Europe
      const zoomWidth = 200
      const zoomHeight = 130
      // Position marker in upper third of view
      const x = marker.x - zoomWidth / 2
      const y = marker.y - zoomHeight / 3
      // Clamp to valid bounds
      const clampedX = Math.max(0, Math.min(width - zoomWidth, x))
      const clampedY = Math.max(0, Math.min(height - zoomHeight, y))
      return `${clampedX} ${clampedY} ${zoomWidth} ${zoomHeight}`
    }
    return `0 0 ${width} ${height}`
  }, [zoomToMarker, svgMarkers])

  const firstMarker = markers[0]

  return (
    <div className={cn("relative w-full h-full bg-zinc-900 rounded-lg overflow-hidden", className)}>
      {/* SVG Map */}
      <svg
        viewBox={viewBox}
        className="w-full h-full"
        preserveAspectRatio={zoomToMarker ? "xMidYMid meet" : "xMidYMid slice"}
      >
        {/* Background */}
        <rect width={width} height={height} fill="#18181b" />
        
        {/* Country paths with hover */}
        <g>
          {paths.map((p) => (
            <path
              key={p.id}
              d={p.path}
              fill={countryFill}
              stroke={countryStroke}
              strokeWidth="0.5"
              className="transition-colors duration-150 hover:fill-zinc-500 cursor-pointer"
            >
              <title>{p.name}</title>
            </path>
          ))}
        </g>

        {/* Markers with glow */}
        <g>
          {svgMarkers.map((marker, index) => {
            // Bigger dot for detail view since we're zoomed in more
            const baseSize = zoomToMarker ? 3 : 2
            const nodeCount = marker.count || 1
            const tooltipText = marker.label
              ? `${marker.label} - ${nodeCount} node${nodeCount > 1 ? "s" : ""}`
              : undefined

            return (
              <g key={`marker-${index}`}>
                {/* Outer glow ring */}
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={baseSize * 2.2}
                  fill="none"
                  stroke={markerColor}
                  strokeWidth={zoomToMarker ? "0.8" : "0.5"}
                  opacity="0.5"
                />
                {/* Inner glow */}
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={baseSize * 1.4}
                  fill={markerColor}
                  opacity="0.3"
                />
                {/* Main marker dot */}
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r={baseSize}
                  fill={markerColor}
                  className="cursor-pointer"
                >
                  {tooltipText && <title>{tooltipText}</title>}
                </circle>
              </g>
            )
          })}
        </g>
      </svg>

      {/* Location label overlay - bottom left */}
      {showLabel && firstMarker?.label && (
        <div className="absolute bottom-12 left-4 px-3 py-1.5 bg-zinc-800/90 rounded text-sm text-zinc-300 font-mono">
          {firstMarker.label}
        </div>
      )}

      {/* Status indicator - bottom center */}
      {statusText && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 text-sm text-zinc-400">
          <span 
            className="w-2.5 h-2.5 rounded-full" 
            style={{ backgroundColor: statusColor }}
          />
          {statusText}
        </div>
      )}
    </div>
  )
}
