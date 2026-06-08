'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useMemo,
    useRef,
    useState,
} from 'react'
import { cn } from '@/lib/utils'
import { ActionButton } from '@/components/ui/ActionButton'

const NAV_LINKS = [
    { label: 'Home', href: '#hero' },
    { label: 'About Us', href: '#about' },
    { label: 'Models', href: '#our-models' },
]

const SCROLL_HIDE_AFTER_Y = 20
const SCROLL_DOWN_HIDE_DELTA = 6
const SCROLL_UP_SHOW_DELTA = -10

export default function Header() {
    const [open, setOpen] = useState(false)
    const [scrollHidden, setScrollHidden] = useState(false)
    const [hideOffsetY, setHideOffsetY] = useState(-100)
    const lastScrollY = useRef(0)
    const headerRef = useRef<HTMLElement>(null)
    const pendingRef = useRef(false)
    const reduceMotion = useReducedMotion()

    // FIX 1: moved inside the component so it can access setOpen
    const handleNavClick = useCallback(
        (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
            e.preventDefault()
            const id = href.replace('#', '')
            const element = document.getElementById(id)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                window.history.replaceState(null, '', href)
            }
            setOpen(false)
        },
        []
    )

    useLayoutEffect(() => {
        const el = headerRef.current
        if (!el) return
        const update = () => setHideOffsetY(-(el.offsetHeight + 50))
        update()
        const ro = new ResizeObserver(update)
        ro.observe(el)
        return () => ro.disconnect()
    }, [])

    useEffect(() => {
        lastScrollY.current = window.scrollY
    }, [])

    useEffect(() => {
        const onScroll = () => {
            if (pendingRef.current) return
            pendingRef.current = true
            requestAnimationFrame(() => {
                pendingRef.current = false
                if (open) {
                    setScrollHidden(false)
                    lastScrollY.current = window.scrollY
                    return
                }
                const y = window.scrollY
                const dy = y - lastScrollY.current
                lastScrollY.current = y
                if (y < SCROLL_HIDE_AFTER_Y) { setScrollHidden(false); return }
                if (dy > SCROLL_DOWN_HIDE_DELTA) setScrollHidden(true)
                else if (dy < SCROLL_UP_SHOW_DELTA) setScrollHidden(false)
            })
        }
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [open])

    useEffect(() => {
        document.body.style.overflow = open ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [open])

    const headerVariants = useMemo(() => ({
        visible: {
            y: 0, opacity: 1, scale: 1,
            transition: {
                y: { type: 'spring' as const, stiffness: 260, damping: 30, mass: 0.88 },
                opacity: { duration: 0.52 },
                scale: { duration: 0.48 },
            },
        },
        hidden: {
            y: hideOffsetY, opacity: 0, scale: 0.97,
            transition: {
                y: { type: 'tween' as const, duration: 0.22 },
                opacity: { duration: 0.18 },
                scale: { duration: 0.20 },
            },
        },
    }), [hideOffsetY])

    const glassStyle = useMemo(() => ({
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        border: '1.5px solid rgba(255,255,255,0.25)',
        boxShadow: '0 8px 32px 0 rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.22)',
    }), [])

    const mobileNavStyle = useMemo(() => ({
        background: 'rgba(18,31,47,0.92)',
        backdropFilter: 'blur(32px)',
        WebkitBackdropFilter: 'blur(32px)',
        border: '1.5px solid rgba(255,255,255,0.12)',
        boxShadow: '0 20px 40px -12px rgba(0,0,0,0.4)',
    }), [])

    return (
        <>
            <motion.header
                ref={headerRef}
                initial={false}
                variants={reduceMotion ? undefined : headerVariants}
                animate={reduceMotion ? { y: 0, opacity: 1, scale: 1 } : scrollHidden ? 'hidden' : 'visible'}
                className={cn(
                    'fixed inset-x-0 z-50 origin-top will-change-transform',
                    'top-7 px-8',
                    'sm:top-10 sm:px-10',
                    'md:top-10 md:px-10',
                    'lg:top-10 lg:px-10',
                    scrollHidden && 'pointer-events-none',
                )}
            >
                <div
                    className={cn(
                        'mx-auto flex items-center justify-between gap-2 rounded-[70px]',
                        'min-h-12 px-2 py-1',
                        'sm:min-h-13 sm:px-2.5 sm:py-1.5',
                        'lg:min-h-14 lg:max-w-4xl lg:gap-8 lg:px-4',
                        'xl:gap-12',
                    )}
                    style={glassStyle}
                >
                    {/* FIX 2: was `link.href` (undefined variable), now correctly '#hero' */}
                    <Link
                        href="#hero"
                        onClick={(e) => handleNavClick(e, '#hero')}
                        className="relative flex min-w-0 shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-3"
                    >
                        <span className="relative flex shrink-0 items-center justify-start overflow-hidden">
                            <Image
                                src="/images/telugu-air-logo.png"
                                alt="Telugu Airlines"
                                width={320}
                                height={100}
                                priority
                                className="h-7 w-auto max-w-11 object-contain object-left sm:h-8 sm:max-w-12 lg:h-11 lg:max-w-15"
                            />
                        </span>
                        <span className="flex flex-col gap-0.5">
                            <Image
                                src="/images/logo-text.png"
                                alt="Telugu Airlines"
                                width={420}
                                height={84}
                                priority
                                className="h-3.5 w-auto max-w-22 object-contain object-left sm:h-4.25 sm:max-w-32 lg:h-7 lg:max-w-65"
                            />
                        </span>
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={(e) => handleNavClick(e, link.href)}
                                className="group relative font-sans text-[15px] font-bold uppercase tracking-[0.06em] text-brand-black transition-colors"
                            >
                                {link.label}
                                <span
                                    aria-hidden
                                    className="absolute inset-x-0 -bottom-1 h-0.5 origin-left scale-x-0 bg-linear-to-r from-[#ca8b37] to-brand-gold-mid transition-transform duration-300 group-hover:scale-x-100"
                                />
                            </Link>
                        ))}
                    </nav>

                    {/* Right side: CTA + hamburger */}
                    <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="scale-[0.78] origin-right sm:scale-[0.85] lg:scale-100">
                            <ActionButton href="#contact" label="Contact Us" className="inline-flex" />
                        </div>
                        {/* FIX 5: added aria-controls for accessibility */}
                        <button
                            type="button"
                            onClick={() => setOpen((v) => !v)}
                            aria-label={open ? 'Close menu' : 'Open menu'}
                            aria-expanded={open}
                            aria-controls="mobile-nav"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/15 bg-black/8 text-brand-black backdrop-blur-md transition-colors hover:bg-black/15 sm:h-9 sm:w-9 lg:hidden"
                        >
                            {open
                                ? <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                : <Menu className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            }
                        </button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile nav drawer */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        className="fixed inset-0 z-40 lg:hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setOpen(false)}
                            aria-hidden
                        />
                        {/* FIX 3 & 5: added id for aria-controls; mobile links now use handleNavClick for smooth scroll */}
                        <motion.nav
                            id="mobile-nav"
                            className="absolute inset-x-3 top-16.5 max-h-[min(560px,calc(100dvh-8rem))] overflow-y-auto rounded-3xl p-5 sm:inset-x-4 sm:top-20 sm:p-6"
                            style={mobileNavStyle}
                            initial={{ y: -24, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: -24, opacity: 0 }}
                            transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                            aria-label="Mobile navigation"
                        >
                            <ul className="space-y-1">
                                {NAV_LINKS.map((link) => (
                                    <li key={link.href}>
                                        <Link
                                            href={link.href}
                                            onClick={(e) => handleNavClick(e, link.href)}
                                            className="flex items-center justify-between rounded-2xl px-4 py-3 font-sans text-[14px] font-bold uppercase tracking-[0.06em] text-white/80 transition-colors hover:bg-white/8 hover:text-white sm:py-3.5 sm:text-[15px]"
                                        >
                                            {link.label}
                                            <ArrowRight className="h-4 w-4 text-[#ca8b37]" aria-hidden />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="mt-5 border-t border-white/10 pt-5">
                                <ActionButton
                                    href="#contact"
                                    label="Contact Us"
                                    fullWidth
                                    className="w-full justify-between"
                                />
                            </div>
                        </motion.nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}