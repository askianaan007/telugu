'use client'

import { useRef } from 'react'
import Header from '@/components/layout/Header'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutIntroSection } from '@/components/sections/AboutSection'
import { VisionMissionSection } from '@/components/sections/VisionMissionSection'
import { AboutVisionHandoffBridge } from '@/components/sections/about/AboutVisionHandoffBridge'
import { AboutVisionHandoffProvider } from '@/components/sections/about/AboutVisionHandoffContext'
import { CharterServicesSection } from '@/components/sections/ServicesSection'
import { HeliportSolutionsSection } from '@/components/sections/HeliportSolutionsSection'
import { GlobalPresenceSection } from '@/components/sections/GlobalPresenceSection'
import { OurModelsSection } from '@/components/sections/OurModelsSection'
import { WhyChooseUsSection } from '@/components/sections/WhyChooseUsSection'
import { FaqSection } from '@/components/sections/FaqSection'
import { CommitmentSection } from '@/components/sections/CommitmentSection'
import { TaglineScrollSection } from '@/components/sections/TaglineScrollSection'
import { ContactCtaSection } from '@/components/sections/ContactCtaSection'
import { SiteFooter } from '@/components/sections/SiteFooter'

export default function HomePage() {
  const aboutSectionRef = useRef<HTMLElement | null>(null)
  const helicopterRef = useRef<HTMLDivElement | null>(null)
  const ringsRef = useRef<HTMLDivElement | null>(null)

  return (
    <>
      <Header />
      <main className="relative">
        {/*
                 * AboutVisionHandoffProvider must wrap:
                 *   1. AboutIntroSection  — registers handoff card + mosaic anchor
                 *   2. VisionMissionSection — registers vision panel slot
                 *   3. AboutVisionHandoffBridge — creates the ScrollTrigger morph
                 *
                 * Everything outside this provider is unaffected.
                 */}
        <AboutVisionHandoffProvider>
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
          <VisionMissionSection />
          <AboutVisionHandoffBridge />
        </AboutVisionHandoffProvider>

        <CharterServicesSection />
        <HeliportSolutionsSection />
        <GlobalPresenceSection />
        <OurModelsSection />
        <WhyChooseUsSection />
        <TaglineScrollSection />
        <CommitmentSection />
        <FaqSection />
        <ContactCtaSection />
      </main>
      <SiteFooter />
    </>
  )
}