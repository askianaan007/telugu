'use client'

import { m, useReducedMotion, type Variants } from 'framer-motion'
import { createElement, type ReactNode } from 'react'

import { fadeInUp } from '@/lib/animations/motion'
import { cn } from '@/lib/utils'

type Element = 'div' | 'section' | 'article' | 'header' | 'footer' | 'ul' | 'ol' | 'li' | 'span'

interface AnimatedRevealProps {
  as?: Element
  children: ReactNode
  className?: string
  variants?: Variants
  delay?: number
  once?: boolean
  amount?: number
}

export function AnimatedReveal({
  as = 'div',
  children,
  className,
  variants = fadeInUp,
  delay = 0,
  once = true,
  amount = 0.2,
}: AnimatedRevealProps) {
  const shouldReduceMotion = useReducedMotion()

  if (shouldReduceMotion) {
    return createElement(as, { className }, children)
  }

  const Component = m[as]

  return (
    <Component
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      transition={{ delay }}
    >
      {children}
    </Component>
  )
}
