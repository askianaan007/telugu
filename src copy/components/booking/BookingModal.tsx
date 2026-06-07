'use client'

import { AnimatePresence, m, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useId, useRef, useState, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'

import { BookingFormField } from '@/components/booking/BookingFormField'
import { ActionButton } from '@/components/ui/ActionButton'
import { easings } from '@/lib/animations/easings'
import { cn } from '@/lib/utils'
import { useUiStore } from '@/store/uiStore'

const PASSENGER_OPTIONS = [
  { value: '1', label: '1 Passenger' },
  { value: '2', label: '2 Passengers' },
  { value: '3', label: '3 Passengers' },
  { value: '4', label: '4 Passengers' },
] as const

const fieldVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.12 + i * 0.05,
      duration: 0.4,
      ease: easings.smooth,
    },
  }),
}

const initialForm = {
  name: '',
  from: '',
  to: '',
  date: '',
  passengers: '',
  phone: '',
}

type BookingFormState = typeof initialForm

function useIsClient() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )
}

export function BookingModal() {
  const isOpen = useUiStore((s) => s.isBookingModalOpen)
  const closeBookingModal = useUiStore((s) => s.closeBookingModal)
  const prefersReducedMotion = useReducedMotion()
  const headingId = useId()
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)
  const mounted = useIsClient()
  const [form, setForm] = useState<BookingFormState>(initialForm)

  useEffect(() => {
    if (!isOpen) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 120)
    return () => window.clearTimeout(timer)
  }, [isOpen])

  const handleEscape = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeBookingModal()
    },
    [closeBookingModal]
  )

  useEffect(() => {
    if (!isOpen) return
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, handleEscape])

  function handleChange(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setForm(initialForm)
    closeBookingModal()
  }

  const motionDuration = prefersReducedMotion ? 0.01 : 0.45
  const exitDuration = prefersReducedMotion ? 0.01 : 0.32

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <m.div
          className="z-modal fixed inset-0 flex items-start justify-center overflow-y-auto p-3 pt-2 sm:items-center sm:p-4 sm:pt-10 md:p-6 md:pt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionDuration }}
          role="presentation"
        >
          <div
            className="bg-brand-black/2 absolute inset-0 backdrop-blur-md"
            onClick={closeBookingModal}
            aria-hidden
          />

          <m.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={headingId}
            className="relative mx-auto flex w-full max-w-[min(1040px,calc(100vw-1.5rem))] flex-col items-center sm:max-w-[min(1040px,calc(100vw-2rem))]"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 56, scale: 0.98 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.98 }}
            transition={{ duration: exitDuration, ease: easings.smooth }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeBookingModal}
              aria-label="Close booking form"
              className="relative z-20 mb-8 flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-full bg-white/40 p-0 transition-opacity hover:opacity-90 sm:mb-14 sm:h-14 sm:w-14 lg:mb-12"
            >
              <span className="bg-brand-navy flex h-9 w-9 items-center justify-center rounded-full sm:h-11 sm:w-11">
                <X className="h-3.5 w-3.5 text-white sm:h-4 sm:w-4" strokeWidth={2.5} aria-hidden />
              </span>
            </button>

            <div className="bg-brand-white shadow-card rounded-card -mt-5 max-h-[min(90dvh,calc(100dvh-5rem))] w-full overflow-hidden sm:-mt-6 sm:max-h-[min(92dvh,calc(100dvh-6rem))] lg:-mt-7 lg:max-h-[340px]">
              <form
                id="booking-form"
                onSubmit={handleSubmit}
                className="rounded-card relative flex max-h-[min(90dvh,calc(100dvh-5.5rem))] flex-col overflow-x-hidden overflow-y-auto sm:max-h-[min(92dvh,calc(100dvh-6.5rem))] md:grid md:max-h-none md:grid-cols-[minmax(200px,236px)_1px_1fr] md:items-stretch lg:max-h-[340px]"
              >
                <div className="p-3 pb-0 sm:p-4 sm:pb-0 md:flex md:min-h-0 md:self-stretch md:p-4 md:pr-4">
                  <LeftPanel />
                </div>

                <TicketPerforation />

                <div aria-hidden className="border-t border-dashed border-black/7 md:hidden" />

                <RightPanel
                  headingId={headingId}
                  form={form}
                  onChange={handleChange}
                  firstFieldRef={firstFieldRef}
                  reduceMotion={Boolean(prefersReducedMotion)}
                />
              </form>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>,
    document.body
  )
}

