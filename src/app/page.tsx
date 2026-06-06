'use client'

import { useRef } from 'react'
import Header from '@/components/layout/Header'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutIntroSection } from '@/components/sections/AboutSection'

export default function HomePage() {
  const aboutSectionRef = useRef<HTMLElement | null>(null)
  const helicopterRef = useRef<HTMLDivElement | null>(null)
  const ringsRef = useRef<HTMLDivElement | null>(null)

  return (
    <>
      <Header />
      <main className="relative">
        <HeroSection
          aboutSectionRef={aboutSectionRef}
          onHelicopterRef={(el) => { helicopterRef.current = el }}
          onRingsRef={(el) => { ringsRef.current = el }}
        />
        <AboutIntroSection
          fixedHelicopterOpacityRef={helicopterRef}
          fixedRingsRef={ringsRef}
          sectionRef={aboutSectionRef}
        />
      </main>
    </>
  )
}