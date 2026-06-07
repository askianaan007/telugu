export function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - clamp(t, 0, 1), 3)
}

export function mapRange(
  val: number,
  in0: number,
  in1: number,
  out0: number,
  out1: number,
  easeFn?: (t: number) => number
): number {
  const t = clamp((val - in0) / (in1 - in0), 0, 1)
  const eased = easeFn ? easeFn(t) : t
  return lerp(out0, out1, eased)
}
