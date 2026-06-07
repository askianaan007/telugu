'use client'

// src/components/sections/whychoose/WhyChooseTablet.tsx
// Tablet (768–1023px): 2-column grid, staggered fade-in per card.

import { motion as m } from 'framer-motion'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { WHY_CHOOSE_ITEMS, WhyChooseCard, WhyChooseSectionHeader } from './whyChooseShared'

const EASE = [0.22, 1, 0.36, 1] as const

export function WhyChooseTablet() {
    return (
        <Section variant="default" paddingY="xl" className="bg-brand-surface">
            <Container className="max-w-base">
                <WhyChooseSectionHeader />
                <div className="mt-14 grid grid-cols-2 gap-5">
                    {WHY_CHOOSE_ITEMS.map((item, i) => (
                        <m.div
                            key={item.title}
                            initial={{ opacity: 0, y: 24 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: '-6%' }}
                            transition={{ duration: 0.55, ease: EASE, delay: (i % 2) * 0.08 }}
                        >
                            <WhyChooseCard item={item} side={i % 2 === 0 ? 'left' : 'right'} />
                        </m.div>
                    ))}
                </div>
            </Container>
        </Section>
    )
}