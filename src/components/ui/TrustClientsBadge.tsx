import { Star } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

type Avatar = {
    src: string
    alt: string
}

const HERO_CLIENT_AVATARS = [
    { src: '/images/hero-client-01.png', alt: 'Trusted client one' },
    { src: '/images/hero-client-02.png', alt: 'Trusted client two' },
    { src: '/images/hero-client-03.png', alt: 'Trusted client three' },
] as const satisfies readonly Avatar[]

const STARS_SVG = (
    <svg width="0" height="0" aria-hidden className="absolute">
        <defs>
            <linearGradient id="hero-stars-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#F5C518" />
                <stop offset="50%" stopColor="#FFD700" />
                <stop offset="100%" stopColor="#F0A500" />
            </linearGradient>
        </defs>
    </svg>
)

const STAR_STYLE = { fill: 'url(#hero-stars-gradient)' } as const

const BADGE_OUTER_STYLE = {
    background: 'linear-gradient(135deg, #E5ECF0 0%, #C8E6FF 40%, #B0D8F8 70%, #D0EAFF 100%)',
} as const

type TrustClientsBadgeProps = {
    avatars?: readonly Avatar[]
    prefixText?: string
    highlightText?: string
    align?: 'left' | 'right'
    className?: string
}

export function TrustClientsBadge({
    avatars = HERO_CLIENT_AVATARS,
    prefixText = 'Trusted by ',
    highlightText = '20k clients',
    align = 'left',
    className,
}: TrustClientsBadgeProps) {
    return (
        <div
            className={cn('rounded-[20px] p-[6px] sm:rounded-[22px] lg:rounded-[26px]', className)}
            style={BADGE_OUTER_STYLE}
        >
            <div className="rounded-[18px] bg-white px-3 py-2.5 sm:rounded-[20px] sm:px-4 sm:py-3 lg:rounded-[24px] lg:px-3 lg:py-2.5">
                <div className="inline-flex items-center gap-3 sm:gap-3.5 lg:gap-4">
                    <div className="flex -space-x-2 sm:-space-x-2.5 lg:-space-x-3">
                        {avatars.map((avatar, index) => (
                            <div
                                key={avatar.src}
                                className={cn(
                                    'relative h-9 w-9 overflow-hidden rounded-full border-2 border-white sm:h-10 sm:w-10 lg:h-11 lg:w-11 xl:h-12 xl:w-12',
                                    index === 0 && 'z-30',
                                    index === 1 && 'z-20',
                                    index === 2 && 'z-10'
                                )}
                            >
                                <Image
                                    src={avatar.src}
                                    alt={avatar.alt}
                                    fill
                                    sizes="(max-width: 1023px) 36px, 44px"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    <div className={cn('flex flex-col gap-1', align === 'right' ? 'items-start' : 'items-end')}>
                        <div
                            className={cn('flex items-center gap-0.5', align === 'right' && 'justify-end')}
                            aria-label="5 out of 5 stars"
                        >
                            {STARS_SVG}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    className="h-3.5 w-3.5 sm:h-4 sm:w-4 lg:h-[18px] lg:w-[18px]"
                                    style={STAR_STYLE}
                                    stroke="none"
                                    aria-hidden
                                />
                            ))}
                        </div>

                        <p className="text-[12px] leading-none sm:text-[13px] lg:text-[14px] xl:text-[15px]">
                            <span className="font-normal text-gray-500">{prefixText}</span>
                            <span className="font-bold text-gray-900">{highlightText}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}