'use client'

import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { ArrowRight, Menu, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { useSiteNavScroll } from '@/components/providers/SiteNavScrollProvider'
import { ActionButton } from '@/components/ui/ActionButton'
import { easings } from '@/lib/animations/easings'
import { NAV_LINKS } from '@/lib/constants/site'
import { cn } from '@/lib/utils'

const SCROLL_HIDE_AFTER_Y = 20
const SCROLL_DOWN_HIDE_DELTA = 6
const SCROLL_UP_SHOW_DELTA = -10

const VISIBLE_VARIANTS = {
  y: 0,
  opacity: 1,
  scale: 1,
  transition: {
    y: { type: 'spring' as const, stiffness: 280, damping: 32, mass: 0.8 },
    opacity: { duration: 0.4, ease: easings.smooth },
    scale: { duration: 0.4, ease: easings.smooth },
  },
}

function buildHiddenVariants(offsetY: number) {
  return {
    y: offsetY,
    opacity: 0,
    scale: 0.97,
    transition: {
      y: { type: 'tween' as const, duration: 0.2, ease: easings.smooth },
      opacity: { duration: 0.16, ease: easings.smooth },
      scale: { duration: 0.18, ease: easings.smooth },
    },
  }
}

export function SiteHeader() {
  const [open, setOpen] = useState(false)
  const [scrollHidden, setScrollHidden] = useState(false)
  const [hideOffsetY, setHideOffsetY] = useState(-120)

  const pathname = usePathname()
  const { isNavLinkActive, isContactCtaActive } = useSiteNavScroll()
  const reduceMotion = useReducedMotion()

  const headerRef = useRef<HTMLElement>(null)
  const lastScrollY = useRef(0)
  const openRef = useRef(open)
  const rafRef = useRef<number>(0)
  const prevPathnameRef = useRef(pathname)

  useEffect(() => {
    openRef.current = open
  }, [open])

  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      prevPathnameRef.current = pathname
      setOpen(false)
      setScrollHidden(false)
    }
  }, [pathname])

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
      if (rafRef.current) return
      rafRef.current = requestAnimationFrame(() => {
        rafRef.current = 0
        if (openRef.current) {
          setScrollHidden(false)
          lastScrollY.current = window.scrollY
          return
        }
        const y = window.scrollY
        const dy = y - lastScrollY.current
        lastScrollY.current = y
        if (y < SCROLL_HIDE_AFTER_Y) {
          setScrollHidden(false)
          return
        }
        if (dy > SCROLL_DOWN_HIDE_DELTA) setScrollHidden(true)
        else if (dy < SCROLL_UP_SHOW_DELTA) setScrollHidden(false)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = 0
      }
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const hiddenVariants = buildHiddenVariants(hideOffsetY)

  return (
    <>
      <m.header
        ref={headerRef}
        initial={false}
        animate={
          reduceMotion
            ? { y: 0, opacity: 1, scale: 1 }
            : scrollHidden
              ? hiddenVariants
              : VISIBLE_VARIANTS
        }
        className={cn(
          'z-header fixed inset-x-0 top-4 origin-top px-4 will-change-transform',
          'sm:top-5 sm:px-6',
          'md:top-6 md:px-8',
          'lg:top-6 lg:px-10',
          scrollHidden && 'pointer-events-none'
        )}
      >
        <div
          className={cn(
            'mx-auto flex min-h-[60px] max-w-7xl items-center justify-between gap-3',
            'rounded-[70px] border border-white/20 bg-white/20',
            'shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_8px_32px_rgba(0,0,0,0.1)]',
            'backdrop-blur-sm px-3 py-2',
            'sm:min-h-[64px] sm:gap-4 sm:px-4',
            'lg:w-fit lg:justify-end lg:gap-12 lg:py-0 lg:px-3',
            'xl:gap-20',
            '2xl:gap-[120px]'
          )}
        >
          <Link
            href="/"
            aria-label="Telugu Airlines home"
            className="group/logo relative flex min-w-0 shrink-0 items-center gap-2 sm:gap-3"
          >
            <span
              aria-hidden
              className="relative flex shrink-0 items-center justify-start overflow-hidden"
            >
              <Image
                src="/images/telugu-air-logo.png"
                alt="Telugu Airlines"
                width={320}
                height={100}
                priority
                className={cn(
                  'h-7 w-auto object-contain object-left',
                  'max-w-[min(48vw,180px)]',
                  'sm:h-8 sm:max-w-[200px]',
                  'md:h-9 md:max-w-[240px]',
                  'lg:h-10 lg:max-w-[280px]'
                )}
              />
            </span>
            <span className="relative flex min-w-0 shrink-0 items-center">
              <Image
                src="/images/logo-text.png"
                alt="Telugu Airlines — Ivanni Manavi"
                width={420}
                height={84}
                priority
                className={cn(
                  'h-5 w-auto object-contain object-left',
                  'max-w-[min(52vw,220px)]',
                  'sm:h-6 sm:max-w-[260px]',
                  'md:h-7 md:max-w-[300px]',
                  'lg:h-8 lg:max-w-[340px]'
                )}
              />
            </span>
          </Link>

          <nav className="hidden items-center gap-5 lg:flex" aria-label="Primary">
            {NAV_LINKS.map((link) => {
              const isActive = isNavLinkActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'group relative text-[15px] font-bold uppercase tracking-[-0.02em]',
                    'text-brand-black transition-colors duration-200',
                    'hover:text-brand-button focus-visible:text-brand-button',
                    isActive && 'text-brand-button'
                  )}
                >
                  {link.label}
                  <span
                    aria-hidden
                    className={cn(
                      'bg-brand-button absolute inset-x-0 -bottom-0.5 h-[2px] origin-left',
                      'scale-x-0 transition-transform duration-300 group-hover:scale-x-100',
                      isActive && 'scale-x-100'
                    )}
                  />
                </Link>
              )
            })}
          </nav>

          <ActionButton href="/#contact" label="Contact Us" className="hidden lg:inline-flex" />

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            className={cn(
              'border-brand-black/15 bg-brand-white/70 text-brand-black',
              'inline-flex h-10 w-10 items-center justify-center rounded-full',
              'border-[0.5px] backdrop-blur-md transition-colors duration-200',
              'hover:bg-brand-white active:scale-95',
              'sm:h-11 sm:w-11',
              'lg:hidden'
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {open ? (
                <m.span
                  key="close"
                  initial={{ rotate: -45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 45, opacity: 0 }}
                  transition={{ duration: 0.18, ease: easings.smooth }}
                >
                  <X className="h-4 w-4 sm:h-5 sm:w-5" />
                </m.span>
              ) : (
                <m.span
                  key="menu"
                  initial={{ rotate: 45, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -45, opacity: 0 }}
                  transition={{ duration: 0.18, ease: easings.smooth }}
                >
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                </m.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </m.header>

      <AnimatePresence>
        {open && (
          <m.div
            className="z-overlay fixed inset-0 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: easings.smooth }}
          >
            <div
              className="bg-brand-black/50 absolute inset-0 backdrop-blur-sm"
              onClick={() => setOpen(false)}
              aria-hidden
            />

            <m.nav
              initial={{ y: -24, opacity: 0, scale: 0.98 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -16, opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'rounded-card border-brand-black/8 bg-brand-white/96 absolute',
                'inset-x-4 top-[calc(4rem+72px)]',
                'sm:inset-x-6 sm:top-[calc(5rem+72px)]',
                'md:inset-x-8',
                'max-h-[min(520px,calc(100dvh-9rem))] overflow-y-auto',
                'border p-5 shadow-[0_24px_48px_-12px_rgba(9,9,11,0.18)]',
                'backdrop-blur-[24px]',
                'sm:p-6'
              )}
              aria-label="Mobile navigation"
            >
              <ul className="space-y-0.5">
                {NAV_LINKS.map((link) => {
                  const isActive = isNavLinkActive(link.href)
                  return (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          'group flex items-center justify-between rounded-2xl px-4 py-3.5',
                          'text-[15px] font-bold uppercase tracking-[-0.02em]',
                          'text-brand-black transition-colors duration-200',
                          'hover:bg-brand-black/5 hover:text-brand-button',
                          'active:bg-brand-black/8',
                          'sm:text-[16px]',
                          isActive && 'text-brand-button bg-brand-black/4'
                        )}
                      >
                        {link.label}
                        <ArrowRight
                          aria-hidden
                          className={cn(
                            'h-4 w-4 transition-all duration-200',
                            'group-hover:translate-x-0.5',
                            isActive
                              ? 'text-brand-button'
                              : 'text-brand-black/40 group-hover:text-brand-button'
                          )}
                        />
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="border-brand-black/10 mt-4 border-t pt-4 sm:mt-5 sm:pt-5">
                <ActionButton
                  href="/#contact"
                  label="Contact Us"
                  tone="dark"
                  className={cn(
                    'w-full justify-between',
                    isContactCtaActive &&
                    'ring-brand-button ring-2 ring-offset-2 ring-offset-white'
                  )}
                />
              </div>
            </m.nav>
          </m.div>
        )}
      </AnimatePresence>
    </>
  )
}