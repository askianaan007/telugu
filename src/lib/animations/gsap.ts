import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const GSAP_DEFAULTS: gsap.TweenVars = {
    duration: 0.9,
    ease: 'power3.out',
}

let gsapConfigured = false

function configureGsap(): void {
    if (gsapConfigured || typeof window === 'undefined') return
    gsap.registerPlugin(ScrollTrigger, useGSAP)
    gsap.defaults(GSAP_DEFAULTS)
    ScrollTrigger.config({
        ignoreMobileResize: true,
        limitCallbacks: true,
        syncInterval: 40,
    })
    // Removed: gsap.ticker.fps(60) — allow native display refresh rate
    gsapConfigured = true
}

configureGsap()

export function setupGsap(): typeof gsap {
    configureGsap()
    return gsap
}

export { gsap, ScrollTrigger, useGSAP }