'use client'

import { ConcentricGlowRings } from '@/components/sections/about/ConcentricGlowRings'
import { cn } from '@/lib/utils'

/**
 * Concentric rings stack: stepped < `xl` so small/tablet/laptop don’t jump to the
 * full 700px-wide stack; `xl` matches the original large artboard.
 */
const RING_STACK =
  'aspect-square shrink-0 size-[min(76vw,260px)] sm:size-[min(76vw,260px)] md:size-[min(82vw,570px)] lg:size-[min(84vw,510px)] xl:size-[min(86vw,560px)]'

export function AboutHelicopterRings({ className }: { className?: string }) {
  return (
    <div
      data-about-heli-scene
      className={cn(
        'relative z-0 flex h-full min-h-svh w-full max-w-[min(100%,100vw)] flex-col items-center justify-center overflow-hidden px-2 sm:px-4 md:px-0',
        className
      )}
    >
      <div
        className={cn(
          'relative isolate sm:-translate-y-[clamp(2rem,8vh,4.5rem)] md:translate-y-0 lg:translate-y-0',
          RING_STACK
        )}
      >
        <div
          data-about-rings-layer
          className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center will-change-[opacity]"
        >
          <ConcentricGlowRings className="max-h-full max-w-full" />
        </div>
      </div>
    </div>
  )
}
