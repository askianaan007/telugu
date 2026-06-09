// src/components/sections/about/AboutRevealCard.tsx
// ─────────────────────────────────────────────────
// Reusable image card + column used by all tiers.
//
// Changes from current project:
// • AboutRevealSquareCard gains isHandoff + registerHandoffCard props
// • AboutRevealColumn gains registerHandoffCard + registerMosaicAnchor props
// • Handoff card (reveal-06) is wrapped in an anchor div with data attrs
// • Non-handoff cards get ABOUT_HANDOFF_PEER_ATTR for GSAP peer targeting

import Image from 'next/image'
import { cn } from '@/lib/utils'
import {
    ABOUT_HANDOFF_CARD_ATTR,
    ABOUT_HANDOFF_IMAGE_ATTR,
    ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR,
    ABOUT_HANDOFF_PEER_ATTR,
    ABOUT_VISION_HANDOFF_IMAGE,
} from '@/lib/animations/aboutVisionHandoff'
import { CARD_CLASS, type RevealImage } from './aboutShared'

export function AboutRevealSquareCard({
    image,
    className,
    isHandoff = false,
    registerHandoffCard,
}: {
    image: RevealImage
    className?: string
    isHandoff?: boolean
    registerHandoffCard?: (el: HTMLDivElement | null) => void
}) {
    return (
        <div
            ref={isHandoff ? registerHandoffCard : undefined}
            {...(isHandoff
                ? { [ABOUT_HANDOFF_CARD_ATTR]: '' }
                : { [ABOUT_HANDOFF_PEER_ATTR]: '' }
            )}
            className={cn(CARD_CLASS, className)}
        >
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[12px] bg-linear-to-br from-transparent from-40% via-transparent via-55% to-[#090202]/8 sm:rounded-[18px] lg:rounded-2xl xl:rounded-[20px]"
            />
            <div
                {...(isHandoff ? { [ABOUT_HANDOFF_IMAGE_ATTR]: '' } : {})}
                className="relative z-1 size-full overflow-hidden rounded-[12px] border-2 border-white bg-white sm:rounded-[18px] lg:rounded-2xl xl:rounded-[20px]"
            >
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    quality={100}
                    priority={isHandoff}
                    sizes={
                        isHandoff
                            ? '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 40vw'
                            : image.sizes
                    }
                    className={cn(
                        'object-cover',
                        isHandoff ? 'object-[center_35%]' : 'object-center'
                    )}
                />
            </div>
        </div>
    )
}

export function AboutRevealColumn({
    images,
    keyPrefix,
    registerHandoffCard,
    registerMosaicAnchor,
}: {
    images: readonly RevealImage[]
    keyPrefix: string
    registerHandoffCard?: (el: HTMLDivElement | null) => void
    registerMosaicAnchor?: (el: HTMLElement | null) => void
}) {
    return (
        <div className="flex flex-col items-center gap-(--about-stack-gap) py-(--about-col-pad)">
            {images.map((image) => {
                const isHandoff = image.src === ABOUT_VISION_HANDOFF_IMAGE

                if (isHandoff) {
                    return (
                        <div
                            key={`${keyPrefix}-${image.src}`}
                            ref={registerMosaicAnchor}
                            {...{ [ABOUT_HANDOFF_MOSAIC_ANCHOR_ATTR]: '' }}
                            className="relative aspect-square w-(--about-card) shrink-0"
                        >
                            <AboutRevealSquareCard
                                image={image}
                                isHandoff
                                registerHandoffCard={registerHandoffCard}
                            />
                        </div>
                    )
                }

                return (
                    <AboutRevealSquareCard
                        key={`${keyPrefix}-${image.src}`}
                        image={image}
                        isHandoff={false}
                    />
                )
            })}
        </div>
    )
}