'use client'

/**
 * SitePreloader.tsx
 *
 * Changes from original (marked with ← CHANGED / ← NEW):
 *
 * The key insight: onComplete fires AFTER the exit animation completes,
 * meaning the loader is already gone when PreloaderProvider gets the signal.
 * The pre-scroll must run while the loader still covers the page.
 *
 * Solution: we run preScrollPage() during the 'reveal' phase — progress
 * has hit 100% but the loader is still fully opaque. The exit animation
 * only starts after preScrollPage() resolves.
 *
 * New phase flow:
 *   loading → reveal → pre-scrolling → exiting → done
 *
 * The loader UI is identical to the original. Only the async phase
 * sequencing changes.
 */

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

// ← NEW: import the pre-scroll engine
import { preScrollPage } from '@/lib/preScroll'

console.log('[SitePreloader] module loaded — preScrollPage:', typeof preScrollPage)

// Phase 'pre-scrolling' is new — all others are unchanged
type Phase = 'loading' | 'reveal' | 'pre-scrolling' | 'exiting' | 'done'

const MIN_DISPLAY_MS = 2200
const EXIT_DURATION_MS = 800

export function SitePreloader({ onComplete }: { onComplete?: () => void }) {
    const [phase, setPhase] = useState<Phase>('loading')
    const [progress, setProgress] = useState(0)
    const startTimeRef = useRef(Date.now())
    const reducedMotion = useRef(false)
    const hasInitialized = useRef(false)
    const onCompleteRef = useRef(onComplete)
    onCompleteRef.current = onComplete

    // Abort controller for pre-scroll cleanup on unmount
    const abortRef = useRef<AbortController | null>(null)  // ← NEW

    useEffect(() => {
        return () => {
            // ← NEW: cancel in-flight pre-scroll if component unmounts
            abortRef.current?.abort()
        }
    }, [])

    useEffect(() => {
        if (hasInitialized.current) return
        hasInitialized.current = true

        reducedMotion.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
        if (reducedMotion.current) {
            setPhase('done')
            onCompleteRef.current?.()
            return
        }

        let cancelled = false
        let p = 0
        const ticker = setInterval(() => {
            p += Math.random() * 14 + 2
            setProgress(Math.min(95, p))
        }, 140)

        // ← CHANGED: finish() is now async and runs preScrollPage before exiting
        const finish = async () => {
            if (cancelled) return
            clearInterval(ticker)
            await document.fonts?.ready?.catch(() => { })
            if (cancelled) return

            const elapsed = Date.now() - startTimeRef.current
            await new Promise<void>((r) => setTimeout(r, Math.max(0, MIN_DISPLAY_MS - elapsed)))
            if (cancelled) return

            setProgress(100)
            setPhase('reveal')

            // Wait one second for the "100%" reveal moment (same as original)
            await new Promise<void>((r) => setTimeout(r, 1000))
            if (cancelled) return

            // ← NEW: run hidden pre-scroll while loader still covers the page
            console.log('[SitePreloader] → entering pre-scrolling phase')
            setPhase('pre-scrolling')
            const controller = new AbortController()
            abortRef.current = controller

            try {
                await preScrollPage(controller.signal)
                console.log('[SitePreloader] ✓ preScrollPage resolved')
            } catch (err) {
                // AbortError = unmounted early, that's fine
                // Any other error: log it but don't block the reveal
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.warn('[SitePreloader] pre-scroll failed, revealing anyway:', err)
                }
            }

            if (cancelled || controller.signal.aborted) return

            // ← CHANGED: exit animation starts AFTER pre-scroll is done
            setPhase('exiting')
            await new Promise<void>((r) => setTimeout(r, EXIT_DURATION_MS))
            if (cancelled) return

            setPhase('done')
            onCompleteRef.current?.()
        }

        if (document.readyState === 'complete') {
            finish()
        } else {
            window.addEventListener('load', finish, { once: true })
            const fb = setTimeout(finish, 5000)
            return () => {
                cancelled = true
                clearInterval(ticker)
                window.removeEventListener('load', finish)
                clearTimeout(fb)
            }
        }
        return () => {
            cancelled = true
            clearInterval(ticker)
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    if (phase === 'done') return null

    const pct = Math.round(progress)
    const R = 72
    const cx = 88
    const cy = 88
    const circumference = 2 * Math.PI * R
    const dashOffset = circumference * (1 - pct / 100)

    return (
        <div
            data-site-preloader
            data-reduced-motion={reducedMotion.current ? 'true' : 'false'}
            data-exiting={phase === 'exiting' ? 'true' : 'false'}
            data-phase={phase}  // ← NEW: useful for debugging
            style={{
                position: 'fixed', inset: 0, zIndex: 999,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                background: 'linear-gradient(155deg, #0d1520 0%, #121f2f 45%, #0a1118 100%)',
                transition: `opacity ${EXIT_DURATION_MS}ms cubic-bezier(0.22,1,0.36,1)`,
                opacity: phase === 'exiting' ? 0 : 1,
                pointerEvents: phase === 'exiting' ? 'none' : 'auto',
            }}
        >
            {/* Ambient radial glows */}
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '-10%', left: '-15%', width: '55%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(202,139,55,0.07) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', bottom: '-12%', right: '-18%', width: '60%', aspectRatio: '1', borderRadius: '50%', background: 'radial-gradient(circle, rgba(202,46,121,0.06) 0%, transparent 70%)' }} />
                <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translateX(-50%)', width: '80%', height: '40%', background: 'radial-gradient(ellipse, rgba(202,139,55,0.04) 0%, transparent 65%)' }} />
            </div>

            {/* Fine grid overlay */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.04,
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '48px 48px',
            }} />

            {/* Corner brackets */}
            {[
                { top: 24, left: 24, bt: true, bl: true },
                { top: 24, right: 24, bt: true, br: true },
                { bottom: 24, left: 24, bb: true, bl: true },
                { bottom: 24, right: 24, bb: true, br: true },
            ].map((c, i) => (
                <div key={i} style={{
                    position: 'absolute', width: 22, height: 22, opacity: 0.3,
                    top: c.top, bottom: c.bottom, left: c.left, right: c.right,
                    borderTop: c.bt ? '1.5px solid #ca8b37' : 'none',
                    borderBottom: c.bb ? '1.5px solid #ca8b37' : 'none',
                    borderLeft: c.bl ? '1.5px solid #ca8b37' : 'none',
                    borderRight: c.br ? '1.5px solid #ca8b37' : 'none',
                }} />
            ))}

            {/* Main content */}
            <div style={{
                position: 'relative', zIndex: 10,
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                gap: 0, width: '100%', maxWidth: 360, padding: '0 24px',
            }}>
                {/* Progress ring + logo */}
                <div style={{ position: 'relative', width: 176, height: 176, marginBottom: 32 }}>
                    <svg width="176" height="176" style={{ position: 'absolute', inset: 0 }}>
                        <style>{`@keyframes preloader-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
                        <circle cx="88" cy="88" r="84" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
                        <g style={{ transformOrigin: '88px 88px', animation: 'preloader-spin 3s linear infinite' }}>
                            <circle cx="88" cy="88" r="84" fill="none"
                                stroke="url(#shimmerGrad)" strokeWidth="1.5"
                                strokeDasharray="60 480" strokeLinecap="round" />
                        </g>
                        <defs>
                            <linearGradient id="shimmerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="rgba(202,139,55,0)" />
                                <stop offset="50%" stopColor="rgba(249,230,126,0.9)" />
                                <stop offset="100%" stopColor="rgba(202,139,55,0)" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <svg width="176" height="176" style={{ position: 'absolute', inset: 0 }}>
                        <circle cx={cx} cy={cy} r={R} fill="none"
                            stroke="rgba(255,255,255,0.06)" strokeWidth="2.5" />
                        <circle cx={cx} cy={cy} r={R} fill="none"
                            stroke="url(#progressGrad)" strokeWidth="2.5"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px`, transition: 'stroke-dashoffset 0.14s linear' }}
                        />
                        <defs>
                            <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#ca8b37" />
                                <stop offset="100%" stopColor="#f9e67e" />
                            </linearGradient>
                        </defs>
                    </svg>

                    <div style={{
                        position: 'absolute',
                        top: 12, left: 12, right: 12, bottom: 12,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.04)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        backdropFilter: 'blur(8px)',
                        overflow: 'hidden',
                    }}>
                        <div style={{ position: 'relative', width: '72%', height: '72%' }}>
                            <Image src="/images/telugu-air-logo.png" alt="Telugu Airlines" fill className="object-contain" priority />
                        </div>
                    </div>

                    <div style={{
                        position: 'absolute', bottom: 6, right: 6,
                        background: 'linear-gradient(135deg, #ca8b37, #f9e67e)',
                        borderRadius: 20, padding: '2px 8px',
                        fontFamily: 'var(--font-roboto-mono)', fontSize: 10, fontWeight: 500,
                        color: '#09090b', letterSpacing: '0.02em',
                        boxShadow: '0 0 12px rgba(202,139,55,0.4)',
                    }}>
                        {pct}%
                    </div>
                </div>

                {/* Brand name */}
                <div style={{ textAlign: 'center', marginBottom: 6 }}>
                    <div style={{
                        fontFamily: 'var(--font-halant)', fontWeight: 400,
                        fontSize: 'clamp(1.5rem,5vw,1.875rem)',
                        letterSpacing: '-0.025em', lineHeight: 1.1,
                        color: '#ffffff',
                    }}>
                        Telugu Airlines
                    </div>
                </div>

                {/* Tagline */}
                <div style={{
                    fontFamily: 'var(--font-geist)', fontSize: 10, fontWeight: 500,
                    letterSpacing: '0.25em', textTransform: 'uppercase',
                    color: 'rgba(202,139,55,0.8)',
                    marginBottom: 28,
                }}>
                    Premium Aviation Services
                </div>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.08))' }} />
                    <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(202,139,55,0.6)' }} />
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, rgba(255,255,255,0.08), transparent)' }} />
                </div>

                {/* Progress bar */}
                <div style={{ width: '100%', height: 2, borderRadius: 2, background: 'rgba(255,255,255,0.06)', overflow: 'hidden', marginBottom: 10 }}>
                    <div style={{
                        height: '100%', borderRadius: 2,
                        background: 'linear-gradient(90deg, #ca8b37, #f9e67e)',
                        width: `${pct}%`,
                        transition: 'width 0.14s linear',
                        boxShadow: '0 0 8px rgba(202,139,55,0.6)',
                    }} />
                </div>

                {/* Status row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <span style={{
                        fontFamily: 'var(--font-geist)', fontSize: 10,
                        letterSpacing: '0.14em', textTransform: 'uppercase',
                        color: 'rgba(255,255,255,0.3)',
                    }}>
                        {/* ← CHANGED: show 'pre-scrolling' state to user as neutral message */}
                        {phase === 'pre-scrolling'
                            ? 'Initialising experience'
                            : pct < 100
                                ? 'Preparing experience'
                                : 'Ready for takeoff'}
                    </span>
                    <span style={{
                        fontFamily: 'var(--font-roboto-mono)', fontSize: 10,
                        color: 'rgba(202,139,55,0.6)',
                    }}>
                        {pct}%
                    </span>
                </div>
            </div>
        </div>
    )
}