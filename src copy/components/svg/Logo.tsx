import Image from 'next/image'

import { cn } from '@/lib/utils'

interface LogoProps {
  variant?: 'mark' | 'full'
  className?: string
  priority?: boolean
}

export function Logo({ variant = 'mark', className, priority = false }: LogoProps) {
  if (variant === 'full') {
    return (
      <Image
        src="/images/telugu-air-logo-full.png"
        alt="Telugu Airlines"
        width={200}
        height={60}
        priority={priority}
        className={cn('h-10 w-auto object-contain', className)}
      />
    )
  }
  return (
    <Image
      src="/images/telugu-air-logo.png"
      alt="Telugu Airlines"
      width={72}
      height={72}
      priority={priority}
      className={cn('h-10 w-10 object-contain', className)}
    />
  )
}
