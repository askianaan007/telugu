'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { FooterPresenceCityTicker } from '@/components/layout/FooterPresenceCityTicker'
import { useSiteNavScroll } from '@/providers/SiteNavScrollProvider'
import { FOOTER_PRESENCE_CARDS } from '@/data/footerPresence'
import { SITE_BRAND } from '@/lib/constants/site'
import { cn } from '@/lib/utils'
import { FooterCardInner, FooterNavContact } from './footerShared'

export function FooterMobile() {
    const footerRef = useRef<HTMLElement>(null)
    const [inView, setInView] = useState(false)
    const { isNavLinkActive, activePresenceId } = useSiteNavScroll()

    useEffect(() => {
        const el = footerRef.current
        if (!el) return
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry?.isIntersecting) { setInView(true); obs.disconnect() } },
            { rootMargin: '0px 0px -8% 0px', threshold: 0.05 }
        )
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    return (
        <footer
            ref={footerRef}
            data-site-footer
            data-in-view={inView ? 'true' : 'false'}
            className="relative overflow-x-clip text-white"
            style={{ background: 'linear-gradient(0deg, #0E1825 7%, #1D3350 100%)' }}
        >
            <Container className="max-w-base px-4 pt-14 pb-10">
                {/* Global presence header */}
                <div className="mb-8 flex flex-col items-center gap-4">
                    <div className="grid w-full grid-cols-1 items-center justify-items-center gap-y-3">
                        <span className="text-center [font-family:var(--font-geist)] text-xs font-medium tracking-[0.18em] text-white/90 uppercase">
                            Global Presence
                        </span>
                        <div className="flex items-center gap-[10px]" aria-hidden>
                            <span className="h-px w-[clamp(40px,18vw,65px)] shrink-0 scale-x-[-1] bg-[linear-gradient(90deg,rgba(255,255,255)_0%,rgb(255,255,255,0)_100%)]" />
                            <Image src="/images/footer-plane.svg" alt="" width={24} height={24} className="h-6 w-6 shrink-0" />
                            <span className="h-px w-[clamp(40px,18vw,65px)] shrink-0 scale-x-[-1] bg-[linear-gradient(90deg,rgb(255,255,255,0)_0%,rgba(255,255,255)_100%)]" />
                        </div>
                        <div className="mx-auto w-full max-w-[min(100%,13.5rem)]">
                            <FooterPresenceCityTicker cards={FOOTER_PRESENCE_CARDS} activePresenceId={activePresenceId ?? undefined} />
                        </div>
                    </div>
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-5 mb-10">
                    {FOOTER_PRESENCE_CARDS.map((card) => (
                        <FooterCardInner key={card.id} card={card} />
                    ))}
                </div>

                {/* Watermark — always visible on mobile, no opacity-0 from CSS class */}
                <div className="w-full mb-8 text-center">
                    <p
                        className="pointer-events-none w-full text-center [font-family:var(--font-geist)] font-bold tracking-[-0.04em] leading-[0.92] select-none text-[clamp(3rem,13vw,6rem)]"
                        style={{
                            color: 'transparent',
                            WebkitTextFillColor: 'transparent',
                            backgroundImage: 'linear-gradient(180deg, #5a9fd4 0%, #0e1825 50%, #5a9fd4 100%)',
                            backgroundSize: '100% 200%',
                            backgroundPositionX: 'center',
                            backgroundPositionY: '60%',
                            backgroundRepeat: 'no-repeat',
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            opacity: 0.7,
                        }}
                    >
                        {SITE_BRAND.name}
                    </p>
                </div>

                {/* Nav + contact — always visible */}
                <div className="mb-6 opacity-100">
                    <FooterNavContact isNavLinkActive={isNavLinkActive} />
                </div>

                {/* Copyright — always visible */}
                <p className="text-center [font-family:var(--font-satoshi)] text-[12px] font-normal text-white/40">
                    © {new Date().getFullYear()} {SITE_BRAND.name}. All Rights Reserved.
                </p>
            </Container>
        </footer>
    )
}