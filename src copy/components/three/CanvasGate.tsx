'use client'

import dynamic from 'next/dynamic'

const CanvasRoot = dynamic(() => import('@/components/three/CanvasRoot'), {
  ssr: false,
  loading: () => (
    <div className="flex h-[360px] w-full items-center justify-center rounded-2xl bg-zinc-100 text-sm text-zinc-600">
      Loading immersive preview...
    </div>
  ),
})

export function CanvasGate() {
  return <CanvasRoot />
}
