import Header from '@/components/layout/Header'
import { PageRefBridge } from '@/components/PageRefBridge'
import { SiteFooter } from '@/components/sections/SiteFooter'

export default function HomePage() {
  return (
    <>
      <Header />
      <main className="relative">
        <PageRefBridge />
      </main>
      <SiteFooter />
    </>
  )
}
