'use client'

// src/components/sections/whychoose/whyChooseShared.tsx

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { faqAccordionInnerClassName } from '@/lib/ui/aboutRevealShell'
import { cn } from '@/lib/utils'

// ─── Data ─────────────────────────────────────────────────────────────────────

export type ImagePosition = 'center' | 'top-left' | 'top-right'

export type WhyChooseItem = {
    title: string
    description: string
    image: string
    imageWidth: number
    imageHeight: number
    imagePosition: ImagePosition
}

export const WHY_CHOOSE_ITEMS: WhyChooseItem[] = [
    {
        title: 'Highly Qualified Personnel',
        description: 'Our team comprises experienced pilots, engineers, and aviation specialists who bring a wealth of knowledge and expertise to every aspect of our operations.',
        image: '/images/why-choose-highly-qualified-personnel.svg',
        imageWidth: 214, imageHeight: 123, imagePosition: 'center',
    },
    {
        title: 'Commitment to Safety',
        description: 'We prioritize safety above all else, ensuring strict compliance with international aviation safety regulations and standards to guarantee a secure flying experience for all passengers.',
        image: '/images/why-choose-commitment-to-safety.svg',
        imageWidth: 333, imageHeight: 139, imagePosition: 'center',
    },
    {
        title: 'State-of-the-Art Fleet',
        description: 'Our fleet consists of modern, well-maintained helicopters equipped with the latest technology, providing reliability and comfort during every flight.',
        image: '/images/why-choose-state-of-the-art-fleet.svg',
        imageWidth: 223, imageHeight: 127, imagePosition: 'center',
    },
    {
        title: 'Competitive Pricing',
        description: 'Our services are competitively priced, providing clients with exceptional value without compromising on quality or safety.',
        image: '/images/why-choose-competitive-pricing.svg',
        imageWidth: 362, imageHeight: 190, imagePosition: 'top-left',
    },
    {
        title: 'Comprehensive Expertise',
        description: 'Our capabilities extend beyond charter operations, encompassing all facets of aviation, including infrastructure development and maintenance services.',
        image: '/images/why-choose-comprehensive-expertise.svg',
        imageWidth: 327, imageHeight: 119, imagePosition: 'center',
    },
    {
        title: 'Personalized Services',
        description: 'We offer customized solutions tailored to the unique requirements of our clients, ensuring that each service meets their specific needs and preferences.',
        image: '/images/why-choose-personalized-services.svg',
        imageWidth: 142, imageHeight: 142, imagePosition: 'center',
    },
    {
        title: 'Flexible Scheduling',
        description: 'We understand the importance of time, which is why we offer flexible scheduling options to accommodate the varying needs of our clients.',
        image: '/images/why-choose-flexible-scheduling.svg',
        imageWidth: 273, imageHeight: 119, imagePosition: 'center',
    },
    {
        title: 'Exceptional Customer Support',
        description: 'We pride ourselves on outstanding customer service, with a dedicated support team ready to assist clients at every stage.',
        image: '/images/why-choose-exceptional-customer-support.svg',
        imageWidth: 300, imageHeight: 300, imagePosition: 'top-right',
    },
    {
        title: 'Proven Track Record',
        description: 'With a history of successful operations and satisfied clients, Telugu Airlines has established itself as a trusted name in the aviation industry, known for reliability and excellence.',
        image: '/images/why-choose-proven-track-record.svg',
        imageWidth: 351, imageHeight: 136, imagePosition: 'center',
    },
    {
        title: 'Environmental Responsibility',
        description: 'We are committed to sustainable practices, actively working to minimize our environmental impact through eco-friendly initiatives and efficient operation.',
        image: '/images/why-choose-environmental-responsibility.svg',
        imageWidth: 367, imageHeight: 136, imagePosition: 'center',
    },
]

// ─── Image position helpers ────────────────────────────────────────────────────

export const IMAGE_POSITION_CLASSES: Record<ImagePosition, { wrapper: string; image: string }> = {
    center: {
        wrapper: 'flex w-full shrink-0 justify-center',
        image: 'object-contain object-center',
    },
    'top-left': {
        wrapper: 'flex w-full shrink-0 justify-start',
        image: 'object-contain object-left-top',
    },
    'top-right': {
        wrapper: 'flex w-full shrink-0 justify-end',
        image: 'object-contain object-right-top',
    },
}

// ─── WhyChooseCard ────────────────────────────────────────────────────────────

