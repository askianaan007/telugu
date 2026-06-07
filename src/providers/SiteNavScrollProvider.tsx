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

function activationLinePx(): number {
    return Math.min(window.innerHeight * 0.28, 260) + 96
}

function parsePresenceHash(): (typeof PRESENCE_ORDER)[number] | null {
    const m = /^#presence-(india|dubai|newyork)$/.exec(window.location.hash)
    return m ? (m[1] as (typeof PRESENCE_ORDER)[number]) : null
}

function computeState(): { navHref: string; presenceId: string } {
    const line = activationLinePx()

    const navRects = HOME_NAV_ANCHORS.map(({ href, id }) => {
        const el = document.getElementById(id)
        return { href, top: el ? el.getBoundingClientRect().top : Infinity }
    })

    let navHref = '/'
    for (const { href, top } of navRects) {
        if (top <= line) navHref = href
    }

    const contactTop = navRects.find(r => r.href === '/#contact')?.top ?? Infinity
    const inContact = contactTop <= line

    if (inContact || navHref === '/#contact') {
        return { navHref, presenceId: parsePresenceHash() ?? 'dubai' }
    }

    const presenceRects = PRESENCE_ORDER.map(id => {
        const el = document.getElementById(`presence-${id}`)
        return { id, top: el ? el.getBoundingClientRect().top : Infinity }
    })

    let scrollPick: string | null = null
    for (const { id, top } of presenceRects) {
        if (top <= line) scrollPick = id
    }

    const hashed = parsePresenceHash()
    const presenceId = scrollPick ?? hashed ?? 'dubai'

    return { navHref, presenceId }
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
    const rafRef = useRef<number | null>(null)

    const tick = useCallback(() => {
        rafRef.current = null
        if (pathname !== '/') {
            setActiveHomeNavHref('/')
            setActivePresenceId('dubai')
            return
        }
        const { navHref, presenceId } = computeState()
        setActiveHomeNavHref(prev => (prev === navHref ? prev : navHref))
        setActivePresenceId(prev => (prev === presenceId ? prev : presenceId))
    }, [pathname])

    const scheduleTick = useCallback(() => {
        if (rafRef.current !== null) return
        rafRef.current = window.requestAnimationFrame(tick)
    }, [tick])

    useEffect(() => {
        window.addEventListener('scroll', scheduleTick, { passive: true })
        window.addEventListener('resize', scheduleTick, { passive: true })
        window.addEventListener('hashchange', scheduleTick)
        rafRef.current = window.requestAnimationFrame(tick)
        return () => {
            if (rafRef.current !== null) window.cancelAnimationFrame(rafRef.current)
            window.removeEventListener('scroll', scheduleTick)
            window.removeEventListener('resize', scheduleTick)
            window.removeEventListener('hashchange', scheduleTick)
        }
    }, [scheduleTick, tick])

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