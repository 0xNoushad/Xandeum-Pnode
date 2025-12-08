"use client"

import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import type { GeoPermissibleObjects } from "d3"

interface RotatingEarthProps {
    width?: number
    height?: number
    className?: string
}

interface PolygonGeometry {
    type: "Polygon"
    coordinates: number[][][]
}

interface MultiPolygonGeometry {
    type: "MultiPolygon"
    coordinates: number[][][][]
}

interface GeoFeature {
    type: string
    geometry: PolygonGeometry | MultiPolygonGeometry
    properties?: Record<string, unknown>
}

interface GeoFeatureCollection {
    type: "FeatureCollection"
    features: GeoFeature[]
}

export default function RotatingEarth({ width = 800, height = 600, className = "" }: RotatingEarthProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!canvasRef.current) return

        const canvas = canvasRef.current
        const context = canvas.getContext("2d")
        if (!context) return

        const containerWidth = width
        const containerHeight = height
        const radius = Math.min(containerWidth, containerHeight) / 2.2

        const dpr = window.devicePixelRatio || 1
        canvas.width = containerWidth * dpr
        canvas.height = containerHeight * dpr
        canvas.style.width = `${containerWidth}px`
        canvas.style.height = `${containerHeight}px`
        context.scale(dpr, dpr)

        const projection = d3
            .geoOrthographic()
            .scale(radius)
            .translate([containerWidth / 2, containerHeight / 2])
            .clipAngle(90)
            .rotate([0, -20]) // Initial rotation

        const path = d3.geoPath().projection(projection).context(context)

        // --- Helper: Point in Polygon ---
        const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
            const [x, y] = point
            let inside = false
            for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
                const [xi, yi] = polygon[i]
                const [xj, yj] = polygon[j]
                if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
                    inside = !inside
                }
            }
            return inside
        }

        const pointInFeature = (point: [number, number], feature: GeoFeature): boolean => {
            const geometry = feature.geometry
            if (geometry.type === "Polygon") {
                const coordinates = geometry.coordinates
                if (!pointInPolygon(point, coordinates[0])) return false
                for (let i = 1; i < coordinates.length; i++) {
                    if (pointInPolygon(point, coordinates[i])) return false
                }
                return true
            } else if (geometry.type === "MultiPolygon") {
                for (const polygon of geometry.coordinates) {
                    if (pointInPolygon(point, polygon[0])) {
                        let inHole = false
                        for (let i = 1; i < polygon.length; i++) {
                            if (pointInPolygon(point, polygon[i])) {
                                inHole = true
                                break
                            }
                        }
                        if (!inHole) return true
                    }
                }
                return false
            }
            return false
        }

        const generateDotsInPolygon = (feature: GeoFeature, dotSpacing = 16) => {
            const dots: [number, number][] = []
            const bounds = d3.geoBounds(feature as GeoPermissibleObjects)
            const [[minLng, minLat], [maxLng, maxLat]] = bounds

            // Approximate spacing in degrees - purely heuristic
            const stepSize = dotSpacing * 0.15

            for (let lng = minLng; lng <= maxLng; lng += stepSize) {
                for (let lat = minLat; lat <= maxLat; lat += stepSize) {
                    const point: [number, number] = [lng, lat]
                    if (pointInFeature(point, feature)) {
                        dots.push(point)
                    }
                }
            }
            return dots
        }

        // Data containers
        interface DotData {
            lng: number
            lat: number
            visible: boolean
        }
        const allDots: DotData[] = []
        let landFeatures: GeoFeatureCollection

        const render = () => {
            // Clear canvas
            context.clearRect(0, 0, containerWidth, containerHeight)

            const currentScale = projection.scale()
            const scaleFactor = currentScale / radius

            context.beginPath()
            context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
            context.fillStyle = "#000000" // Deep black ocean
            context.fill()

            // Globe Outline
            context.strokeStyle = "#333333"
            context.lineWidth = 1.5 * scaleFactor
            context.stroke()

            if (landFeatures) {
                // 2. Draw Graticule (Grid lines)
                const graticule = d3.geoGraticule()
                context.beginPath()
                path(graticule())
                context.strokeStyle = "#444444"
                context.lineWidth = 0.5 * scaleFactor
                context.globalAlpha = 0.3
                context.stroke()
                context.globalAlpha = 1

                context.beginPath()
                landFeatures.features.forEach((feature) => {
                    path(feature as GeoPermissibleObjects)
                })
                context.strokeStyle = "#666666"
                context.lineWidth = 0.8 * scaleFactor
                context.stroke()

                // 4. Draw Halftone Dots (The "Tech" look)
                allDots.forEach((dot) => {
                    const projected = projection([dot.lng, dot.lat])
                    if (projected) {
                        context.beginPath()
                        context.arc(projected[0], projected[1], 0.8 * scaleFactor, 0, 2 * Math.PI)
                        context.fillStyle = "#ffffff" // White dots
                        context.fill()
                    }
                })
            }
        }

        const loadWorldData = async () => {
            try {
                const response = await fetch(
                    "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
                )
                if (!response.ok) throw new Error("Failed to load land data")

                landFeatures = await response.json()

                landFeatures.features.forEach((feature) => {
                    const dots = generateDotsInPolygon(feature, 12)
                    dots.forEach(([lng, lat]) => {
                        allDots.push({ lng, lat, visible: true })
                    })
                })

                render()
            } catch (err) {
                setError("Failed to load map data")
                console.error(err)
            }
        }

        // --- Rotation Logic ---
        // [Longitude, Latitude]
        const rotation: [number, number] = [0, -20]
        let autoRotate = true
        const rotationSpeed = 0.2 // Slow, premium rotation

        const rotate = () => {
            if (autoRotate) {
                rotation[0] += rotationSpeed
                projection.rotate(rotation as [number, number]) // Type assertion
                render()
            }
        }

        const rotationTimer = d3.timer(rotate)

        // --- Interaction ---
        const handleMouseDown = (event: MouseEvent) => {
            autoRotate = false
            const startX = event.clientX
            const startY = event.clientY
            const startRotation = [...rotation]

            const handleMouseMove = (moveEvent: MouseEvent) => {
                const sensitivity = 0.25
                const dx = moveEvent.clientX - startX
                const dy = moveEvent.clientY - startY

                rotation[0] = startRotation[0] + dx * sensitivity
                rotation[1] = Math.max(-90, Math.min(90, startRotation[1] - dy * sensitivity))

                projection.rotate(rotation as [number, number])
                render()
            }

            const handleMouseUp = () => {
                document.removeEventListener("mousemove", handleMouseMove)
                document.removeEventListener("mouseup", handleMouseUp)
                setTimeout(() => { autoRotate = true }, 1000)
            }

            document.addEventListener("mousemove", handleMouseMove)
            document.addEventListener("mouseup", handleMouseUp)
        }

        canvas.addEventListener("mousedown", handleMouseDown)

        loadWorldData()

        return () => {
            rotationTimer.stop()
            canvas.removeEventListener("mousedown", handleMouseDown)
        }
    }, [width, height])

    if (error) {
        return (
            <div className={`flex items-center justify-center h-full w-full bg-card/50 rounded-xl p-8 ${className}`}>
                <p className="text-destructive text-sm">{error}</p>
            </div>
        )
    }

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width, height }}>
            <canvas
                ref={canvasRef}
                className="cursor-move touch-none"
                style={{ width, height }}
            />
        </div>
    )
}
