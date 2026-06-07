'use client'

import { LazyMotion, MotionConfig, domAnimation } from 'framer-motion'
import { useEffect, type ReactNode } from 'react'

import { SiteNavScrollProvider } from '@/components/providers/SiteNavScrollProvider'
import { setupGsap } from '@/lib/animations/gsap'

interface MotionProvidersProps {
  children: ReactNode
}

export function MotionProviders({ children }: MotionProvidersProps) {
  useEffect(() => {
    setupGsap()
  }, [])

  return (
    <LazyMotion features={domAnimation} strict>
      <MotionConfig reducedMotion="user">
        <SiteNavScrollProvider>
          {children}
        </SiteNavScrollProvider>
      </MotionConfig>
    </LazyMotion>
  )
}