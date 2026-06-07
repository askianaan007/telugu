'use client'

// src/components/sections/whychoose/WhyChooseMobile.tsx
// Mobile (< 768px): single column stack with simple fade-in per card.

import { motion as m } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { WHY_CHOOSE_ITEMS, WhyChooseCard, WhyChooseSectionHeader } from './whyChooseShared'

const EASE = [0.22, 1, 0.36, 1] as const

export function WhyChooseMobile() {
    return (
        <Section variant="default" paddingY="xl" className="bg-brand-surface">
            <Container className="max-w-base">
                <WhyChooseSectionHeader />
                <div className="mt-10 flex flex-col gap-4">
                    {WHY_CHOOSE_ITEMS.map((item, i) => (
                        <m.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-6%' }}
                            transition={{ duration: 0.52, ease: EASE, delay: (i % 2) * 0.06 }}
                        >
                            <WhyChooseCard item={item} side={i < 5 ? 'left' : 'right'} />
                        </m.div>
                    ))}
                </div>
            </Container>
        </Section>
    )
}