'use client'

import { useMemo } from 'react'

export type DeviceTier = 'low' | 'mid' | 'high'

export interface DeviceTierResult {
  tier: DeviceTier
  dpr: number
  shouldRenderCanvas: boolean
}

function resolveDeviceTier(): DeviceTierResult {
  if (typeof window === 'undefined') {
    return {
      tier: 'mid',
      dpr: 1.5,
      shouldRenderCanvas: true,
    }
  }

  // deviceMemory is experimental and absent in some browsers.
  const memoryNavigator = navigator as Navigator & { deviceMemory?: number }
  const memory = memoryNavigator.deviceMemory ?? 4
  const cores = navigator.hardwareConcurrency ?? 4
  const pixelRatio = window.devicePixelRatio || 1

  let tier: DeviceTier = 'mid'
  if (memory <= 4 || cores <= 4) {
    tier = 'low'
  } else if (memory >= 8 && cores >= 8) {
    tier = 'high'
  }

  const dpr = tier === 'low' ? 1 : tier === 'mid' ? 1.5 : Math.min(2, pixelRatio)

  return {
    tier,
    dpr,
    shouldRenderCanvas: tier !== 'low',
  }
}

export function useDeviceTier(): DeviceTierResult {
  return useMemo(() => resolveDeviceTier(), [])
}
