// src/components/sections/about/AboutRevealCard.tsx
// ─────────────────────────────────────────────────
// Reusable image card + column used by all tiers.

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { CARD_CLASS, type RevealImage } from './aboutShared'

export function AboutRevealSquareCard({
    image,
    className,
}: {
    image: RevealImage
    className?: string
}) {
    return (
        <div className={cn(CARD_CLASS, className)}>
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-[12px] bg-linear-to-br from-transparent from-40% via-transparent via-55% to-[#090202]/8 sm:rounded-[18px] lg:rounded-2xl xl:rounded-[20px]"
            />
            <div className="relative z-1 size-full overflow-hidden rounded-[12px] border-2 border-white bg-white sm:rounded-[18px] lg:rounded-2xl xl:rounded-[20px]">
                <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={image.sizes}
                    className="object-cover object-center"
                />
            </div>
        </div>
    )
}

export function AboutRevealColumn({
    images,
    keyPrefix,
}: {
    images: readonly RevealImage[]
    keyPrefix: string
}) {
    return (
        <div className="flex flex-col items-center gap-(--about-stack-gap) py-(--about-col-pad)">
            {images.map((image) => (
                <AboutRevealSquareCard
                    key={`${keyPrefix}-${image.src}`}
                    image={image}
                />
            ))}
        </div>
    )
}