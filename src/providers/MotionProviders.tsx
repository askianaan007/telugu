'use client'

// src/providers/MotionProviders.tsx
// Use LazyMotion with strict={false} so both `motion` and `m` components work.
// strict=true throws when any `motion.*` component is rendered inside LazyMotion.

import { domAnimation, LazyMotion } from 'framer-motion'
import type { ReactNode } from 'react'

export function MotionProviders({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict={false}>
      {children}
    </LazyMotion>
  )
}