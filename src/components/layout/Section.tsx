import {
  createElement,
  forwardRef,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from 'react'

import { cn } from '@/lib/utils'

interface SectionProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType
  children: ReactNode
  variant?: 'default' | 'dark' | 'night' | 'tinted' | 'gold'
  paddingY?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
}

const VARIANT_MAP: Record<NonNullable<SectionProps['variant']>, string> = {
  default: 'bg-brand-white text-brand-black',
  dark: 'bg-brand-black text-brand-white',
  night: 'bg-night text-brand-white',
  tinted: 'bg-[#F8F4EF] text-brand-black',
  gold: 'bg-gold text-brand-black',
}

const PADDING_MAP: Record<NonNullable<SectionProps['paddingY']>, string> = {
  none: '',
  sm: 'py-12 sm:py-16',
  md: 'py-16 sm:py-20 lg:py-24',
  lg: 'py-20 sm:py-24 lg:py-32',
  xl: 'py-24 sm:py-32 lg:py-40',
}

export const Section = forwardRef<HTMLElement, SectionProps>(function Section(
  {
    as: Component = 'section',
    variant = 'default',
    paddingY = 'lg',
    className,
    children,
    ...props
  },
  ref
) {
  return createElement(
    Component,
    {
      ref: ref as Ref<HTMLElement>,
      className: cn(
        'relative isolate w-full overflow-hidden',
        VARIANT_MAP[variant],
        PADDING_MAP[paddingY],
        className
      ),
      ...props,
    },
    children
  )
})
