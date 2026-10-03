import type { InnerMark, ShapeFill, ShapeRotation, ShapeSize, ShapeSpec, ShapeType } from '../types'
import { pickOne, type RngFn } from './rng'

// Circle/square/cross are excluded: they look identical after many of our
// 45° rotations, so rotation-based items would show "different" answers that
// look the same.
export const SHAPE_TYPES: ShapeType[] = ['triangle', 'star', 'pentagon', 'hexagon', 'arrow']
export const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7']
export const SIZES: ShapeSize[] = ['small', 'medium', 'large']
export const ROTATIONS: ShapeRotation[] = [0, 45, 90, 135, 180, 225, 270, 315]
export const BASIC_FILLS: ShapeFill[] = ['solid', 'striped', 'dotted', 'outline']
export const FILLS: ShapeFill[] = [...BASIC_FILLS, 'half']
export const COUNTS: (1 | 2 | 3)[] = [1, 2, 3]
export const INNER_MARKS: InnerMark[] = ['none', 'dot', 'line', 'x']
// Shapes that can sit inside another shape; circle/square are fine here since
// the nested shape only matters for presence/type, not rotation.
export const NESTED_TYPES: ShapeType[] = ['circle', 'square', 'triangle', 'star']

// Rotation (in degrees) after which each element looks the same again.
const SHAPE_PERIOD: Record<ShapeType, number> = {
  circle: 1,
  square: 90,
  cross: 90,
  triangle: 120,
  star: 72,
  pentagon: 72,
  hexagon: 60,
  arrow: 360,
}
const MARK_PERIOD: Record<InnerMark, number> = { none: 1, dot: 1, line: 180, x: 90 }

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}
function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b)
}

/** Rotation after which this whole picture looks identical (capped at 360). */
export function rotationPeriod(s: ShapeSpec): number {
  let p = SHAPE_PERIOD[s.type]
  if (s.fill === 'half') p = 360
  if (s.nested) p = lcm(p, SHAPE_PERIOD[s.nested])
  else p = lcm(p, MARK_PERIOD[s.inner ?? 'none'])
  return Math.min(360, p)
}

/** Arrows have no room inside for marks or nested shapes. */
export function canHoldInner(type: ShapeType): boolean {
  return type !== 'arrow'
}

export function generateRandomShape(rng: RngFn): ShapeSpec {
  return {
    type: pickOne(rng, SHAPE_TYPES),
    color: pickOne(rng, COLORS),
    size: pickOne(rng, SIZES),
    rotation: pickOne(rng, ROTATIONS),
    fill: pickOne(rng, BASIC_FILLS),
    count: 1,
    inner: 'none',
    nested: null,
  }
}

// A star turned 90° looks like one turned 18° (its period is 72°), which a
// child can't tell apart. Rotations closer than this count as the same picture.
const MIN_VISIBLE_TURN = 25

/** True when two specs would look the same (or nearly the same) to a child. */
export function shapesLookAlike(a: ShapeSpec, b: ShapeSpec): boolean {
  if (a.type !== b.type || a.color !== b.color || a.size !== b.size || a.fill !== b.fill) return false
  if ((a.count ?? 1) !== (b.count ?? 1)) return false
  if ((a.nested ?? null) !== (b.nested ?? null)) return false
  if (!a.nested && (a.inner ?? 'none') !== (b.inner ?? 'none')) return false
  const period = rotationPeriod(a)
  const diff = (((a.rotation - b.rotation) % period) + period) % period
  return Math.min(diff, period - diff) < MIN_VISIBLE_TURN
}