function LeftPanel() {
  return (
    <div className="bg-brand-navy rounded-card relative flex w-full flex-col items-center overflow-hidden px-4 py-6 sm:px-6 sm:py-8 md:h-[298px] md:max-h-[298px] md:min-w-0 md:justify-between md:px-5 md:py-4 md:pt-3 lg:px-6 lg:pt-2 lg:pb-6">
      <div className="flex flex-1 flex-col items-center justify-center md:min-h-0 md:flex-1">
        <Image
          src="/images/telugu-airlines-logo-gold-text.png"
          alt="Telugu Airlines"
          width={184}
          height={184}
          className="h-[120px] w-[120px] object-contain sm:h-[140px] sm:w-[140px] md:h-[156px] md:w-[156px] lg:h-[184px] lg:w-[184px]"
          priority
        />
      </div>

      <div className="relative hidden w-full shrink-0 md:block">
        <div aria-hidden className="absolute inset-x-0 top-0" />
        <SubmitSection />
      </div>
    </div>
  )
}

function SubmitSection({ className, fullWidth }: { className?: string; fullWidth?: boolean }) {
  return (
    <div
      className={cn(
        'flex w-full flex-col items-center gap-3 py-2 sm:min-h-[52px] sm:gap-4 md:py-0',
        className
      )}
    >
      <SubmitDecorLines fullWidth={fullWidth} /> {/* Top only */}
      <ActionButton
        type="submit"
        form="booking-form"
        label="Request Flight"
        variant={fullWidth ? 'inverted' : 'request'}
        fullWidth={fullWidth}
        className="relative z-10 shrink-0 md:mt-12"
      />
    </div>
  )
}

function SubmitDecorLines({ fullWidth }: { fullWidth?: boolean }) {
  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none absolute inset-y-0 z-0 flex flex-col justify-center gap-1',
        fullWidth ? 'inset-x-0' : '-right-4 -left-4 md:-right-6 md:-left-6'
      )}
    >
      <div
        className="h-0 w-full border-t border-dashed border-[#CB933C]"
        style={{
          background: 'linear-gradient(90deg, #CB933C 0%, #F9E67E 50%, #CB933C 100%)',
        }}
      />
      <div
        className="h-0 w-full border-t border-dashed border-[#CB933C]/20"
        style={{
          background: 'linear-gradient(90deg, #CB933C 0%, #F9E67E 50%, #CB933C 100%)',
        }}
      />
    </div>
  )
}

function TicketPerforation() {
  return (
    <div aria-hidden className="relative hidden w-px shrink-0 md:mt-4 md:block md:h-[298px]">
      <div className="pointer-events-none absolute inset-y-0 left-0 border-l border-dashed border-black/57" />
    </div>
  )
}

function RightPanel({
  headingId,
  form,
  onChange,
  firstFieldRef,
  reduceMotion,
}: {
  headingId: string
  form: BookingFormState
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  firstFieldRef: React.RefObject<HTMLInputElement | null>
  reduceMotion: boolean
}) {
  return (
    <div className="bg-brand-white relative flex flex-col overflow-visible p-4 sm:p-6 md:py-6 md:pr-6 md:pl-4">
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 z-0 h-36 w-full max-w-full overflow-visible sm:h-40 md:h-48"
      >
        <Image
          src="/images/booking-card-helicopter-with-line.svg"
          alt=""
          width={186}
          height={99}
          className="absolute top-0 right-0 z-0 h-auto w-[min(44%,150px)] -translate-x-4 translate-y-12 sm:w-[min(48%,186px)] md:w-[160px] md:-translate-x-28 md:translate-y-4 lg:w-[186px] lg:-translate-x-36 lg:translate-y-4"
        />
        <Image
          src="/images/booking-card-map.svg"
          alt=""
          width={300}
          height={214}
          className="absolute top-0 right-0 z-1 h-auto w-[min(50%,150px)] opacity-40 sm:w-[min(52%,150px)] md:w-[200px] md:-translate-x-4 md:translate-y-4 lg:w-[280px] lg:-translate-x-36 lg:translate-y-4"
        />
      </div>

      <Image
        src="/images/booking-card-stamp.svg"
        alt=""
        width={119}
        height={84}
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 z-2 h-auto w-[min(32%,100px)] -translate-x-4 sm:w-[min(36%,119px)] md:w-[90px] md:-translate-x-4 md:translate-y-4 lg:w-[119px] lg:translate-y-4"
      />

      <div className="relative z-10">
        <header className="mb-5 pr-16 sm:mb-6 sm:pr-20 md:mb-8 md:pr-0">
          <h2
            id={headingId}
            className="[font-family:var(--font-halant)] text-[22px] leading-none font-normal tracking-[-0.03em] text-[#1C1C1C] sm:text-[26px] md:text-[30px]"
          >
            Fill Travel Information
          </h2>
          <p className="text-brand-muted mt-2.5 max-w-xl [font-family:var(--font-geist)] text-[12px] leading-normal font-normal md:max-w-[300px] lg:max-w-[396px] xl:max-w-[396px]">
            Review all passenger and journey details carefully before submitting to ensure accurate
            booking and smooth travel processing
          </p>
        </header>

        <BookingFieldsGrid
          form={form}
          onChange={onChange}
          firstFieldRef={firstFieldRef}
          reduceMotion={reduceMotion}
        />

        <div className="mt-6 w-full md:hidden">
          <SubmitSection fullWidth />
        </div>
      </div>
    </div>
  )
}

