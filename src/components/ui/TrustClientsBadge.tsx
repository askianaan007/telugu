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
            className={cn(
                // outer gradient shell — tighter padding on mobile
                'rounded-[16px] p-1',
                'sm:rounded-[20px] sm:p-1.5',
                'lg:rounded-[26px] lg:p-1.5',
                className,
            )}
            style={BADGE_OUTER_STYLE}
        >
            {/* Inner white card */}
            <div className={cn(
                'rounded-[13px] bg-white',
                // mobile: tight padding
                'px-2.5 py-2',
                'sm:rounded-[17px] sm:px-3 sm:py-2.5',
                'lg:rounded-3xl lg:px-3 lg:py-2.5',
            )}>
                <div className={cn(
                    'inline-flex items-center',
                    // gap between avatars group and text group
                    'gap-2 sm:gap-2.5 lg:gap-4',
                )}>
                    {/* Avatar stack */}
                    <div className="flex -space-x-1.5 sm:-space-x-2 lg:-space-x-3">
                        {avatars.map((avatar, index) => (
                            <div
                                key={avatar.src}
                                className={cn(
                                    'relative overflow-hidden rounded-full border-2 border-white',
                                    // mobile: 28px → sm: 32px → lg: 44px
                                    'h-7 w-7',
                                    'sm:h-8 sm:w-8',
                                    'lg:h-11 lg:w-11 xl:h-12 xl:w-12',
                                    index === 0 && 'z-30',
                                    index === 1 && 'z-20',
                                    index === 2 && 'z-10',
                                )}
                            >
                                <Image
                                    src={avatar.src}
                                    alt={avatar.alt}
                                    fill
                                    sizes="(max-width: 639px) 28px, (max-width: 1023px) 32px, 44px"
                                    className="object-cover"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Stars + label */}
                    <div className={cn(
                        'flex flex-col',
                        'gap-0.5 sm:gap-1',
                        align === 'right' ? 'items-start' : 'items-end',
                    )}>
                        <div
                            className={cn(
                                'flex items-center gap-0.5',
                                align === 'right' && 'justify-end',
                            )}
                            aria-label="5 out of 5 stars"
                        >
                            {STARS_SVG}
                            {Array.from({ length: 5 }).map((_, i) => (
                                <Star
                                    key={i}
                                    // mobile: 11px → sm: 13px → lg: 16px
                                    className="h-[11px] w-[11px] sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4 xl:h-[18px] xl:w-[18px]"
                                    style={STAR_STYLE}
                                    stroke="none"
                                    aria-hidden
                                />
                            ))}
                        </div>

                        <p className={cn(
                            'leading-none whitespace-nowrap',
                            // mobile: 10px → sm: 11px → lg: 13px
                            'text-[10px] sm:text-[11px] lg:text-[13px] xl:text-[14px]',
                        )}>
                            <span className="font-normal text-gray-500">{prefixText}</span>
                            <span className="font-bold text-gray-900">{highlightText}</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}