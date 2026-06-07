'use client'

import { Canvas, useFrame } from '@react-three/fiber'
import { Bloom, EffectComposer } from '@react-three/postprocessing'
import { useReducedMotion } from 'framer-motion'
import { useRef } from 'react'

import { useDeviceTier } from '@/hooks/useDeviceTier'

import type { Mesh } from 'three'

function RotorcraftSilhouette() {
  const meshRef = useRef<Mesh>(null)
  const reduceMotion = useReducedMotion()

  useFrame((_state, delta) => {
    if (!meshRef.current || reduceMotion) {
      return
    }

    meshRef.current.rotation.y += delta * 0.35
  })

  return (
    <mesh ref={meshRef}>
      <torusKnotGeometry args={[0.9, 0.25, 120, 20]} />
      <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} />
    </mesh>
  )
}

export default function CanvasRoot() {
  const { dpr, shouldRenderCanvas, tier } = useDeviceTier()

  if (!shouldRenderCanvas) {
    return (
      <div className="flex h-[360px] w-full items-center justify-center rounded-2xl bg-zinc-100 text-sm text-zinc-600">
        Immersive preview is disabled on low-power devices.
      </div>
    )
  }

  return (
    <div className="h-[360px] w-full overflow-hidden rounded-2xl">
      <Canvas dpr={dpr} camera={{ position: [0, 0, 4], fov: 50 }}>
        <color attach="background" args={['#f4f4f5']} />
        <ambientLight intensity={0.7} />
        <directionalLight position={[4, 4, 3]} intensity={1} />
        <RotorcraftSilhouette />
        {tier !== 'low' ? (
          <EffectComposer>
            <Bloom luminanceThreshold={0.4} intensity={0.3} />
          </EffectComposer>
        ) : null}
      </Canvas>
    </div>
  )
}
