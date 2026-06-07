'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { FooterPresenceCityTicker } from '@/components/layout/FooterPresenceCityTicker'
import { useSiteNavScroll } from '@/providers/SiteNavScrollProvider'
import { FOOTER_PRESENCE_CARDS } from '@/data/footerPresence'
import { SITE_BRAND } from '@/lib/constants/site'
import { cn } from '@/lib/utils'
import { FooterCardInner, FooterNavContact, FOOTER_NAV_LINKS } from './footerShared'

export function FooterMobile() {
    const [inView, setInView] = useState(false)
    const { isNavLinkActive, activePresenceId } = useSiteNavScroll()

    useEffect(() => {
        const el = document.querySelector('[data-site-footer]')
        if (!el) return
        const obs = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setInView(true); obs.disconnect() } }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    return (
        <footer data-site-footer data-in-view={inView ? 'true' : 'false'} className="relative overflow-x-clip text-white" style={{ background: 'linear-gradient(0deg, #0E1825 7%, #1D3350 100%)' }}>
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
                            <FooterPresenceCityTicker cards={FOOTER_PRESENCE_CARDS} activePresenceId={activePresenceId} />
                        </div>
                    </div>
                </div>

                {/* Cards — stacked */}
                <div className="flex flex-col gap-5 mb-10">
                    {FOOTER_PRESENCE_CARDS.map((card) => (
                        <FooterCardInner key={card.id} card={card} />
                    ))}
                </div>

                {/* Watermark */}
                <div className="footer-reveal-watermark-wrap w-full mb-8 text-center">
                    <p className="footer-reveal-watermark pointer-events-none w-full text-center [font-family:var(--font-geist)] font-bold tracking-[-0.04em] leading-[0.92] text-[clamp(3rem,13vw,6rem)] select-none">
                        {SITE_BRAND.name}
                    </p>
                </div>

                {/* Nav + contact */}
                <div className="mb-6">
                    <FooterNavContact isNavLinkActive={isNavLinkActive} />
                </div>

                {/* Copyright */}
                <p className="footer-reveal-copyright text-center [font-family:var(--font-satoshi)] text-[12px] font-normal text-white/40">
                    © {new Date().getFullYear()} {SITE_BRAND.name}. All Rights Reserved.
                </p>
            </Container>
        </footer>
    )
}