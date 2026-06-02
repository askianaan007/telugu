'use client'

import { useId, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

const VIEW = 760
const CX = VIEW / 2
const CY = VIEW / 2
const ARC_SPAN = 0.3 * 2 * Math.PI

const RINGS = [
  { r: 360, stroke: '#e8e8eb', strokeWidth: 1.1, periodSec: 36, phaseDeg: 12 },
  { r: 285, stroke: '#dedee3', strokeWidth: 1.15, periodSec: 30, phaseDeg: 64 },
  { r: 210, stroke: '#d9d9df', strokeWidth: 1.2, periodSec: 24, phaseDeg: 122 },
  { r: 140, stroke: '#d2d2d8', strokeWidth: 1.2, periodSec: 20, phaseDeg: 196 },
] as const

const SECTORS = [
  { startDeg: -18, endDeg: 22, radius: 360, opacity: 0.048 },
  { startDeg: 66, endDeg: 108, radius: 285, opacity: 0.042 },
  { startDeg: 162, endDeg: 202, radius: 360, opacity: 0.04 },
  { startDeg: 246, endDeg: 286, radius: 285, opacity: 0.045 },
]

type RingRefs = { path: SVGPathElement | null; grad: SVGLinearGradientElement | null }

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPathD(cx: number, cy: number, r: number, a0: number, a1: number) {
  const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1)
  const delta = a1 - a0
  const largeArc = Math.abs(delta) > Math.PI ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} ${delta > 0 ? 1 : 0} ${x1} ${y1}`
}

function sectorPathD(cx: number, cy: number, radius: number, startDeg: number, endDeg: number) {
  const p0 = polarToCartesian(cx, cy, radius, startDeg)
  const p1 = polarToCartesian(cx, cy, radius, endDeg)
  const largeArc = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${largeArc} ${endDeg > startDeg ? 1 : 0} ${p1.x} ${p1.y} Z`
}

export function CommitmentConcentricRings({ className }: { className?: string }) {
  const baseId = useId().replace(/:/g, '')
  const ringRefs = useRef<RingRefs[]>(RINGS.map(() => ({ path: null, grad: null })))
  const svgRef = useRef<SVGSVGElement>(null)
  const rafRef = useRef(0)
  const visibleRef = useRef(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')

    function drawAt(t: number) {
      for (let i = 0; i < RINGS.length; i++) {
        const cfg = RINGS[i]
        const refs = ringRefs.current[i]
        if (!refs.path || !refs.grad) continue
        const θc = ((-2 * Math.PI) / cfg.periodSec) * t + (cfg.phaseDeg * Math.PI) / 180
        const a0 = θc - ARC_SPAN / 2, a1 = θc + ARC_SPAN / 2
        refs.path.setAttribute('d', arcPathD(CX, CY, cfg.r, a0, a1))
        const gx0 = CX + cfg.r * Math.cos(a0), gy0 = CY + cfg.r * Math.sin(a0)
        const gx1 = CX + cfg.r * Math.cos(a1), gy1 = CY + cfg.r * Math.sin(a1)
        refs.grad.setAttribute('x1', String(gx0))
        refs.grad.setAttribute('y1', String(gy0))
        refs.grad.setAttribute('x2', String(gx1))
        refs.grad.setAttribute('y2', String(gy1))
      }
    }

    function loop(now: number) {
      if (!visibleRef.current) { rafRef.current = 0; return }
      drawAt(now / 1000)
      rafRef.current = requestAnimationFrame(loop)
    }

    function start() {
      cancelAnimationFrame(rafRef.current)
      if (mq.matches) { drawAt(0); return }
      if (visibleRef.current) rafRef.current = requestAnimationFrame(loop)
    }

    const io = new IntersectionObserver(([e]) => {
      visibleRef.current = e.isIntersecting
      if (e.isIntersecting) start()
      else { cancelAnimationFrame(rafRef.current); rafRef.current = 0 }
    }, { threshold: 0 })

    if (svgRef.current) io.observe(svgRef.current)
    mq.addEventListener('change', start)

    return () => {
      cancelAnimationFrame(rafRef.current)
      io.disconnect()
      mq.removeEventListener('change', start)
    }
  }, [])

  return (
    <svg
      ref={svgRef}
      aria-hidden
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      preserveAspectRatio="xMidYMid meet"
      className={cn('pointer-events-none h-full w-full', className)}
    >
      <defs>
        {RINGS.map((_, i) => (
          <linearGradient
            key={i}
            id={`${baseId}-commit-glow-${i}`}
            gradientUnits="userSpaceOnUse"
            x1={CX} y1={CY} x2={CX} y2={CY}
            ref={(el) => { ringRefs.current[i].grad = el }}
          >
            <stop offset="0%" stopColor="#8ccaff" stopOpacity={0} />
            <stop offset="52%" stopColor="#8dc8ff" stopOpacity={0.55} />
            <stop offset="100%" stopColor="#74b7ff" stopOpacity={0.95} />
          </linearGradient>
        ))}
      </defs>
      {SECTORS.map((sector, i) => (
        <path key={`sector-${i}`} d={sectorPathD(CX, CY, sector.radius, sector.startDeg, sector.endDeg)} fill={`rgba(34,34,34,${sector.opacity})`} />
      ))}
      {RINGS.map((ring, i) => (
        <circle key={`base-${i}`} cx={CX} cy={CY} r={ring.r} fill="none" stroke={ring.stroke} strokeWidth={ring.strokeWidth} />
      ))}
      {RINGS.map((ring, i) => (
        <path
          key={`arc-${i}`}
          ref={(el) => { ringRefs.current[i].path = el }}
          fill="none"
          stroke={`url(#${baseId}-commit-glow-${i})`}
          strokeWidth={Math.max(ring.strokeWidth, 1.5)}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}