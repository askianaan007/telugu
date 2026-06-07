import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const GSAP_DEFAULTS: gsap.TweenVars = {
  duration: 0.9,
  ease: 'power3.out',
}

// Register plugins eagerly at module-load time on the client.
//
// `useGSAP` runs inside `useIsomorphicLayoutEffect`, and React commits child
// layout effects BEFORE parent layout/useEffect. If we deferred registration
// to a provider effect, child components calling `ScrollTrigger.batch` (etc.)
// would run first and crash with `Cannot read properties of undefined
// (reading 'delayedCall')`, because ScrollTrigger has no link to gsap yet.
let gsapConfigured = false

function configureGsap(): void {
  if (gsapConfigured || typeof window === 'undefined') return
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, useGSAP)
  gsap.defaults(GSAP_DEFAULTS)
  ScrollTrigger.config({ ignoreMobileResize: true })
  gsapConfigured = true
}

configureGsap()

export function setupGsap(): typeof gsap {
  configureGsap()
  return gsap
}

export { gsap, ScrollTrigger, MotionPathPlugin, useGSAP }
