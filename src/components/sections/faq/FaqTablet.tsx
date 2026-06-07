'use client'

import { useReducedMotion } from 'framer-motion'
import { useState } from 'react'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { FAQ_ITEMS } from '@/data/faq'
import { FaqAccordionCard, FaqLeftPanel } from './faqShared'

export function FaqTablet() {
    const reduceMotion = useReducedMotion()
    const [openId, setOpenId] = useState<string | null>(null)
    const handleToggle = (id: string) => setOpenId((c) => (c === id ? null : id))

    return (
        <Section id="faq" variant="dark" paddingY="none" className="bg-brand-surface overflow-visible">
            <div className="relative w-full">
                <div className="flex w-full flex-col pt-8 pb-24 sm:pt-8 sm:pb-24 md:pb-28">
                    <Container className="max-w-base flex w-full flex-1 flex-row items-start gap-10">
                        <div className="sticky top-24 w-[42%] shrink-0">
                            <FaqLeftPanel reduceMotion={reduceMotion} />
                        </div>
                        <div className="flex min-w-0 flex-1 flex-col gap-5 pb-16 sm:gap-6 md:gap-7">
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