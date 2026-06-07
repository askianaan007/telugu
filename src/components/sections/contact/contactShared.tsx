'use client'

import React from 'react'
import Image from 'next/image'
import { ActionButton } from '@/components/ui/ActionButton'

export type ContactForm = {
    name: string
    email: string
    phone: string
    subject: string
    message: string
}

export const CONTACT_FORM_INITIAL: ContactForm = { name: '', email: '', phone: '', subject: '', message: '' }

export function ContactField({ label, htmlFor, children }: { label: string; htmlFor: string; children: React.ReactNode }) {
    return (
        <label htmlFor={htmlFor} className="block space-y-2" data-contact-field>
            <span className="text-brand-charcoal [font-family:var(--font-geist)] text-[13px] leading-none font-medium">
                {label}
            </span>
            {children}
        </label>
    )
}

const INPUT_CLS = 'text-brand-charcoal placeholder:text-brand-muted/35 focus-visible:border-brand-navy/30 h-12 w-full rounded-[12px] border border-[#d1d5db] bg-white px-3.5 text-[16px] focus-visible:outline-none'

export function ContactFormCard({
    form,
    onChange,
    onSubmit,
}: {
    form: ContactForm
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void
}) {
    return (
        <div data-contact-form-card className="w-full max-w-[542px] will-change-transform xl:max-w-[542px]">
            <form
                onSubmit={onSubmit}
                className="border-about-reveal-frame-outer-border bg-about-reveal-frame-outer/95 w-full rounded-[28px] border-white p-2 shadow-[0_14px_44px_-18px_rgba(9,9,11,0.16)] backdrop-blur-sm"
            >
                <div className="border-about-reveal-inner-border bg-about-reveal-inner-bg rounded-2xl border-2 p-6 sm:p-8 xl:p-[36px]">
                    <div className="space-y-4 sm:space-y-5">
                        <ContactField label="Name" htmlFor="name">
                            <input id="name" name="name" type="text" required value={form.name} onChange={onChange} placeholder="Jane Smith" className={INPUT_CLS} />
                        </ContactField>
                        <ContactField label="Email" htmlFor="email">
                            <input id="email" name="email" type="email" required value={form.email} onChange={onChange} placeholder="you@example.com" className={INPUT_CLS} />
                        </ContactField>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <ContactField label="Phone" htmlFor="phone">
                                <input id="phone" name="phone" type="tel" value={form.phone} onChange={onChange} placeholder="+0 254 258 5896" className={INPUT_CLS} />
                            </ContactField>
                            <ContactField label="Subject" htmlFor="subject">
                                <input id="subject" name="subject" type="text" value={form.subject} onChange={onChange} placeholder="Travel" className={INPUT_CLS} />
                            </ContactField>
                        </div>
                        <ContactField label="Write Something" htmlFor="message">
                            <textarea id="message" name="message" rows={4} value={form.message} onChange={onChange} placeholder="Ask your doubts..."
                                className="text-brand-charcoal placeholder:text-brand-muted/35 focus-visible:border-brand-navy/30 min-h-[120px] w-full resize-none rounded-[12px] border border-[#d1d5db] bg-white px-3.5 py-3 text-[16px] focus-visible:outline-none" />
                        </ContactField>
                    </div>
                    <div className="mt-6" data-contact-cta>
                        <ActionButton type="submit" label="Send Message" fullWidth />
                    </div>
                </div>
            </form>
        </div>
    )
}

export function ContactHeading() {
    return (
        <div data-contact-heading className="mb-8 flex flex-col items-center gap-2.5 text-center will-change-transform sm:mb-10">
            <span className="text-brand-black inline-flex items-center gap-2">
                <Image src="/images/black-asterisk.svg" width={14} height={14} alt="" className="h-[14px] w-[14px] shrink-0" aria-hidden />
                <span className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.2em] uppercase">
                    Get In Touch
                </span>
            </span>
            <Image src="/images/header-line-transparent-lite.svg" width={364} height={12} alt="" className="h-auto w-[min(364px,calc(100vw-4rem))] max-w-full shrink-0" aria-hidden />
            <h2 className="text-brand-black max-w-[14ch] [font-family:var(--font-halant)] text-[clamp(2.05rem,3.2vw+1rem,3.75rem)] leading-[1.06] font-normal tracking-[-0.03em] text-balance lg:max-w-[998px]">
                Seamless Aviation Support & Global Charter Solutions
            </h2>
        </div>
    )
}

export function ContactBg() {
    return (
        <div className="absolute inset-0 z-0">
            <div data-contact-bg-image className="relative h-full w-full will-change-transform">
                <Image src="/images/contat-us-bg.jpg" alt="" fill sizes="100vw" className="object-cover object-center" aria-hidden />
                <div aria-hidden className="from-brand-surface via-brand-surface/72 pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b to-transparent" />
            </div>
        </div>
    )
}