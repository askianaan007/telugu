import { createElement, type ElementType, type HTMLAttributes, type ReactNode } from 'react'

import { cn } from '@/lib/utils'

interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

const SIZE_MAP: Record<NonNullable<ContainerProps['size']>, string> = {
  sm: 'max-w-3xl',
  md: 'max-w-5xl',
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
}

export function Container({
  as: Component = 'div',
  children,
  size = 'xl',
  className,
  ...props
}: ContainerProps) {
  return createElement(
    Component,
    {
      className: cn('mx-auto w-full px-4 sm:px-6 lg:px-8', SIZE_MAP[size], className),
      ...props,
    },
    children
  )
}
