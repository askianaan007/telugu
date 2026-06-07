import dynamic from 'next/dynamic'

import { BookingModal } from '@/components/booking/BookingModal'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { HeroSection } from '@/components/sections/HeroSection'
import { AboutVisionHandoffBridge } from '@/components/sections/about/AboutVisionHandoffBridge'
import { AboutVisionHandoffProvider } from '@/components/sections/about/AboutVisionHandoffContext'
import { VisionMissionSection } from '@/components/sections/VisionMissionSection'
import { TaglineScrollSection } from '@/components/sections/TaglineScrollSection'

const CharterServicesSection = dynamic(
  () => import('@/components/sections/CharterServicesSection').then((m) => m.CharterServicesSection),
  { ssr: true }
)

const HeliportSolutionsSection = dynamic(
  () => import('@/components/sections/HeliportSolutionsSection').then((m) => m.HeliportSolutionsSection),
  { ssr: true }
)

const GlobalPresenceSection = dynamic(
  () => import('@/components/sections/GlobalPresenceSection').then((m) => m.GlobalPresenceSection),
  { ssr: true }
)

const OurModelsSection = dynamic(
  () => import('@/components/sections/OurModelsSection').then((m) => m.OurModelsSection),
  { ssr: true }
)

const WhyChooseUsSection = dynamic(
  () => import('@/components/sections/WhyChooseUsSection').then((m) => m.WhyChooseUsSection),
  { ssr: true }
)

const CommitmentSection = dynamic(
  () => import('@/components/sections/CommitmentSection').then((m) => m.CommitmentSection),
  { ssr: true }
)

const FaqSection = dynamic(
  () => import('@/components/sections/FaqSection').then((m) => m.FaqSection),
  { ssr: true }
)

const ContactCtaSection = dynamic(
  () => import('@/components/sections/ContactCtaSection').then((m) => m.ContactCtaSection),
  { ssr: true }
)

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main className="relative">
        <AboutVisionHandoffProvider>
          <HeroSection />
          <VisionMissionSection />/
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
      {/* <BookingModal /> */}
    </>
  )
}