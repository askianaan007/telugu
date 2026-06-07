'use client'

import { useId, useLayoutEffect, useRef } from 'react'

import { cn } from '@/lib/utils'

const CX = 160
const CY = 160
const VIEW = 320

/** ~35% of circumference */
const ARC_SPAN = 0.35 * 2 * Math.PI

const RINGS = [
  { r: 158, stroke: '#D9D9D9', strokeWidth: 1.2, periodSec: 25, phaseDeg: 0 },
  { r: 126, stroke: '#C9C9C9', strokeWidth: 1, periodSec: 36, phaseDeg: 63 },
  { r: 94, stroke: '#D9D9D9', strokeWidth: 0.8, periodSec: 55, phaseDeg: 137 },
] as const

function arcPathD(cx: number, cy: number, r: number, a0: number, a1: number) {
  const x0 = cx + r * Math.cos(a0)
  const y0 = cy + r * Math.sin(a0)
  const x1 = cx + r * Math.cos(a1)
  const y1 = cy + r * Math.sin(a1)
  const delta = a1 - a0
  const largeArc = Math.abs(delta) > Math.PI ? 1 : 0
  const sweep = delta > 0 ? 1 : 0
  return `M ${x0} ${y0} A ${r} ${r} 0 ${largeArc} ${sweep} ${x1} ${y1}`
}

type RingGlowRefs = {
  path: SVGPathElement | null
  grad: SVGLinearGradientElement | null
}

export function ConcentricGlowRings({ className }: { className?: string }) {
  const baseId = useId().replace(/:/g, '')
  const ringRefs = useRef<RingGlowRefs[]>(RINGS.map(() => ({ path: null, grad: null })))

  useLayoutEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    let raf = 0

    const updateMotion = (now: number) => {
      const t = now / 1000
      for (let i = 0; i < RINGS.length; i++) {
        const cfg = RINGS[i]
        const { path, grad } = ringRefs.current[i]
        if (!path || !grad) continue

        const ω = (-2 * Math.PI) / cfg.periodSec
        const φ = (cfg.phaseDeg * Math.PI) / 180
        const θc = ω * t + φ
        const a0 = θc - ARC_SPAN / 2
        const a1 = θc + ARC_SPAN / 2

        path.setAttribute('d', arcPathD(CX, CY, cfg.r, a0, a1))

        const gx0 = CX + cfg.r * Math.cos(a0)
        const gy0 = CY + cfg.r * Math.sin(a0)
        const gx1 = CX + cfg.r * Math.cos(a1)
        const gy1 = CY + cfg.r * Math.sin(a1)
        grad.setAttribute('x1', String(gx0))
        grad.setAttribute('y1', String(gy0))
        grad.setAttribute('x2', String(gx1))
        grad.setAttribute('y2', String(gy1))
      }
    }

    const loop = (now: number) => {
      updateMotion(now)
      raf = requestAnimationFrame(loop)
    }

    const run = () => {
      if (mq.matches) {
        for (let i = 0; i < RINGS.length; i++) {
          const cfg = RINGS[i]
          const { path, grad } = ringRefs.current[i]
          if (!path || !grad) continue
          const φ = (cfg.phaseDeg * Math.PI) / 180
          const θc = φ
          const a0 = θc - ARC_SPAN / 2
          const a1 = θc + ARC_SPAN / 2
          path.setAttribute('d', arcPathD(CX, CY, cfg.r, a0, a1))
          const gx0 = CX + cfg.r * Math.cos(a0)
          const gy0 = CY + cfg.r * Math.sin(a0)
          const gx1 = CX + cfg.r * Math.cos(a1)
          const gy1 = CY + cfg.r * Math.sin(a1)
          grad.setAttribute('x1', String(gx0))
          grad.setAttribute('y1', String(gy0))
          grad.setAttribute('x2', String(gx1))
          grad.setAttribute('y2', String(gy1))
        }
        return
      }
      updateMotion(performance.now())
      raf = requestAnimationFrame(loop)
    }

    run()
    const onChange = () => {
      cancelAnimationFrame(raf)
      run()
    }
    mq.addEventListener('change', onChange)

    return () => {
      mq.removeEventListener('change', onChange)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <svg
      aria-hidden
      className={cn(
        'pointer-events-none aspect-square h-full max-h-full w-full max-w-full shrink-0',
        className
      )}
      viewBox={`0 0 ${VIEW} ${VIEW}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        {RINGS.map((_, i) => (
          <linearGradient
            key={i}
            id={`${baseId}-glow-${i}`}
            ref={(el) => {
              ringRefs.current[i].grad = el
            }}
            gradientUnits="userSpaceOnUse"
            x1={CX}
            y1={CY}
            x2={CX}
            y2={CY}
          >
            <stop offset="0%" stopColor="#33a3ff" stopOpacity={0} />
            <stop offset="50%" stopColor="#75b7f0" stopOpacity={0.68} />
            <stop offset="100%" stopColor="#33a3ff" stopOpacity={1} />
          </linearGradient>
        ))}
      </defs>

      {RINGS.map((ring, i) => (
        <circle
          key={`base-${i}`}
          cx={CX}
          cy={CY}
          r={ring.r}
          fill="none"
          stroke={ring.stroke}
          strokeWidth={ring.strokeWidth}
        />
      ))}

      {RINGS.map((ring, i) => (
        <path
          key={`arc-${i}`}
          ref={(el) => {
            ringRefs.current[i].path = el
          }}
          fill="none"
          stroke={`url(#${baseId}-glow-${i})`}
          strokeWidth={Math.max(ring.strokeWidth, 1.2)}
          strokeLinecap="round"
        />
      ))}
    </svg>
  )
}
