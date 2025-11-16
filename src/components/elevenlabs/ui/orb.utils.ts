/**
 * Clamps a number between 0 and 1
 * @param n - The number to clamp
 * @returns The clamped value between 0 and 1
 */
export function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0
  return Math.min(1, Math.max(0, n))
}

/**
 * Creates a seedable pseudo-random number generator using splitmix32 algorithm
 * @param seed - Initial seed value
 * @returns A function that generates random numbers between 0 and 1
 */
export function createSeededRandom(seed: number): () => number {
  let state = seed
  return function (): number {
    state |= 0
    state = (state + 0x9e3779b9) | 0
    let t = state ^ (state >>> 16)
    t = Math.imul(t, 0x21f0aaad)
    t = t ^ (t >>> 15)
    t = Math.imul(t, 0x735a2d97)
    return ((t = t ^ (t >>> 15)) >>> 0) / 4294967296
  }
}

/**
 * Generates an array of random offsets for animation
 * @param count - Number of offsets to generate
 * @param random - Random number generator function
 * @returns Float32Array of random offsets
 */
export function generateOffsets(count: number, random: () => number): Float32Array {
  return new Float32Array(
    Array.from({ length: count }, () => random() * Math.PI * 2)
  )
}

/**
 * Checks if the document is in dark mode
 * @returns True if dark mode is active, false otherwise
 */
export function isDarkMode(): boolean {
  if (typeof document === 'undefined') return false
  return document.documentElement.classList.contains('dark')
}

