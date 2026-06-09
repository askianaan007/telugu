// 'use client'

// import { useEffect, useRef, useState } from 'react'
// import { faqAccordionInnerClassName } from '@/lib/ui/aboutRevealShell'
// import { cn } from '@/lib/utils'

// const OVERLAY_COPY = 'Where silence, space, and simplicity come together beautifully.'

// export function TaglineScrollMobile() {
//     const [mounted, setMounted] = useState(false)
//     const [pillDims, setPillDims] = useState({ w: 280, h: 165 })
//     const videoRef = useRef<HTMLVideoElement>(null)

//     useEffect(() => {
//         const update = () => {
//             const vw = window.innerWidth
//             const w = Math.min(280, Math.max(200, vw - 32))
//             setPillDims({ w, h: Math.round((w / 280) * 165) })
//         }
//         update()
//         setMounted(true)
//         window.addEventListener('resize', update)
//         return () => window.removeEventListener('resize', update)
//     }, [])

//     useEffect(() => {
//         const video = videoRef.current
//         if (!video) return
//         video.muted = true
//         video.play().catch(() => {
//             // Autoplay was blocked — fail silently
//         })
//     }, [])

//     return (
//         <section
//             data-tagline-scroll
//             aria-label="Less chaos, more clarity"
//             className="bg-brand-surface relative w-full overflow-hidden"
//             style={{ height: '100svh' }}
//         >
//             {/* Ambient glow */}
//             <div
//                 aria-hidden
//                 className="pointer-events-none absolute inset-0 z-0"
//                 style={{
//                     background: 'radial-gradient(ellipse 80% 50% at 50% 60%, rgba(202,139,55,0.10) 0%, transparent 70%)',
//                 }}
//             />

//             {/* Taglines — centered vertically above pill */}
//             <div className="pointer-events-none absolute inset-x-0 z-20 flex flex-col items-center gap-1 px-6 text-center"
//                 style={{ top: 'calc(50% - 12rem)' }}>
//                 <span className="text-brand-charcoal [font-family:var(--font-halant)] font-normal tracking-[-0.04em]"
//                     style={{ fontSize: 'clamp(1.5rem,6.5vw,2rem)', lineHeight: 1.1 }}>
//                     Less chaos,
//                 </span>
//                 <span className="text-brand-charcoal [font-family:var(--font-halant)] font-normal tracking-[-0.04em]"
//                     style={{ fontSize: 'clamp(1.5rem,6.5vw,2rem)', lineHeight: 1.1 }}>
//                     More Clarity.
//                 </span>

//                 {/* Gold connector line */}
//                 <div className="mt-4 h-px w-12 bg-brand-gold-start opacity-60" />
//             </div>

//             {/* Video pill — centered in viewport */}
//             <div className="absolute inset-0 z-10 flex items-center justify-center">
//                 <div
//                     className="relative overflow-hidden rounded-[24px] border border-black/8 p-2"
//                     style={{ width: mounted ? `${pillDims.w}px` : '280px', height: mounted ? `${pillDims.h}px` : '165px' }}
//                 >
//                     <div className={cn(
//                         faqAccordionInnerClassName(),
//                         'relative h-full min-h-0! w-full gap-0! overflow-hidden px-0! py-0!',
//                         'shadow-[0_40px_40px_-3.75px_rgba(0,0,0,0.02),0_20px_20px_-3px_rgba(0,0,0,0.03),0_11px_11px_-2.5px_rgba(0,0,0,0.04)]',
//                     )}>
//                         <video
//                             ref={videoRef}
//                             src="/images/tagline-strip.mp4"
//                             autoPlay muted loop playsInline
//                             disablePictureInPicture
//                             aria-hidden
//                             className="relative z-1 h-full w-full object-cover object-center bg-brand-surface"
//                         />
//                         {/* Bottom gradient over video */}
//                         <div
//                             aria-hidden
//                             className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-1/2"
//                             style={{ background: 'linear-gradient(180deg, transparent 0%, rgba(9,9,11,0.55) 55%, rgba(9,9,11,0.88) 100%)' }}
//                         />
//                     </div>
//                 </div>
//             </div>

//             {/* Copy — pinned to bottom above safe area */}
//             <div
//                 className="pointer-events-none absolute right-5 left-5 z-20 flex items-stretch gap-3"
//                 style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px))' }}
//             >
//                 {/* Gold vertical bar */}
//                 <div className="w-[2px] shrink-0 self-stretch rounded-full bg-brand-gold-start opacity-75" />
//                 <p className="min-w-0 flex-1 text-left [font-family:var(--font-halant)] font-normal tracking-[-0.03em] text-brand-charcoal"
//                     style={{ fontSize: '14px', lineHeight: '1.55' }}>
//                     {OVERLAY_COPY}
//                 </p>
//             </div>

//             {/* Scroll hint */}
//             <div className="pointer-events-none absolute bottom-24 inset-x-0 z-20 flex flex-col items-center gap-1.5 opacity-40">
//                 <div className="h-8 w-px bg-brand-charcoal" />
//                 <span className="[font-family:var(--font-geist)] text-[10px] tracking-[0.18em] uppercase text-brand-charcoal">
//                     scroll
//                 </span>
//             </div>
//         </section>
//     )
// }