export function WhyChooseCard({
    item,
    side,
}: {
    item: WhyChooseItem
    side: 'left' | 'right' | 'top' | 'bottom'
}) {
    const positionClasses = IMAGE_POSITION_CLASSES[item.imagePosition]
    const isCornerLayout = item.imagePosition === 'top-left' || item.imagePosition === 'top-right'
    const cardRef = useRef<HTMLElement>(null)
    const [isInView, setIsInView] = useState(false)

    useEffect(() => {
        const el = cardRef.current
        if (!el) return
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { setIsInView(true); observer.unobserve(el) } },
            { threshold: 0.1, rootMargin: '0px 0px -5% 0px' },
        )
        observer.observe(el)
        return () => observer.disconnect()
    }, [])

    return (
        <article
            ref={cardRef}
            data-why-card
            data-side={side}
            className={cn(
                'relative w-full overflow-hidden rounded-[24px] border border-black/8 p-2 transition-all duration-700 ease-out',
                isInView ? 'is-visible' : '',
                (side === 'top' || side === 'bottom') && 'flex flex-col',
            )}
        >
            <div className={cn(
                faqAccordionInnerClassName(),
                'relative flex h-full min-h-0 flex-col gap-0! overflow-hidden px-0! py-0!',
                'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]',
            )}>
                <Image
                    src="/images/faq-card-bg.png"
                    alt="" fill
                    sizes="(max-width: 1024px) 100vw, 400px"
                    className="pointer-events-none rounded-2xl object-cover object-center"
                    aria-hidden
                />
                <div className={cn(
                    'relative z-10 flex min-h-full flex-1 flex-col',
                    (side === 'top' || side === 'bottom') && 'flex-1',
                    isCornerLayout ? 'gap-0' : 'gap-4 p-5 sm:p-6',
                )}>
                    <div
                        className={positionClasses.wrapper}
                        style={!isCornerLayout ? { minHeight: `${item.imageHeight}px` } : undefined}
                    >
                        <Image
                            src={item.image}
                            alt=""
                            width={item.imageWidth}
                            height={item.imageHeight}
                            className={cn(
                                positionClasses.image,
                                'h-auto max-w-full why-choose-svg',
                                item.image.split('/').pop()?.replace('.svg', ''),
                                isCornerLayout && 'max-h-[min(190px,38vw)] w-auto',
                            )}
                            style={{
                                width: isCornerLayout ? 'auto' : `${item.imageWidth}px`,
                                height: isCornerLayout ? 'auto' : `${item.imageHeight}px`,
                                maxWidth: `${item.imageWidth}px`,
                            }}
                        />
                    </div>
                    <div className={cn(
                        'flex flex-col gap-2',
                        isCornerLayout && (
                            item.imagePosition === 'top-right'
                                ? '-mt-8 px-5 pb-5 sm:px-6 sm:pb-6'
                                : 'mt-auto px-5 pb-5 sm:px-6 sm:pb-6'
                        ),
                    )}>
                        <h3 className="text-brand-black [font-family:var(--font-halant)] text-[clamp(1.45rem,1.8vw+0.85rem,2rem)] leading-[1.05] font-medium tracking-[-0.02em]">
                            {item.title}
                        </h3>
                        <p className="text-brand-muted [font-family:var(--font-geist)] text-[15px] leading-relaxed">
                            {item.description}
                        </p>
                    </div>
                </div>
            </div>
        </article>
    )
}

// ─── Section header ────────────────────────────────────────────────────────────

export function WhyChooseSectionHeader() {
    return (
        <div className="mx-auto max-w-3xl space-y-5 text-center">
            <span className="text-brand-black inline-flex items-center justify-center gap-2">
                <Image src="/images/black-asterisk.svg" width={14} height={14} alt=""
                    className="h-[14px] w-[14px] shrink-0" aria-hidden />
                <span className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.2em] uppercase">
                    Why Choose
                </span>
            </span>
            <Image
                src="/images/header-line-center-transparent.svg"
                width={364} height={12} alt=""
                className="mx-auto h-auto w-[min(364px,calc(100vw-4rem))] max-w-full shrink-0" aria-hidden
            />
            <h2 className="text-brand-black [font-family:var(--font-halant)] text-[clamp(2.2rem,4vw+0.8rem,4rem)] leading-[1.08] font-normal tracking-[-0.03em] text-balance">
                Why Choose Telugu Airlines?
            </h2>
            <p className="text-brand-muted [font-family:var(--font-geist)] text-base leading-relaxed sm:text-lg">
                Telugu Airlines maintains a robust international footprint through strategically located
                offices in major global cities.
            </p>
        </div>
    )
}