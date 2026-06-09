


'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface HeroSilkBackgroundProps {
    reduceMotion?: boolean | null
    overlay?: boolean
    className?: string
}

export function HeroSilkBackground({ reduceMotion, className }: HeroSilkBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const rafRef = useRef<number>(0)
    const visibleRef = useRef(true)

    useEffect(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d', { alpha: false })!
        const DPR = Math.min(devicePixelRatio, 1.25)

        type Wisp = {
            x: number; y: number
            rx: number; ry: number
            a: number
            phase: number; freq: number; pr: number
            vx: number
        }

        const COUNT = reduceMotion ? 0 : 7
        const wisps: Wisp[] = Array.from({ length: COUNT }, () => ({
            x: Math.random() * 1.4 - 0.2,
            y: Math.random(),
            rx: 0.18 + Math.random() * 0.28,
            ry: 0.09 + Math.random() * 0.14,
            a: 0.65 + Math.random() * 0.22,
            phase: Math.random() * Math.PI * 2,
            freq: 0.45 + Math.random() * 0.55,
            pr: 0.4 + Math.random() * 0.45,
            vx: 0.045 + Math.random() * 0.06,
        }))

        let resizeRaf = 0
        function resize() {
            cancelAnimationFrame(resizeRaf)

            resizeRaf = requestAnimationFrame(() => {
                const p = canvas!.parentElement!

                canvas!.width = p.offsetWidth * DPR
                canvas!.height = p.offsetHeight * DPR

                const W = canvas!.width / DPR
                const H = canvas!.height / DPR

                ctx.save()
                ctx.scale(DPR, DPR)
                ctx.fillStyle = '#94CEE8'
                ctx.fillRect(0, 0, W, H)
                ctx.restore()
            })
        }
        resize()
        const ro = new ResizeObserver(resize)
        ro.observe(canvas.parentElement!)

        const io = new IntersectionObserver(
            ([entry]) => {
                visibleRef.current = entry.isIntersecting
                if (entry.isIntersecting) {
                    if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
                } else {
                    cancelAnimationFrame(rafRef.current)
                    rafRef.current = 0
                }
            },
            { threshold: 0 }
        )
        io.observe(canvas)

        let last = 0
        let frameCount = 0
        function tick(ts: number) {
            if (!visibleRef.current) { rafRef.current = 0; return }

            frameCount++
            // Run at ~20fps — background canvas is imperceptible at this rate,
            // but eliminates 2/3 of gradient allocations vs running at 60fps
            if (frameCount % 3 !== 0) {
                rafRef.current = requestAnimationFrame(tick)
                return
            }

            const dt = last ? Math.min((ts - last) / 1000, 0.05) : 0.016
            last = ts
            const t = ts * 0.001
            const W = canvas!.width / DPR
            const H = canvas!.height / DPR

            ctx.save()
            ctx.scale(DPR, DPR)
            ctx.fillStyle = '#94CEE8'
            ctx.fillRect(0, 0, W, H)

            for (let i = 0; i < wisps.length; i++) {
                const b = wisps[i]
                b.x += b.vx * dt
                if (b.x - b.rx > 1.2) {
                    b.x = -b.rx - 0.1
                    b.y = Math.random()
                }

                const bx = (b.x + Math.sin(t * b.freq + b.phase) * 0.05) * W
                const by = (b.y + Math.cos(t * b.freq * 0.8 + b.phase) * 0.04) * H
                const pulse = 1 + Math.sin(t * b.pr + b.phase) * 0.12
                const rx = b.rx * W * pulse
                const ry = b.ry * H * pulse
                const r = Math.max(rx, ry)

                ctx.save()
                ctx.scale(rx / r, ry / r)
                const gx = bx * (r / rx), gy = by * (r / ry)
                const g = ctx.createRadialGradient(gx, gy, 0, gx, gy, r)
                g.addColorStop(0, `rgba(255,255,255,${b.a})`)
                g.addColorStop(0.4, `rgba(255,255,255,${b.a * 0.65})`)
                g.addColorStop(0.7, `rgba(255,255,255,${b.a * 0.25})`)
                g.addColorStop(1, `rgba(255,255,255,0)`)
                ctx.beginPath()
                ctx.arc(gx, gy, r, 0, Math.PI * 2)
                ctx.fillStyle = g
                ctx.fill()
                ctx.restore()
            }

            ctx.restore()
            rafRef.current = requestAnimationFrame(tick)
        }

        return () => {
            cancelAnimationFrame(rafRef.current)
            cancelAnimationFrame(resizeRaf)
            ro.disconnect()
            io.disconnect()
            rafRef.current = 0
        }
    }, [reduceMotion])

    return (
        <div
            aria-hidden
            className={cn(
                'pointer-events-none absolute inset-0 overflow-hidden rounded-t-[40px] rounded-b-none bg-[#94CEE8]',
                className
            )}
        >
            <canvas ref={canvasRef} className="block size-full rounded-t-[40px] rounded-b-none" />
        </div>
    )
}

export { HeroSilkBackground as HeroAuroraBackground }