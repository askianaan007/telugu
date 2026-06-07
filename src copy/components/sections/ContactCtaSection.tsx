'use client'

import { useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import { useRef, useState } from 'react'

import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { ActionButton } from '@/components/ui/ActionButton'
import { gsap, useGSAP } from '@/lib/animations/gsap'

export function ContactCtaSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const prefersReducedMotion = useReducedMotion()
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  })

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setForm({ name: '', email: '', phone: '', subject: '', message: '' })
  }

  useGSAP(
    () => {
      const root = sectionRef.current
      if (!root) return

      const bg = root.querySelector<HTMLElement>('[data-contact-bg-image]')
      const heading = root.querySelector<HTMLElement>('[data-contact-heading]')
      const formCard = root.querySelector<HTMLElement>('[data-contact-form-card]')
      const fields = root.querySelectorAll<HTMLElement>('[data-contact-field]')
      const cta = root.querySelector<HTMLElement>('[data-contact-cta]')

      if (!bg || !heading || !formCard) return

      const reduceMotion =
        Boolean(prefersReducedMotion) ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches

      if (reduceMotion) {
        const targets = [heading, formCard, ...fields, ...(cta ? [cta] : [])]
        gsap.set(targets, { clearProps: 'all' })
        gsap.set(bg, { clearProps: 'all' })
        return
      }

      gsap.set(bg, { transformOrigin: '50% 50%', scale: 1.08, yPercent: -2 })
      gsap.set(heading, { y: 40, opacity: 0.15 })
      gsap.set(formCard, { y: 56, opacity: 0, scale: 0.98 })
      gsap.set(fields, { y: 16, opacity: 0 })
      if (cta) gsap.set(cta, { y: 12, opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: 'top 88%',
          end: '+=130%',
          scrub: 0.88,
          invalidateOnRefresh: true,
        },
      })

      tl.to(bg, { yPercent: 7, scale: 1.02, ease: 'none' }, 0)
      tl.to(heading, { y: 0, opacity: 1, ease: 'none', duration: 0.32 }, 0.04)
      tl.to(formCard, { y: 0, opacity: 1, scale: 1, ease: 'none', duration: 0.34 }, 0.1)
      tl.to(fields, { y: 0, opacity: 1, stagger: { each: 0.06, ease: 'none' }, duration: 0.3 }, 0.2)
      if (cta) {
        tl.to(cta, { y: 0, opacity: 1, ease: 'none', duration: 0.24 }, 0.32)
      }

      return () => {
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    },
    { scope: sectionRef, dependencies: [prefersReducedMotion] }
  )

  return (
    <Section
      id="contact"
      ref={sectionRef}
      variant="default"
      paddingY="none"
      className="bg-brand-surface relative overflow-hidden pb-20 sm:pb-24 lg:pb-28"
    >
      <div className="absolute inset-0 z-0">
        <div data-contact-bg-image className="relative h-full w-full will-change-transform">
          <Image
            src="/images/contat-us-bg.jpg"
            alt=""
            fill
            sizes="100vw"
            className="object-cover object-center"
            aria-hidden
          />
          <div
            aria-hidden
            className="from-brand-surface via-brand-surface/72 pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-linear-to-b to-transparent"
          />
        </div>
      </div>

      <Container className="max-w-base relative z-10">
        <div className="mx-auto flex w-full max-w-[920px] flex-col items-center">
          <div
            data-contact-heading
            className="mb-8 flex flex-col items-center gap-2.5 text-center will-change-transform sm:mb-10"
          >
            <span className="text-brand-black inline-flex items-center gap-2">
              <Image
                src="/images/black-asterisk.svg"
                width={14}
                height={14}
                alt=""
                className="h-[14px] w-[14px] shrink-0"
                aria-hidden
              />
              <span className="[font-family:var(--font-geist)] text-[14px] font-semibold tracking-[0.2em] uppercase">
                Get In Touch
              </span>
            </span>
            <Image
              src="/images/header-line-transparent-lite.svg"
              width={364}
              height={12}
              alt=""
              className="h-auto w-[min(364px,calc(100vw-4rem))] max-w-full shrink-0"
              aria-hidden
            />
            <h2 className="text-brand-black max-w-[14ch] [font-family:var(--font-halant)] text-[clamp(2.05rem,3.2vw+1rem,3.75rem)] leading-[1.06] font-normal tracking-[-0.03em] text-balance lg:max-w-[998px]">
              Seamless Aviation Support & Global Charter Solutions
            </h2>
          </div>

          <div
            data-contact-form-card
            className="w-full max-w-[542px] will-change-transform xl:max-w-[542px]"
          >
            <form
              onSubmit={handleSubmit}
              className="border-about-reveal-frame-outer-border bg-about-reveal-frame-outer/95 w-full rounded-[28px] border p-2 shadow-[0_14px_44px_-18px_rgba(9,9,11,0.16)] backdrop-blur-sm"
            >
              <div className="border-about-reveal-inner-border bg-about-reveal-inner-bg rounded-2xl border-2 p-6 sm:p-8 xl:p-[36px]">
                <div className="space-y-4 sm:space-y-5">
                  <Field label="Name" htmlFor="name">
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      className="text-brand-charcoal placeholder:text-brand-muted/35 focus-visible:border-brand-navy/30 h-12 w-full rounded-[12px] border border-[#d1d5db] bg-white px-3.5 text-[16px] focus-visible:outline-none"
                    />
                  </Field>

                  <Field label="Email" htmlFor="email">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="text-brand-charcoal placeholder:text-brand-muted/35 focus-visible:border-brand-navy/30 h-12 w-full rounded-[12px] border border-[#d1d5db] bg-white px-3.5 text-[16px] focus-visible:outline-none"
                    />
                  </Field>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <Field label="Phone" htmlFor="phone">
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="+0 254 258 5896"
                        className="text-brand-charcoal placeholder:text-brand-muted/35 focus-visible:border-brand-navy/30 h-12 w-full rounded-[12px] border border-[#d1d5db] bg-white px-3.5 text-[16px] focus-visible:outline-none"
                      />
                    </Field>

                    <Field label="Subject" htmlFor="subject">
                      <input
                        id="subject"
                        name="subject"
                        type="text"
                        value={form.subject}
                        onChange={handleChange}
                        placeholder="Travel"
                        className="text-brand-charcoal placeholder:text-brand-muted/35 focus-visible:border-brand-navy/30 h-12 w-full rounded-[12px] border border-[#d1d5db] bg-white px-3.5 text-[16px] focus-visible:outline-none"
                      />
                    </Field>
                  </div>

                  <Field label="Write Something" htmlFor="message">
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Ask your doubts..."
                      className="text-brand-charcoal placeholder:text-brand-muted/35 focus-visible:border-brand-navy/30 min-h-[120px] w-full resize-none rounded-[12px] border border-[#d1d5db] bg-white px-3.5 py-3 text-[16px] focus-visible:outline-none"
                    />
                  </Field>
                </div>

                <div className="mt-6" data-contact-cta>
                  <ActionButton type="submit" label="Send Message" fullWidth />
                </div>
              </div>
            </form>
          </div>
        </div>
      </Container>
    </Section>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-2" data-contact-field>
      <span className="text-brand-charcoal [font-family:var(--font-geist)] text-[13px] leading-none font-medium">
        {label}
      </span>
      {children}
    </label>
  )
}
