'use client'

import { useRef } from 'react'
import { motion as m } from 'framer-motion'
import Image from 'next/image'
import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import {
    CommitmentClouds,
    CommitmentHeader,
    CommitmentRingBlock,
    CommitmentBottomBody,
} from './commitmentShared'

const EASE = [0.22, 1, 0.36, 1] as const

export function CommitmentMobile() {
    const ringRef = useRef<HTMLDivElement>(null)
    const reduceMotion = usePrefersReducedMotion()

    return (
        <Section
            variant="default"
            paddingY="none"
            className="relative min-h-[1253px] overflow-x-clip overflow-y-visible bg-[#F0F1F2]"
        >
            <div aria-hidden className="pointer-events-none absolute inset-0 z-(--z-index-section-bg) h-full w-full bg-[linear-gradient(to_bottom,#F0F1F2_0%,#D6E8FA_50%,#F0F1F2_100%)]" />
            <CommitmentClouds />

            <Container className="max-w-base relative z-(--z-index-section-content) px-4 pb-16">
                <m.div
                    initial={reduceMotion ? false : { opacity: 0, y: 28 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="pt-28 text-center"
                >
                    <CommitmentHeader />
                </m.div>

                <m.div
                    initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 1.0, ease: EASE, delay: 0.15 }}
                >
                    <CommitmentRingBlock ringRef={ringRef} />
                </m.div>

                <m.div
                    initial={reduceMotion ? false : { opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ duration: 0.85, ease: EASE, delay: 0.1 }}
                >
                    <CommitmentBottomBody />
                </m.div>
            </Container>
        </Section>
    )
}