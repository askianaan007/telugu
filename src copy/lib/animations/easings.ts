export const easings = {
  smooth: [0.22, 1, 0.36, 1] as const,
  inOut: [0.65, 0, 0.35, 1] as const,
  spring: [0.16, 1, 0.3, 1] as const,
  bounce: [0.34, 1.56, 0.64, 1] as const,
}

export const gsapEasings = {
  smooth: 'power3.out',
  inOut: 'power2.inOut',
  expo: 'expo.out',
  back: 'back.out(1.7)',
} as const