function BookingFieldsGrid({
  form,
  onChange,
  firstFieldRef,
  reduceMotion,
}: {
  form: BookingFormState
  onChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  firstFieldRef: React.RefObject<HTMLInputElement | null>
  reduceMotion: boolean
}) {
  const fields: { key: string; node: React.ReactNode }[] = [
    {
      key: 'name',
      node: <NameField value={form.name} onChange={onChange} inputRef={firstFieldRef} />,
    },
    {
      key: 'from',
      node: (
        <BookingFormField
          id="from"
          label="FROM"
          iconSrc="/images/location.svg"
          placeholder="Gujrat"
          value={form.from}
          onChange={onChange}
        />
      ),
    },
    {
      key: 'to',
      node: (
        <BookingFormField
          id="to"
          label="TO"
          iconSrc="/images/location.svg"
          placeholder="Gujrat"
          value={form.to}
          onChange={onChange}
        />
      ),
    },
    {
      key: 'date',
      node: (
        <BookingFormField
          id="date"
          label="DATE"
          iconSrc="/images/calendar.svg"
          placeholder="dd/mm/yyyy"
          value={form.date}
          onChange={onChange}
        />
      ),
    },
    {
      key: 'passengers',
      node: (
        <BookingFormField
          id="passengers"
          variant="select"
          label="PASSENGER"
          iconSrc="/images/profile-2user.svg"
          placeholder="1-4 Passenger"
          value={form.passengers}
          onChange={onChange}
          options={PASSENGER_OPTIONS}
        />
      ),
    },
    {
      key: 'phone',
      node: (
        <BookingFormField
          id="phone"
          label="PHONE NUMBER"
          iconSrc="/images/call.svg"
          type="tel"
          placeholder="586253265232"
          value={form.phone}
          onChange={onChange}
          required
        />
      ),
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {fields.map(({ key, node }, index) => {
        if (reduceMotion) {
          return <div key={key}>{node}</div>
        }
        return (
          <m.div
            key={key}
            custom={index}
            initial="hidden"
            animate="visible"
            variants={fieldVariants}
          >
            {node}
          </m.div>
        )
      })}
    </div>
  )
}

function NameField({
  value,
  onChange,
  inputRef,
}: {
  value: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  inputRef: React.RefObject<HTMLInputElement | null>
}) {
  return (
    <div>
      <label
        htmlFor="name"
        className="text-brand-charcoal mb-3 block [font-family:var(--font-geist)] text-[13px] leading-normal font-semibold"
      >
        NAME
      </label>
      <div className="flex items-center gap-3 rounded-[10px] border border-[#BFBFBF] px-2 py-2.5">
        <Image
          src="/images/profile.svg"
          alt=""
          width={18}
          height={18}
          className="h-[18px] w-[18px] shrink-0"
          aria-hidden
        />
        <input
          ref={inputRef}
          id="name"
          name="name"
          type="text"
          value={value}
          onChange={onChange}
          placeholder="XYZ"
          required
          className="text-brand-charcoal placeholder:text-brand-muted/50 min-w-0 flex-1 border-0 bg-transparent p-0 [font-family:var(--font-geist)] text-[14px] font-normal outline-none"
        />
      </div>
    </div>
  )
}
