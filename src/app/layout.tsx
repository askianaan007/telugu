import { Halant, Roboto_Mono } from 'next/font/google'
import localFont from 'next/font/local'
import LenisProvider from '@/providers/LenisProvider'
import { MotionProviders } from '@/providers/MotionProviders'
import { SiteNavScrollProvider } from '@/providers/SiteNavScrollProvider'
import { PreloaderProvider } from '@/providers/PreloaderProvider'
import { BookingModal } from '@/components/sections/booking/BookingModal'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import './globals.css'

const satoshi = localFont({
  variable: '--font-satoshi',
  display: 'swap',
  preload: true,
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  src: [
    { path: '../../public/fonts/satoshi/Satoshi-Variable.woff2', style: 'normal', weight: '300 900' },
    { path: '../../public/fonts/satoshi/Satoshi-VariableItalic.woff2', style: 'italic', weight: '300 900' },
  ],
})

const robotoMono = Roboto_Mono({
  variable: '--font-roboto-mono',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500'],
  preload: false,
})

const halant = Halant({
  variable: '--font-halant',
  subsets: ['latin'],
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  preload: false,
})

export const metadata: Metadata = {
  metadataBase: new URL('https://teluguairlines.com'),
  title: { default: 'Telugu Airlines | Premium Helicopter Charter & Heliport Solutions', template: '%s | Telugu Airlines' },
  description: 'Telugu Airlines delivers premium helicopter charter experiences, executive rotorcraft mobility, and end-to-end heliport infrastructure solutions across India.',
  keywords: ['Telugu Airlines', 'helicopter charter', 'heliport solutions', 'private aviation', 'executive helicopter', 'aviation services India'],
  authors: [{ name: 'Telugu Airlines' }],
  openGraph: {
    title: 'Telugu Airlines | Premium Helicopter Charter',
    description: 'Premium helicopter charter services and heliport infrastructure programs built for speed, safety, and comfort.',
    url: 'https://teluguairlines.com',
    siteName: 'Telugu Airlines',
    type: 'website',
  },
  twitter: { card: 'summary_large_image', title: 'Telugu Airlines', description: 'Premium helicopter charter and heliport infrastructure.' },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f0f1f2' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${satoshi.variable} ${robotoMono.variable} ${halant.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="bg-brand-surface text-brand-black font-sans">
        <LenisProvider>
          <MotionProviders>
            <SiteNavScrollProvider>
              <PreloaderProvider>
                {children}
              </PreloaderProvider>
              <BookingModal />
            </SiteNavScrollProvider>
          </MotionProviders>
        </LenisProvider>
      </body>
    </html>
  )
}