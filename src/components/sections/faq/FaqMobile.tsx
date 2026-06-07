'use client'

import { motion as m, useReducedMotion, useScroll, useSpring, useTransform } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { type KeyboardEvent, useId, useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { FAQ_ITEMS, type FaqItem } from '@/data/faq'
import { faqAccordionInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

function FaqAccordionCard({ item, isOpen, onToggle }: { item: FaqItem; isOpen: boolean; onToggle: () => void }) {
    const answerId = useId()
    const headingId = useId()
    const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onToggle() } }
    return (
        <article
            data-faq-card role="button" tabIndex={0}
            aria-expanded={isOpen} aria-controls={answerId}
            aria-label={`${item.question}. ${isOpen ? 'Collapse' : 'Expand'} answer`}
            onClick={onToggle} onKeyDown={handleKeyDown}
            className="w-full shrink-0 cursor-pointer overflow-hidden rounded-[24px] border border-black/8 p-2 outline-none focus-visible:ring-2 focus-visible:ring-brand-gold-mid/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-surface"
        >
            <m.div layout className={cn(faqAccordionInnerClassName(), 'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]')}>
                <Image src="/images/faq-card-bg.png" alt="" fill sizes="100vw" className="pointer-events-none rounded-2xl object-cover object-center" aria-hidden />
                <m.div layout className="relative z-10 flex w-full flex-col">
                    <div className="flex min-h-[40px] items-center gap-3">
                        <h3 id={headingId} className="text-brand-charcoal min-w-0 flex-1 [font-family:var(--font-geist)] text-[18px] leading-[1.4] font-normal tracking-[-0.01em]">{item.question}</h3>
                        <span aria-hidden className="text-brand-charcoal flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                            {isOpen ? <Minus className="h-6 w-6" strokeWidth={2} /> : <Plus className="h-6 w-6" strokeWidth={2} />}
                        </span>
                    </div>
                    <m.div id={answerId} role="region" aria-labelledby={headingId} initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? 12 : 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }} className="overflow-hidden">
                        <p className="pr-2 pb-1 [font-family:var(--font-geist)] text-base leading-6 text-[#707070]">{item.answer}</p>
                    </m.div>
                </m.div>
            </m.div>
        </article>
    )
}

export function FaqMobile() {
    const scrollTrackRef = useRef<HTMLDivElement>(null)
    const reduceMotion = useReducedMotion()
    const [openId, setOpenId] = useState<string | null>(null)
    const handleToggle = (id: string) => setOpenId((c) => (c === id ? null : id))

    const { scrollYProgress } = useScroll({
        target: scrollTrackRef,
        offset: ['start end', 'end start'],
    })

    const rawCardsY = useTransform(scrollYProgress, [0, 1], ['4%', '-8%'])
    const cardsY = useSpring(rawCardsY, { stiffness: 90, damping: 18, mass: 0.6 })

    return (
        <Section id="faq" variant="dark" paddingY="none" className="bg-brand-surface overflow-visible">
            <div ref={scrollTrackRef} className="relative w-full">
                <div className="flex w-full flex-col pt-12 pb-20">
                    <Container className="max-w-base flex w-full flex-col gap-8 px-4">
                        {/* Header — plain div, always visible */}
                        <div className="flex w-full flex-col gap-5">
                            <div className="flex flex-col items-start gap-2.5">
                                <span className="inline-flex items-center gap-2">
                                    <Image src="/images/black-asterisk.svg" width={14} height={14} alt="" className="h-[14px] w-[14px] shrink-0" aria-hidden />
                                    <span className="text-brand-charcoal [font-family:var(--font-geist)] text-[14px] font-medium tracking-[0.2em] uppercase">FAQ&apos;S</span>
                                </span>
                                <Image src="/images/header-line-transparent-left.svg" width={364} height={12} alt="" className="h-auto w-full max-w-[364px] shrink-0" aria-hidden />
                            </div>
                            <h2 className="text-brand-charcoal text-left [font-family:var(--font-halant)] font-normal tracking-[-0.04em] text-balance text-[clamp(2rem,7vw,2.75rem)] leading-[1.15]">
                                Answers to Your Top Questions
                            </h2>
                            <p className="text-brand-gray [font-family:var(--font-geist)] text-base leading-normal">
                                From booking assistance to baggage details, our FAQs cover everything you need to know.
                            </p>
                        </div>

                        {/* Cards with scroll-driven parallax */}
                        <m.div
                            className="flex w-full flex-col gap-4"
                            style={reduceMotion ? undefined : { y: cardsY }}
                        >
                            {FAQ_ITEMS.map((item) => (
                                <FaqAccordionCard key={item.id} item={item} isOpen={openId === item.id} onToggle={() => handleToggle(item.id)} />
                            ))}
                        </m.div>
                    </Container>
                </div>
            </div>
        </Section>
    )
}