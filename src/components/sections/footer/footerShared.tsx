'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type ReactNode } from 'react'
import { FOOTER_PRESENCE_CARDS } from '@/data/footerPresence'
import { SITE_BRAND } from '@/lib/constants/site'
import { cn } from '@/lib/utils'

export const FOOTER_NAV_LINKS = [
    { label: 'Home', href: '/' },
    { label: 'About Us', href: '/#about' },
    { label: 'Contact Us', href: '/#contact' },
] as const

export const CARD_PARALLAX_Y: readonly [string, string, string][] = [
    ['5%', '0%', '-26%'],
    ['7%', '0%', '-36%'],
    ['10%', '0%', '-48%'],
]

export function ContactLine({ children }: { children: ReactNode }) {
    return (
        <div className="flex items-center gap-[15px]">
            <span aria-hidden className="h-[21px] shrink-0 bg-[#8E8E8E]" style={{ width: '1px' }} />
            <span className="text-brand-navy [font-family:var(--font-geist)] text-base leading-normal font-normal tracking-[-0.0051em]">
                {children}
            </span>
        </div>
    )
}

export function FooterCardInner({ card }: { card: (typeof FOOTER_PRESENCE_CARDS)[number] }) {
    return (
        <div
            role="article"
            aria-label={`${card.title}, ${card.address}`}
            className={cn(
                'footer-reveal-card border-about-reveal-frame-outer-border bg-about-reveal-frame-outer/95 flex h-full min-h-0 w-full cursor-default flex-col rounded-[28px] border p-2 text-left shadow-[0_14px_44px_-18px_rgba(9,9,11,0.16)] backdrop-blur-sm',
                'h-full md:h-[320px] md:shrink-0 lg:h-[300px] xl:h-[387px]',
            )}
        >
            <div className="border-about-reveal-inner-border bg-about-reveal-inner-bg relative flex h-full min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-[22px] border-2 p-6 sm:p-4">
                <div aria-hidden className="bg-global-presence-inner-sky-radial pointer-events-none absolute inset-0 z-0 rounded-2xl" />
                <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col justify-between gap-0">
                    <div className="relative flex shrink-0 items-start justify-between gap-3">
                        <h3 className={cn(
                            'text-brand-navy relative z-20 min-w-0 flex-1 overflow-visible [font-family:var(--font-halant)] font-normal whitespace-nowrap',
                            'text-[2rem] leading-[2.35rem] tracking-[-0.02em]',
                            'sm:text-[2.25rem] sm:leading-10 sm:tracking-[-0.03em]',
                            'md:text-[2.5rem] md:leading-[2.85rem] md:tracking-[-0.035em]',
                            'lg:text-[3rem] lg:leading-13 lg:tracking-[-0.04em]',
                            'xl:text-[70px] xl:leading-[84.5px] xl:tracking-[-5.68px]',
                        )}>
                            {card.title}
                        </h3>
                        <div className="relative z-10 h-[72px] w-10 shrink-0 sm:h-[84px] sm:w-11">
                            <Image src="/images/footer-card-bar-code.svg" alt="" fill className="object-contain object-top" />
                        </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-5 pt-8 pb-2 sm:gap-6 sm:pt-8 md:pt-0 xl:pt-8">
                        <div className="relative h-[58px] w-[58px] shrink-0 drop-shadow-[0_12px_20px_-8px_rgba(88,28,135,0.35)]">
                            <Image src="/images/gradient-gold-circle.png" alt="" width={58} height={58} className="h-[58px] w-[58px] object-contain" />
                        </div>
                        <div className="flex min-w-0 flex-col gap-2.5">
                            <ContactLine>{card.address}</ContactLine>
                            <ContactLine>{card.phone}</ContactLine>
                            <ContactLine>{card.email}</ContactLine>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

import { FooterPresenceCityTicker } from '@/components/layout/FooterPresenceCityTicker'

export function FooterGlobalPresenceHeader({ activePresenceId }: { activePresenceId?: string }) {
    return (
        <div className={cn(
            'mx-auto grid w-full max-w-full grid-cols-1 items-center justify-items-center gap-y-3 sm:gap-y-4',
            'md:w-max md:max-w-full md:grid-cols-[auto_auto_13.5rem] md:items-center md:gap-x-6 md:gap-y-0 lg:grid-cols-[auto_auto_14rem] lg:gap-x-8',
        )}>
            <span className="text-center [font-family:var(--font-geist)] text-xs font-medium tracking-[0.18em] text-white/90 uppercase sm:text-[15px] lg:text-[18px] xl:text-[22px]">
                Global Presence
            </span>
            <div className="flex shrink-0 items-center justify-center gap-[10px]" aria-hidden>
                <span className="h-px w-[clamp(40px,18vw,65px)] shrink-0 origin-center scale-x-[-1] bg-[linear-gradient(90deg,rgba(255,255,255)_0%,rgb(255,255,255,0)_100%)] md:w-[65px]" />
                <Image src="/images/footer-plane.svg" alt="" width={24} height={24} className="h-6 w-6 shrink-0" />
                <span className="h-px w-[clamp(40px,18vw,65px)] shrink-0 origin-center scale-x-[-1] bg-[linear-gradient(90deg,rgb(255,255,255,0)_0%,rgba(255,255,255)_100%)] md:w-[65px]" />
            </div>
            <div className="mx-auto flex w-full max-w-[min(100%,13.5rem)] justify-center justify-self-center md:block md:w-54 md:max-w-none lg:w-56">
                <FooterPresenceCityTicker cards={FOOTER_PRESENCE_CARDS} activePresenceId={activePresenceId} />
            </div>
        </div>
    )
}

export function FooterNavContact({ isNavLinkActive }: { isNavLinkActive: (href: string) => boolean }) {
    return (
        <div className="mx-auto flex w-full max-w-[1200px] flex-row items-start justify-between">
            <nav aria-label="Footer">
                <ul className="flex flex-col gap-2 sm:gap-3">
                    {FOOTER_NAV_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link href={link.href} className={cn('[font-family:var(--font-geist)] text-[16px] font-medium text-white/80 transition-colors hover:text-white sm:text-[18px] md:text-[20px]', isNavLinkActive(link.href) && 'font-semibold text-white')}>
                                {link.label}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>
            <div className="flex flex-col items-end gap-1.5 text-right">
                <a href={`mailto:${SITE_BRAND.contactEmail}`} className="[font-family:var(--font-geist)] text-[16px] font-medium text-white/80 transition-colors hover:text-white sm:text-[18px] md:text-[20px]">
                    {SITE_BRAND.contactEmail}
                </a>
                <a href={`tel:${SITE_BRAND.contactPhone.replace(/\s/g, '')}`} className="[font-family:var(--font-geist)] text-[16px] font-medium text-white/80 transition-colors hover:text-white sm:text-[18px] md:text-[20px]">
                    {SITE_BRAND.contactPhone}
                </a>
            </div>
        </div>
    )
}