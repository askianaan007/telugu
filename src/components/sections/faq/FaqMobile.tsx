'use client'

import { useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { FAQ_ITEMS } from '@/data/faq'
import { FaqAccordionCard, FaqLeftPanel } from './faqShared'

export function FaqMobile() {
    const reduceMotion = useReducedMotion()
    const [openId, setOpenId] = useState<string | null>(null)
    const handleToggle = (id: string) => setOpenId((c) => (c === id ? null : id))

    return (
        <Section id="faq" variant="dark" paddingY="none" className="bg-brand-surface overflow-visible">
            <div className="relative w-full">
                <div className="flex w-full flex-col pt-8 pb-20">
                    <Container className="max-w-base flex w-full flex-col gap-10">
                        <FaqLeftPanel reduceMotion={reduceMotion} />
                        <div className="flex w-full flex-col gap-5">
                            {FAQ_ITEMS.map((item) => (
                                <FaqAccordionCard key={item.id} item={item} isOpen={openId === item.id} onToggle={() => handleToggle(item.id)} />
                            ))}
                        </div>
                    </Container>
                </div>
            </div>
        </Section>
    )
}