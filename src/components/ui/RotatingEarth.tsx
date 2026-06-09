'use client'

import { geoBounds, geoGraticule, geoOrthographic, geoPath } from 'd3-geo'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { cn } from '@/lib/utils'

export interface RotatingEarthProps {
  className?: string
  /** dot color */
  dotColor?: string
  /** when `transparent`, nothing is filled behind the globe (footer shows through) */
  oceanColor?: string
  /** graticule stroke */
  gridColor?: string
  /** degrees added each animation tick */
  rotationSpeed?: number
}

/** Natural Earth land feature (polygonal only) — local types avoid `geojson` / `@types/d3` resolution issues. */
interface LandPolygonalGeometry {
  type: 'Polygon' | 'MultiPolygon'
  coordinates: number[][][] | number[][][][]
}

interface LandFeature {
  type: 'Feature'
  geometry: LandPolygonalGeometry
  properties?: Record<string, unknown> | null
}

interface LandFeatureCollection {
  type: 'FeatureCollection'
  features: LandFeature[]
}

interface DotData {
  lng: number
  lat: number
}

// Module-level cache to survive remounts
let moduleCache: { land: LandFeatureCollection; dots: DotData[] } | null = null

/** Square canvas edge length (px) from viewport — xl (1280+) = 800. */
function globeSizePx(viewportWidth: number): number {
  if (viewportWidth >= 1280) return 800
  if (viewportWidth >= 1024) return 640
  if (viewportWidth >= 768) return 520
  if (viewportWidth >= 640) return 440
  return Math.min(360, Math.max(280, viewportWidth - 32))
}

function pointInPolygon(point: [number, number], ring: number[][]): boolean {
  const [x, y] = point
  let inside = false
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i]?.[0] ?? 0
    const yi = ring[i]?.[1] ?? 0
    const xj = ring[j]?.[0] ?? 0
    const yj = ring[j]?.[1] ?? 0
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside
    }
  }
  return inside
}

function pointInFeature(point: [number, number], feature: LandFeature): boolean {
  const { type, coordinates } = feature.geometry
  if (type === 'Polygon') {
    const rings = coordinates as number[][][]
    const outer = rings[0]
    if (!outer || !pointInPolygon(point, outer)) return false
    for (let i = 1; i < rings.length; i++) {
      const hole = rings[i]
      if (hole && pointInPolygon(point, hole)) return false
    }
    return true
  }
  if (type === 'MultiPolygon') {
    const polys = coordinates as number[][][][]
    for (const polygon of polys) {
      const outer = polygon[0]
      if (outer && pointInPolygon(point, outer)) {
        let inHole = false
        for (let i = 1; i < polygon.length; i++) {
          const hole = polygon[i]
          if (hole && pointInPolygon(point, hole)) {
            inHole = true
            break
          }
        }
        if (!inHole) return true
      }
    }
  }
  return false
}

const generateDotsInPolygon = (feature: LandFeature, dotSpacing = 14) => {
  const dots: [number, number][] = []
  const [[minLng, minLat], [maxLng, maxLat]] = geoBounds(feature as never)
  const step = dotSpacing * 0.08
  for (let lng = minLng; lng <= maxLng; lng += step) {
    for (let lat = minLat; lat <= maxLat; lat += step) {
      if (pointInFeature([lng, lat], feature)) dots.push([lng, lat])
    }
  }
  return dots
}

