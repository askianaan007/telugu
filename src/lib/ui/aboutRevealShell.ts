import { cn } from '@/lib/utils'

/** Shared inner “well” tokens — Figma about-reveal inner (129-2280). */
const INNER_BASE =
  'border-about-reveal-inner-border bg-about-reveal-inner-bg flex flex-row items-stretch rounded-2xl border-2'

/** CharterServicesSection — compact horizontal service row. */
export function charterServiceRevealInnerClassName() {
  return cn(
    INNER_BASE,
    'bg-white',
    'h-full min-h-[148px] items-center gap-3 p-4',
    'sm:gap-4 sm:p-4 md:gap-5 md:p-4',
    'xl:max-h-44.5 xl:min-h-0 xl:py-4'
  )
  
}

/** GlobalPresenceSection — office card with flag + longer copy (flag absolute BR, no inner padding there). */
export function globalPresenceRevealInnerClassName() {
  return cn(
    INNER_BASE,
    'relative min-h-0 overflow-hidden gap-0 pl-6 pt-6 pr-0 pb-0 sm:pl-8 sm:pt-8 sm:pr-0 sm:pb-0',
    /* Override INNER_BASE `items-stretch`: wrap card height to copy + flag, no dead space below text */
    'items-start'
  )
}

/** FaqSection — horizontal accordion row (645×72 collapsed). White inner border (not INNER_BASE gray). */
export function faqAccordionInnerClassName() {
  return cn(
    'bg-white flex flex-col items-stretch justify-center gap-0 rounded-[16px] border-4 border-white',
    'relative min-h-[72px] w-full overflow-hidden px-[30px] py-4'
  )
}