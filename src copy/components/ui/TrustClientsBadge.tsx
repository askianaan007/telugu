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
        'border-brand-white/80 sm:rounded-card inline-flex rounded-[18px] border bg-white/26 p-2 shadow-[0_4px_7px_rgba(0,0,0,0.15)] backdrop-blur-[6px] sm:p-1.5 lg:rounded-[22px]',
        className
      )}
    >
      <div className="border-brand-white bg-brand-white inline-flex items-center gap-2 rounded-[14px] border p-2 sm:gap-2.5 sm:rounded-[16px] sm:p-2.5 md:p-2.5 lg:gap-2 lg:rounded-[18px] lg:p-2">
        <div className="flex -space-x-1.5 sm:-space-x-3">
          {avatars.map((avatar, index) => (
            <div
              key={avatar.src}
              className={cn(
                'border-brand-white bg-brand-black/5 relative h-8 w-8 overflow-hidden rounded-full border-2 sm:h-9 sm:w-9 md:h-9 md:w-9 lg:h-10 lg:w-10 xl:h-11 xl:w-11',
                index === 0 && 'z-30',
                index === 1 && 'z-20',
                index === 2 && 'z-10'
              )}
            >
              <Image
                src={avatar.src}
                alt={avatar.alt}
                fill
                sizes="(max-width: 1023px) 32px, 40px"
                className="object-cover"
              />
            </div>
          ))}
        </div>

        <div
          className={cn(
            'flex flex-col gap-0.5 sm:gap-1',
            align === 'right' ? 'text-right' : 'text-left'
          )}
        >
          <div
            className={cn('flex items-center gap-px', align === 'right' && 'justify-start')}
            aria-label="5 out of 5 stars"
          >
            <svg width="0" height="0" aria-hidden className="absolute">
              <defs>
                <linearGradient id="hero-stars-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--color-brand-gold-start)" />
                  <stop offset="50%" stopColor="var(--color-brand-gold-mid)" />
                  <stop offset="100%" stopColor="var(--color-brand-gold-end)" />
                </linearGradient>
              </defs>
            </svg>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className="h-3 w-3 sm:h-3.5 sm:w-3.5 lg:h-4 lg:w-4"
                style={{ fill: 'url(#hero-stars-gradient)' }}
                stroke="none"
                aria-hidden
              />
            ))}
          </div>
          <p className="text-[12px] leading-none font-medium sm:text-[13px] md:text-[13px] lg:text-[14px] xl:text-[15px]">
            <span className="text-brand-gray">{prefixText}</span>
            <span className="text-brand-black">{highlightText}</span>
          </p>
        </div>
      </div>
    </div>
  )
}
