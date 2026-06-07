'use client'

import { motion as m } from 'framer-motion'
import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ContactBg, ContactFormCard, ContactHeading, CONTACT_FORM_INITIAL } from './contactShared'

const EASE = [0.22, 1, 0.36, 1] as const

export function ContactMobile() {
    const [form, setForm] = useState(CONTACT_FORM_INITIAL)

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
        const { name, value } = e.target
        setForm((prev) => ({ ...prev, [name]: value }))
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setForm(CONTACT_FORM_INITIAL)
    }

    return (
        <Section id="contact" variant="default" paddingY="none" className="bg-brand-surface relative overflow-hidden pb-20">
            <ContactBg />
            <Container className="max-w-base relative z-10">
                <div className="mx-auto flex w-full max-w-[920px] flex-col items-center">
                    <m.div
                        initial={{ opacity: 0, y: 24 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: '-8%' }}
                        transition={{ duration: 0.7, ease: EASE }}
                    >
                        <ContactHeading />
                    </m.div>
                    <m.div
                        initial={{ opacity: 0, y: 32, scale: 0.98 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true, margin: '-6%' }}
                        transition={{ duration: 0.75, ease: EASE, delay: 0.08 }}
                        className="w-full"
                    >
                        <ContactFormCard form={form} onChange={handleChange} onSubmit={handleSubmit} />
                    </m.div>
                </div>
            </Container>
        </Section>
    )
}