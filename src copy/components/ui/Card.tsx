import { cn } from '@/lib/utils'

import type { HTMLAttributes, ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  variant?: 'light' | 'dark' | 'rose' | 'glass'
}

const VARIANT_MAP: Record<NonNullable<CardProps['variant']>, string> = {
  light: 'bg-brand-white text-brand-black shadow-card',
  dark: 'bg-brand-black text-brand-white shadow-card',
  rose: 'bg-rose text-brand-white shadow-glow',
  glass: 'border border-white/15 bg-white/5 text-brand-white backdrop-blur-xl shadow-card',
}

export function Card({ children, variant = 'light', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'rounded-card p-6 transition-transform duration-300 ease-out sm:p-8',
        VARIANT_MAP[variant],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}