export default function RotatingEarth({
  className = '',
  dotColor = 'rgba(255,255,255,0.50)',
  oceanColor = 'transparent',
  gridColor = 'rgba(255,255,255,0.06)',
  rotationSpeed = 0.25,
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  const [squareSize, setSquareSize] = useState(520)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useLayoutEffect(() => {
    const update = () => setSquareSize(globeSizePx(window.innerWidth))
    update()
    let timer: ReturnType<typeof setTimeout>
    const debouncedUpdate = () => { clearTimeout(timer); timer = setTimeout(update, 150) }
    window.addEventListener('resize', debouncedUpdate, { passive: true })
    return () => { window.removeEventListener('resize', debouncedUpdate); clearTimeout(timer) }
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    if (!context) return

    let cancelled = false
    // Cap DPR to 1.5 — prevents enormous canvas on 3x retina (9x pixel count)
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5)
    const containerWidth = squareSize
    const containerHeight = squareSize
    const radius = Math.min(containerWidth, containerHeight) / 2.15

    canvas.width = containerWidth * dpr
    canvas.height = containerHeight * dpr
    canvas.style.width = `${containerWidth}px`
    canvas.style.height = `${containerHeight}px`
    context.setTransform(1, 0, 0, 1, 0, 0)
    context.scale(dpr, dpr)

    const projection = geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
      .clipAngle(90)

    const path = geoPath().projection(projection).context(context)

    const render = (landFeatures: LandFeatureCollection, allDots: DotData[]) => {
      context.clearRect(0, 0, containerWidth, containerHeight)
      const currentScale = projection.scale()
      const sf = currentScale / radius

      if (oceanColor !== 'transparent') {
        context.beginPath()
        context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
        context.fillStyle = oceanColor
        context.fill()
      }

      context.beginPath()
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI)
      context.strokeStyle = 'rgba(255,255,255,0.10)'
      context.lineWidth = 1.5 * sf
      context.stroke()

      const graticule = geoGraticule()
      context.beginPath()
      path(graticule())
      context.strokeStyle = gridColor
      context.lineWidth = 0.7 * sf
      context.globalAlpha = 1
      context.stroke()

      context.beginPath()
      for (const f of landFeatures.features) {
        path(f as never)
      }
      context.strokeStyle = 'rgba(255,255,255,0.18)'
      context.lineWidth = 0.8 * sf
      context.stroke()

      // Batch ALL dots into a single path — eliminates thousands of individual draw calls
      context.beginPath()
      const dotR = 1.1 * sf
      allDots.forEach(({ lng, lat }) => {
        const projected = projection([lng, lat])
        if (
          projected &&
          projected[0] >= 0 &&
          projected[0] <= containerWidth &&
          projected[1] >= 0 &&
          projected[1] <= containerHeight
        ) {
          context.moveTo(projected[0] + dotR, projected[1])
          context.arc(projected[0], projected[1], dotR, 0, 2 * Math.PI)
        }
      })
      context.fillStyle = dotColor
      context.fill()
    }

    const rotation: [number, number, number] = [0, -15, 0]
    let isVisible = false

    const startSpin = (landFeatures: LandFeatureCollection, allDots: DotData[]) => {
      const tick = () => {
        if (!isVisible || cancelled) { rafRef.current = 0; return }
        rotation[0] = (rotation[0] + rotationSpeed) % 360
        projection.rotate(rotation)
        render(landFeatures, allDots)
        rafRef.current = requestAnimationFrame(tick)
      }
      cancelAnimationFrame(rafRef.current)
      if (isVisible) rafRef.current = requestAnimationFrame(tick)
      return tick
    }

    const boot = async () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      try {
        if (!moduleCache) {
          setIsLoading(true)
          const res = await fetch('/data/ne_110m_land.json')
          if (!res.ok) throw new Error('Network error')
          const land = (await res.json()) as LandFeatureCollection
          const dots: DotData[] = []
          for (const feature of land.features) {
            if (feature.geometry.type !== 'Polygon' && feature.geometry.type !== 'MultiPolygon')
              continue
            generateDotsInPolygon(feature, 14).forEach(([lng, lat]) => dots.push({ lng, lat }))
          }
          moduleCache = { land, dots }
          setIsLoading(false)
        }

        if (cancelled || !moduleCache) return
        const { land: landFeatures, dots: allDots } = moduleCache

        render(landFeatures, allDots)
        const tick = startSpin(landFeatures, allDots)

        // Pause RAF when globe is off-screen — was running forever even at top of page
        const observer = new IntersectionObserver(
          ([entry]) => {
            isVisible = entry?.isIntersecting ?? false
            if (isVisible && rafRef.current === 0 && !cancelled) {
              rafRef.current = requestAnimationFrame(tick)
            } else if (!isVisible) {
              cancelAnimationFrame(rafRef.current)
              rafRef.current = 0
            }
          },
          { threshold: 0 }
        )
        observer.observe(canvas)

        return () => { observer.disconnect() }
      } catch {
        if (!cancelled) {
          setError('Failed to load globe data')
          setIsLoading(false)
        }
      }
    }

    let observerCleanup: (() => void) | undefined
    boot().then((cleanup) => { observerCleanup = cleanup })

    return () => {
      cancelled = true
      cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
      observerCleanup?.()
    }
  }, [squareSize, dotColor, oceanColor, gridColor, rotationSpeed])

  if (error) {
    return (
      <div className={cn('flex items-center justify-center p-8', className)}>
        <p className="text-sm text-white/40">{error}</p>
      </div>
    )
  }

  return (
    <div
      className={cn('pointer-events-none relative mx-auto bg-transparent', className)}
      style={{ width: squareSize, height: squareSize }}
    >
      {isLoading ? (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white/60" />
        </div>
      ) : null}
      <canvas
        ref={canvasRef}
        className="block h-full w-full max-w-full bg-transparent"
        aria-label="Rotating globe"
        role="img"
      />
    </div>
  )
}
