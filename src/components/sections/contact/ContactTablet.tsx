'use client'

import { useReducedMotion } from 'framer-motion'
import { useRef, useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { gsap, useGSAP } from '@/lib/animations/gsap'
import { ContactBg, ContactFormCard, ContactHeading, CONTACT_FORM_INITIAL } from './contactShared'

export function ContactTablet() {
    const sectionRef = useRef<HTMLElement>(null)
    const prefersReducedMotion = useReducedMotion()
    const [form, setForm] = useState(CONTACT_FORM_INITIAL)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setForm(CONTACT_FORM_INITIAL)
    }

    useGSAP(
        () => {
            const root = sectionRef.current
            if (!root) return

            const reduceMotion = Boolean(prefersReducedMotion) || window.matchMedia('(prefers-reduced-motion: reduce)').matches
            const bg = root.querySelector<HTMLElement>('[data-contact-bg-image]')
            const heading = root.querySelector<HTMLElement>('[data-contact-heading]')
            const formCard = root.querySelector<HTMLElement>('[data-contact-form-card]')
            const fields = root.querySelectorAll<HTMLElement>('[data-contact-field]')
            const cta = root.querySelector<HTMLElement>('[data-contact-cta]')

            if (!bg || !heading || !formCard) return

            if (reduceMotion) {
                gsap.set([heading, formCard, ...fields, ...(cta ? [cta] : [])], { clearProps: 'all' })
                gsap.set(bg, { clearProps: 'all' })
                return
            }

            gsap.set(bg, { transformOrigin: '50% 50%', scale: 1.06, yPercent: -2 })
            gsap.set(heading, { y: 32, opacity: 0.2 })
            gsap.set(formCard, { y: 44, opacity: 0, scale: 0.98 })
            gsap.set(fields, { y: 14, opacity: 0 })
            if (cta) gsap.set(cta, { y: 10, opacity: 0 })

            const tl = gsap.timeline({
                scrollTrigger: { trigger: root, start: 'top 88%', end: '+=120%', scrub: 0.88, invalidateOnRefresh: true },
            })

            tl.to(bg, { yPercent: 6, scale: 1.01, ease: 'none' }, 0)
            tl.to(heading, { y: 0, opacity: 1, ease: 'none', duration: 0.32 }, 0.04)
            tl.to(formCard, { y: 0, opacity: 1, scale: 1, ease: 'none', duration: 0.34 }, 0.1)
            tl.to(fields, { y: 0, opacity: 1, stagger: { each: 0.06, ease: 'none' }, duration: 0.3 }, 0.2)
            if (cta) tl.to(cta, { y: 0, opacity: 1, ease: 'none', duration: 0.24 }, 0.32)

            return () => { tl.scrollTrigger?.kill(); tl.kill() }
        },
        { scope: sectionRef, dependencies: [prefersReducedMotion] },
    )

    return (
        <Section id="contact" ref={sectionRef} variant="default" paddingY="none" className="bg-brand-surface relative overflow-hidden pb-24 md:pb-28">
            <ContactBg />
            <Container className="max-w-base relative z-10">
                <div className="mx-auto flex w-full max-w-[920px] flex-col items-center">
                    <ContactHeading />
                    <ContactFormCard form={form} onChange={handleChange} onSubmit={handleSubmit} />
                </div>
            </Container>
        </Section>
    )
}