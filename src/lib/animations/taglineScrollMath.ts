// src/lib/animations/taglineScrollMath.ts

export function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
}

export function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t
}

export function mapRange(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    if (inMax === inMin) return outMin
    return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin
}

export function easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - clamp(t, 0, 1), 3)
}