'use client'

import { m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { FooterPresenceCityTicker } from '@/components/layout/FooterPresenceCityTicker'
import { useSiteNavScroll } from '@/providers/SiteNavScrollProvider'
import { FOOTER_PRESENCE_CARDS } from '@/data/footerPresence'
import { SITE_BRAND } from '@/lib/constants/site'
import { cn } from '@/lib/utils'
import { FooterCardInner, FooterNavContact, CARD_PARALLAX_Y } from './footerShared'

const FooterRotatingEarth = dynamic(() => import('@/components/ui/RotatingEarth'), {
    ssr: false,
    loading: () => (
        <div className="mx-auto size-[min(92vw,800px)] max-h-[800px] shrink-0 rounded-lg border border-white/10 bg-[#162a40]/50" style={{ aspectRatio: '1', minHeight: 280 }} aria-hidden />
    ),
})

export function FooterDesktop() {
    const footerRef = useRef<HTMLElement>(null)
    const footerScrollTrackRef = useRef<HTMLDivElement>(null)
    const watermarkRevealRef = useRef<HTMLDivElement>(null)
    const [inView, setInView] = useState(false)
    const { isNavLinkActive, activePresenceId } = useSiteNavScroll()
    const reduceMotion = useReducedMotion()

    const { scrollYProgress } = useScroll({ target: footerScrollTrackRef, offset: ['start start', 'end end'] })
    const { scrollYProgress: watermarkGradientProgress } = useScroll({ target: watermarkRevealRef, offset: ['center end', 'center start'] })
    const springConfig = { stiffness: 72, damping: 28, mass: 0.55 }
    const smoothProgress = useSpring(scrollYProgress, springConfig)

    const headerOpacity = useSpring(useTransform(smoothProgress, [0, 0.15, 0.25], [1, 1, 0]), springConfig)
    const headerY = useSpring(useTransform(smoothProgress, [0, 0.15, 0.25], ['0%', '0%', '-12%']), springConfig)

    const cardY0 = useSpring(useTransform(smoothProgress, [0, 0.25, 0.45], CARD_PARALLAX_Y[0]), springConfig)
    const cardY1 = useSpring(useTransform(smoothProgress, [0, 0.25, 0.45], CARD_PARALLAX_Y[1]), springConfig)
    const cardY2 = useSpring(useTransform(smoothProgress, [0, 0.25, 0.45], CARD_PARALLAX_Y[2]), springConfig)
    const cardParallaxY = [cardY0, cardY1, cardY2]
    const cardsOpacity = useTransform(smoothProgress, [0.15, 0.35], [1, 0])

    const wmOpacity = useSpring(useTransform(smoothProgress, [0.2, 0.4], [0, 1]), springConfig)
    const wmY = useSpring(useTransform(smoothProgress, [0.2, 0.45], ['50vh', '0vh']), { stiffness: 60, damping: 26, mass: 0.5 })

    const globeScale = useSpring(useTransform(smoothProgress, [0.25, 0.55], [1.1, 0.4]), { stiffness: 60, damping: 26, mass: 0.5 })
    const globeY = useSpring(useTransform(smoothProgress, [0.22, 0.55], ['90vh', '11vh']), { stiffness: 60, damping: 26, mass: 0.5 })

    const navContentY = useSpring(useTransform(scrollYProgress, [0.5, 0.68, 0.82, 1], ['50vh', '20vh', '0vh', '-8vh']), { stiffness: 76, damping: 24, mass: 0.48 })
    const navContentOpacity = useSpring(useTransform(scrollYProgress, [0.48, 0.62], [0, 1]), springConfig)

    const wmGradientPos = useSpring(useTransform(watermarkGradientProgress, [0.32, 0.5, 0.68], ['0%', '100%', '100%']), { stiffness: 52, damping: 34, mass: 0.7 })

    const motionEnabled = reduceMotion !== true

    useEffect(() => {
        const el = footerRef.current
        if (!el) return
        const obs = new IntersectionObserver(([entry]) => { if (entry?.isIntersecting) { setInView(true); obs.disconnect() } }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 })
        obs.observe(el)
        return () => obs.disconnect()
    }, [])

    return (
        <footer ref={footerRef} data-site-footer data-in-view={inView ? 'true' : 'false'} className="relative overflow-x-clip text-white" style={{ background: 'linear-gradient(0deg, #0E1825 7%, #1D3350 100%)' }}>
            <div ref={footerScrollTrackRef} className="relative min-h-[320vh] w-full">
                {/* Sticky viewport layer */}
                <div className="sticky top-0 z-10 h-dvh w-full overflow-hidden">
                    {/* Watermark */}
                    <m.div className="absolute inset-x-0 top-0 z-0 flex items-start justify-center pt-[1vh]" style={motionEnabled ? { opacity: wmOpacity, y: wmY } : undefined}>
                        <div ref={watermarkRevealRef} className="footer-reveal-watermark-wrap w-full">
                            <m.p
                                className="footer-reveal-watermark pointer-events-none relative z-0 w-full max-w-full text-center [font-family:var(--font-geist)] font-bold tracking-[-0.04em] leading-[0.92] text-[clamp(3rem,13vw,6rem)] sm:text-[clamp(3.25rem,12vw,7rem)] lg:text-[clamp(7rem,13vw,9rem)] xl:text-[clamp(9rem,12vw,10rem)] 2xl:text-[11rem] select-none"
                                style={motionEnabled ? { backgroundPositionX: 'center', backgroundPositionY: wmGradientPos } : undefined}
                            >
                                {SITE_BRAND.name}
                            </m.p>
                        </div>
                    </m.div>

                    {/* Globe */}
                    <m.div className="absolute inset-0 z-10 flex items-center justify-center" style={motionEnabled ? { scale: globeScale, y: globeY } : undefined}>
                        <div className="footer-reveal-globe-wrap w-full">
                            <div className="footer-reveal-globe relative flex justify-center px-2">
                                <div className="relative w-full max-w-[min(96vw,860px)] overflow-hidden sm:max-w-[min(94vw,920px)] lg:max-w-[min(92vw,1000px)] xl:max-w-[min(90vw,1100px)] 2xl:max-w-[1180px]">
                                    <FooterRotatingEarth className="mx-auto" oceanColor="transparent" dotColor="rgba(255,255,255,0.5)" gridColor="rgba(255,255,255,0.06)" rotationSpeed={0.25} />
                                </div>
                            </div>
                        </div>
                    </m.div>

                    {/* Nav + contact */}
                    <m.div className="absolute inset-x-0 z-30 px-6 sm:px-8 lg:px-12" style={motionEnabled ? { y: navContentY, opacity: navContentOpacity, top: '62%' } : { top: '62%' }}>
                        <FooterNavContact isNavLinkActive={isNavLinkActive} />
                    </m.div>

                    {/* Copyright */}
                    <m.div className="absolute inset-x-0 bottom-0 z-30 flex justify-center pb-4 sm:pb-5" style={motionEnabled ? { opacity: navContentOpacity } : undefined}>
                        <p className="footer-reveal-copyright [font-family:var(--font-satoshi)] text-[12px] font-normal text-white/40 sm:text-[13px]">
                            © {new Date().getFullYear()} {SITE_BRAND.name}. All Rights Reserved.
                        </p>
                    </m.div>
                </div>

                {/* Scrollable content layer */}
                <div className="absolute inset-x-0 top-0 z-20 min-h-[100vh] w-full">
                    <div className="sticky top-0 min-h-dvh">
                        <Container className="max-w-base relative px-4 pt-14 pb-10 sm:px-6 sm:pt-16 sm:pb-12 lg:pt-20 lg:pb-16">
                            <m.div className="relative z-20 mb-10 flex flex-col items-center gap-4 sm:mb-12 lg:mb-14" style={motionEnabled ? { opacity: headerOpacity, y: headerY } : undefined}>
                                <div className={cn('mx-auto grid w-full max-w-full grid-cols-1 items-center justify-items-center gap-y-3 sm:gap-y-4', 'md:w-max md:max-w-full md:grid-cols-[auto_auto_13.5rem] md:items-center md:gap-x-6 md:gap-y-0 lg:grid-cols-[auto_auto_14rem] lg:gap-x-8')}>
                                    <span className="text-center [font-family:var(--font-geist)] text-xs font-medium tracking-[0.18em] text-white/90 uppercase sm:text-[15px] lg:text-[18px] xl:text-[22px]">Global Presence</span>
                                    <div className="flex shrink-0 items-center justify-center gap-[10px]" aria-hidden>
                                        <span className="h-px w-[clamp(40px,18vw,65px)] shrink-0 origin-center scale-x-[-1] bg-[linear-gradient(90deg,rgba(255,255,255)_0%,rgb(255,255,255,0)_100%)] md:w-[65px]" />
                                        <Image src="/images/footer-plane.svg" alt="" width={24} height={24} className="h-6 w-6 shrink-0" />
                                        <span className="h-px w-[clamp(40px,18vw,65px)] shrink-0 origin-center scale-x-[-1] bg-[linear-gradient(90deg,rgb(255,255,255,0)_0%,rgba(255,255,255)_100%)] md:w-[65px]" />
                                    </div>
                                    <div className="mx-auto flex w-full max-w-[min(100%,13.5rem)] justify-center justify-self-center md:block md:w-54 md:max-w-none lg:w-56">
                                        <FooterPresenceCityTicker cards={FOOTER_PRESENCE_CARDS} activePresenceId={activePresenceId} />
                                    </div>
                                </div>
                            </m.div>

                            <m.div style={motionEnabled ? { opacity: cardsOpacity } : undefined}>
                                <div className={cn('max-w-base mx-auto grid grid-cols-1 gap-5', 'md:relative md:block md:gap-0 md:pb-4', 'md:min-h-[calc(10.5rem+20rem+20rem+2rem)]', 'lg:min-h-[calc(200px+300px+300px+2rem)]', 'xl:min-h-[clamp(28rem,50vw,42rem)]')}>
                                    {FOOTER_PRESENCE_CARDS.map((card, index) => {
                                        const cascade = index === 0
                                            ? cn('md:absolute md:left-0 md:top-0 md:z-[1]', 'md:w-[min(100%,calc(50%-0.75rem))] md:max-w-md', 'lg:w-[min(100%,22rem)]', 'xl:absolute xl:w-[min(100%,22rem)] xl:max-w-md')
                                            : index === 1
                                                ? cn('md:absolute md:right-0 md:z-[2]', 'md:top-[clamp(8.5rem,20vw,10.5rem)]', 'md:w-[min(100%,calc(50%-0.75rem))] md:max-w-md', 'lg:top-[200px] lg:w-[min(100%,22rem)]', 'xl:absolute xl:left-1/2 xl:right-auto xl:top-[320px] xl:z-[2] xl:w-[min(100%,22rem)] xl:max-w-md')
                                                : cn('md:absolute md:left-1/2 md:z-[3] md:-translate-x-1/2', 'md:top-[calc(10.5rem+20rem+1.25rem)]', 'md:w-[min(100%,20rem)] md:max-w-md', 'lg:top-[calc(200px+300px+1.5rem)] lg:w-[min(100%,22rem)]', 'xl:absolute xl:left-auto xl:right-0 xl:top-[180px] xl:z-[3] xl:translate-x-0 xl:w-[min(100%,22rem)] xl:max-w-md')
                                        const py = cardParallaxY[index] ?? cardY0
                                        return (
                                            <m.div key={card.id} className={cn('h-full min-h-0 w-full will-change-transform', cascade)} style={motionEnabled ? { y: py } : undefined}>
                                                {index === 1 ? <div className="h-full min-h-0 w-full xl:-translate-x-1/2"><FooterCardInner card={card} /></div> : <FooterCardInner card={card} />}
                                            </m.div>
                                        )
                                    })}
                                </div>
                            </m.div>
                        </Container>
                    </div>
                </div>
            </div>
        </footer>
    )
}