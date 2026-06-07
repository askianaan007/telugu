'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface HeroSilkBackgroundProps {
  reduceMotion?: boolean | null
  overlay?: boolean
  className?: string
}

export function HeroSilkBackground({ reduceMotion, overlay, className }: HeroSilkBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    const DPR = Math.min(devicePixelRatio, 2)

    type Wisp = {
      x: number; y: number
      rx: number; ry: number
      a: number
      phase: number; freq: number; pr: number
      vx: number
    }

    const wisps: Wisp[] = Array.from({ length: 40 }, () => ({
      x: Math.random() * 1.4 - 0.2,
      y: Math.random(),
      rx: 0.18 + Math.random() * 0.30,
      ry: 0.09 + Math.random() * 0.16,
      a: 0.72 + Math.random() * 0.25,         // very opaque white
      phase: Math.random() * Math.PI * 2,
      freq: 0.55 + Math.random() * 0.60,      // fast wobble
      pr: 0.45 + Math.random() * 0.50,        // fast pulse
      vx: 0.055 + Math.random() * 0.07,       // fast rightward drift
    }))

    function resize() {
      const p = canvas!.parentElement!
      canvas!.width = p.offsetWidth * DPR
      canvas!.height = p.offsetHeight * DPR
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(canvas.parentElement!)

    let last = 0
    function tick(ts: number) {
      const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016
      last = ts
      const t = ts * 0.001
      const W = canvas!.width / DPR
      const H = canvas!.height / DPR

      ctx.save()
      ctx.scale(DPR, DPR)
      ctx.clearRect(0, 0, W, H)

      // Sky blue
      ctx.fillStyle = '#5B9FD4'
      ctx.fillRect(0, 0, W, H)

      wisps.forEach(b => {
        if (!reduceMotion) {
          b.x += b.vx * dt
          if (b.x - b.rx > 1.2) {
            b.x = -b.rx - 0.1
            b.y = Math.random()
          }
        }

        const bx = (b.x + (reduceMotion ? 0 : Math.sin(t * b.freq + b.phase) * 0.05)) * W
        const by = (b.y + (reduceMotion ? 0 : Math.cos(t * b.freq * 0.8 + b.phase) * 0.04)) * H
        const pulse = reduceMotion ? 1 : 1 + Math.sin(t * b.pr + b.phase) * 0.15
        const rx = b.rx * W * pulse
        const ry = b.ry * H * pulse
        const r = Math.max(rx, ry)

        ctx.save()
        ctx.scale(rx / r, ry / r)
        const gx = bx * (r / rx), gy = by * (r / ry)
        const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r)
        g.addColorStop(0, `rgba(255,255,255,${b.a})`)
        g.addColorStop(0.35, `rgba(255,255,255,${b.a * 0.72})`)
        g.addColorStop(0.65, `rgba(255,255,255,${b.a * 0.32})`)
        g.addColorStop(1, `rgba(255,255,255,0)`)
        ctx.beginPath()
        ctx.arc(gx, gy, r, 0, Math.PI * 2)
        ctx.fillStyle = g
        ctx.fill()
        ctx.restore()
      })

      ctx.restore()
      rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(rafRef.current)
      ro.disconnect()
    }
  }, [reduceMotion])

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-0 overflow-hidden rounded-t-[40px] rounded-b-none',
        className
      )}
    >
      <canvas ref={canvasRef} className="size-full block rounded-t-[40px] rounded-b-none" />
    </div>
  )
}

export { HeroSilkBackground as HeroAuroraBackground }

