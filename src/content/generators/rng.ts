// Seeded PRNG (mulberry32) so any generated item can be reproduced from its seed.
export function mulberry32(seed: number) {
  let a = seed
  return function rng() {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export type RngFn = ReturnType<typeof mulberry32>

export function randomSeed(): number {
  return Math.floor(Math.random() * 2 ** 31)
}

export function pickOne<T>(rng: RngFn, items: readonly T[]): T {
  return items[Math.floor(rng() * items.length)]
}

export function pickN<T>(rng: RngFn, items: readonly T[], n: number): T[] {
  const pool = [...items]
  const result: T[] = []
  for (let i = 0; i < n && pool.length > 0; i++) {
    const idx = Math.floor(rng() * pool.length)
    result.push(pool.splice(idx, 1)[0])
  }
  return result
}

export function shuffle<T>(rng: RngFn, items: readonly T[]): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}
