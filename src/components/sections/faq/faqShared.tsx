'use client'

import { m } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import Image from 'next/image'
import { type KeyboardEvent, useId } from 'react'
import { type FaqItem } from '@/data/faq'
import { fadeInUp, staggerContainer } from '@/lib/animations/motion'
import { faqAccordionInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

export function FaqAccordionCard({
    item,
    isOpen,
    onToggle,
}: {
    item: FaqItem
    isOpen: boolean
    onToggle: () => void
}) {
    const answerId = useId()
    const headingId = useId()

    const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            onToggle()
        }
    }

    return (
        <article
            data-faq-card
            role="button"
            tabIndex={0}
            aria-expanded={isOpen}
            aria-controls={answerId}
            aria-label={`${item.question}. ${isOpen ? 'Collapse' : 'Expand'} answer`}
            onClick={onToggle}
            onKeyDown={handleKeyDown}
            className={cn(
                'w-full shrink-0 cursor-pointer overflow-hidden rounded-[24px] border border-black/8 p-2',
                'xl:w-[650px] xl:max-w-[650px]',
                'focus-visible:ring-brand-gold-mid/60 focus-visible:ring-offset-brand-surface outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
            )}
        >
            <m.div layout className={cn(faqAccordionInnerClassName(), 'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]')}>
                <Image src="/images/faq-card-bg.png" alt="" fill sizes="(max-width: 1024px) 100vw, 645px" className="pointer-events-none rounded-2xl object-cover object-center" aria-hidden />
                <m.div layout className="relative z-10 flex w-full flex-col">
                    <div className="flex min-h-[40px] items-center gap-3">
                        <h3 id={headingId} className="text-brand-charcoal min-w-0 flex-1 [font-family:var(--font-geist)] text-[18px] leading-[1.4] font-normal tracking-[-0.01em]">
                            {item.question}
                        </h3>
                        <span aria-hidden className="text-brand-charcoal flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                            {isOpen ? <Minus className="h-6 w-6" strokeWidth={2} /> : <Plus className="h-6 w-6" strokeWidth={2} />}
                        </span>
                    </div>
                    <m.div
                        id={answerId}
                        role="region"
                        aria-labelledby={headingId}
                        initial={false}
                        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0, marginTop: isOpen ? 12 : 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                    >
                        <p className="pr-2 pb-1 [font-family:var(--font-geist)] text-base leading-6 text-[#707070]">
                            {item.answer}
                        </p>
                    </m.div>
                </m.div>
            </m.div>
        </article>
    )
}

export function FaqLeftPanel({ reduceMotion }: { reduceMotion: boolean | null }) {
    return (
        <m.aside
            variants={staggerContainer(0.1, 0.06)}
            initial={reduceMotion ? false : 'hidden'}
            whileInView={reduceMotion ? undefined : 'visible'}
            viewport={{ once: false, amount: 0.35, margin: '0px 0px -8% 0px' }}
            className="flex w-full shrink-0 flex-col gap-5 lg:w-[40%] lg:max-w-[min(100%,480px)] lg:self-start lg:pt-2"
        >
            <m.div variants={fadeInUp} className="flex flex-col items-start gap-2.5">
                <span className="inline-flex items-center gap-2">
                    <Image src="/images/black-asterisk.svg" width={14} height={14} alt="" className="h-[14px] w-[14px] shrink-0" aria-hidden />
                    <span className="text-brand-charcoal [font-family:var(--font-geist)] text-[14px] font-medium tracking-[0.2em] uppercase">
                        FAQ&apos;S
                    </span>
                </span>
                <Image src="/images/header-line-transparent-left.svg" width={364} height={12} alt="" className="h-auto w-full max-w-[364px] shrink-0" aria-hidden />
            </m.div>
            <m.h2
                variants={fadeInUp}
                className={cn(
                    'text-brand-charcoal text-left [font-family:var(--font-halant)] font-normal tracking-[-0.04em] text-balance',
                    'text-[clamp(2rem,3.5vw+1rem,4.375rem)] leading-[1.15] sm:leading-[1.2] xl:text-[70px] xl:leading-[88px]',
                )}
            >
                Answers to Your Top Questions
            </m.h2>
            <m.p variants={fadeInUp} className="text-brand-gray max-w-[408px] [font-family:var(--font-geist)] text-lg leading-normal">
                From booking assistance to baggage details, our FAQs cover everything you need to know.
            </m.p>
        </m.aside>
    )
}