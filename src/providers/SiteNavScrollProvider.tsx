'use client'

import { usePathname } from 'next/navigation'
import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from 'react'

const HOME_NAV_ANCHORS: { href: string; id: string }[] = [
    { href: '/#about', id: 'about' },
    { href: '/#services', id: 'services' },
    { href: '/#contact', id: 'contact' },
]

const PRESENCE_ORDER = ['india', 'dubai', 'newyork'] as const

function parsePresenceHash(): (typeof PRESENCE_ORDER)[number] | null {
    const m = /^#presence-(india|dubai|newyork)$/.exec(window.location.hash)
    return m ? (m[1] as (typeof PRESENCE_ORDER)[number]) : null
}

type SiteNavScrollContextValue = {
    isNavLinkActive: (href: string) => boolean
    isContactCtaActive: boolean
    activePresenceId: string
}

const SiteNavScrollContext = createContext<SiteNavScrollContextValue | null>(null)

export function SiteNavScrollProvider({ children }: { children: ReactNode }) {
    const pathname = usePathname()
    const [activeHomeNavHref, setActiveHomeNavHref] = useState('/')
    const [activePresenceId, setActivePresenceId] = useState('dubai')

    // Track which sections are currently intersecting instead of reading getBCR on scroll
    const activeSectionRef = useRef<string>('/')
    const activePresenceRef = useRef<string>('dubai')

    useEffect(() => {
        if (pathname !== '/') {
            setActiveHomeNavHref('/')
            setActivePresenceId('dubai')
            return
        }

        // Use IntersectionObserver for nav sections — no layout reads on scroll
        const THRESHOLD = 0.28
        const rootMargin = `-${Math.round(window.innerHeight * THRESHOLD)}px 0px 0px 0px`

        const navObserver = new IntersectionObserver(
            (entries) => {
                // Process in document order — last intersecting one wins
                for (const entry of entries) {
                    const id = entry.target.id
                    const anchor = HOME_NAV_ANCHORS.find((a) => a.id === id)
                    if (!anchor) continue
                    if (entry.isIntersecting) {
                        activeSectionRef.current = anchor.href
                        setActiveHomeNavHref(anchor.href)
                    } else if (activeSectionRef.current === anchor.href) {
                        // Section left viewport — check if we should fall back
                        const remaining = HOME_NAV_ANCHORS.filter(
                            (a) => a.id !== id
                        ).reduce((best, a) => {
                            const el = document.getElementById(a.id)
                            if (!el) return best
                            const rect = el.getBoundingClientRect()
                            if (rect.top <= window.innerHeight * THRESHOLD && rect.top > (best?.top ?? -Infinity)) {
                                return { href: a.href, top: rect.top }
                            }
                            return best
                        }, null as { href: string; top: number } | null)
                        const fallback = remaining?.href ?? '/'
                        activeSectionRef.current = fallback
                        setActiveHomeNavHref(fallback)
                    }
                }
            },
            { threshold: 0, rootMargin }
        )

        // Observe nav anchor sections
        HOME_NAV_ANCHORS.forEach(({ id }) => {
            const el = document.getElementById(id)
            if (el) navObserver.observe(el)
        })

        // Use IntersectionObserver for presence sections — no layout reads on scroll
        const presenceObserver = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    const match = /^presence-(india|dubai|newyork)$/.exec(entry.target.id)
                    if (!match) continue
                    const id = match[1] as (typeof PRESENCE_ORDER)[number]
                    if (entry.isIntersecting) {
                        activePresenceRef.current = id
                        setActivePresenceId(id)
                    }
                }
            },
            { threshold: 0.15 }
        )

        PRESENCE_ORDER.forEach((id) => {
            const el = document.getElementById(`presence-${id}`)
            if (el) presenceObserver.observe(el)
        })

        // Hash change still supported
        const onHashChange = () => {
            const hashed = parsePresenceHash()
            if (hashed) {
                activePresenceRef.current = hashed
                setActivePresenceId(hashed)
            }
        }
        window.addEventListener('hashchange', onHashChange)

        // Initial check
        const initialActive = HOME_NAV_ANCHORS.reduce((best, { href, id }) => {
            const el = document.getElementById(id)
            if (!el) return best
            const rect = el.getBoundingClientRect()
            if (rect.top <= window.innerHeight * THRESHOLD) return { href, top: rect.top }
            return best
        }, null as { href: string; top: number } | null)
        if (initialActive) {
            activeSectionRef.current = initialActive.href
            setActiveHomeNavHref(initialActive.href)
        }

        return () => {
            navObserver.disconnect()
            presenceObserver.disconnect()
            window.removeEventListener('hashchange', onHashChange)
        }
    }, [pathname])

    const value = useMemo<SiteNavScrollContextValue>(() => {
        const isNavLinkActive = (href: string) => {
            if (href === '/') return pathname === '/' && activeHomeNavHref === '/'
            if (href.startsWith('/#')) return pathname === '/' && activeHomeNavHref === href
            return pathname === href
        }
        return {
            isNavLinkActive,
            isContactCtaActive: pathname === '/' && activeHomeNavHref === '/#contact',
            activePresenceId: pathname === '/' ? activePresenceId : 'dubai',
        }
    }, [pathname, activeHomeNavHref, activePresenceId])

    return <SiteNavScrollContext.Provider value={value}>{children}</SiteNavScrollContext.Provider>
}

export function useSiteNavScroll(): SiteNavScrollContextValue {
    const ctx = useContext(SiteNavScrollContext)
    if (!ctx) throw new Error('useSiteNavScroll must be used within SiteNavScrollProvider')
    return ctx
}