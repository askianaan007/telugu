import type { Variants } from 'framer-motion'

export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
}

export const staggerContainer = (stagger = 0.1, delayChildren = 0): Variants => ({
    hidden: {},
    visible: {
        transition: { staggerChildren: stagger, delayChildren },
    },
})

export const easings = {
    smooth: [0.22, 1, 0.36, 1] as const,
    inOut: [0.4, 0, 0.2, 1] as const,
    out: [0, 0, 0.2, 1] as const,
    in: [0.4, 0, 1, 1] as const,
}