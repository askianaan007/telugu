import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { AnimatedReveal } from '@/components/ui/AnimatedReveal'
import { Button } from '@/components/ui/Button'
import { GradientText } from '@/components/ui/GradientText'

interface ComingSoonSectionProps {
  eyebrow: string
  title: string
  description: string
  ctaLabel?: string
  ctaHref?: string
}

export function ComingSoonSection({
  eyebrow,
  title,
  description,
  ctaLabel = 'Back to home',
  ctaHref = '/',
}: ComingSoonSectionProps) {
  return (
    <Section variant="night" paddingY="xl" className="pt-32 sm:pt-40">
      <div aria-hidden className="bg-grid-faint pointer-events-none absolute inset-0 opacity-15" />
      <Container>
        <AnimatedReveal className="text-brand-white mx-auto max-w-3xl space-y-6 text-center">
          <span className="text-brand-gold-mid text-xs font-medium tracking-[0.24em] uppercase">
            {eyebrow}
          </span>
          <h1
            className="font-display font-semibold text-balance"
            style={{ fontSize: 'var(--text-display)', lineHeight: 1.05, letterSpacing: '-0.02em' }}
          >
            <GradientText gradient="gold">{title}</GradientText>
          </h1>
          <p className="mx-auto max-w-xl text-base leading-relaxed text-white/70">{description}</p>
          <div className="pt-2">
            <Button asChild variant="gold" size="lg">
              <Link href={ctaHref}>
                {ctaLabel}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </Button>
          </div>
        </AnimatedReveal>
      </Container>
    </Section>
  )
}
