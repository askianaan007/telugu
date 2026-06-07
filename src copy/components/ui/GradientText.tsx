import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface GradientTextProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  children: ReactNode
  gradient?: 'gold' | 'rose'
}

export function GradientText({
  as: Component = 'span',
  children,
  gradient = 'gold',
  className,
  ...props
}: GradientTextProps) {
  return createElement(
    Component,
    {
      className: cn(
        'inline-block',
        gradient === 'gold' ? 'text-gradient-gold' : 'text-gradient-rose',
        className
      ),
      ...props,
    },
    children
  )
}
