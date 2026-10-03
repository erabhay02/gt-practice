import type { ShapeFill, ShapeRotation, ShapeSize, ShapeSpec, ShapeType } from '../types'
import { pickOne, type RngFn } from './rng'

// Circle/square/cross are excluded: they look identical after many of our
// 45° rotations, so rotation-based items would show "different" answers that
// look the same.
export const SHAPE_TYPES: ShapeType[] = ['triangle', 'star', 'pentagon', 'hexagon', 'arrow']
export const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#a855f7']
export const SIZES: ShapeSize[] = ['small', 'medium', 'large']
export const ROTATIONS: ShapeRotation[] = [0, 45, 90, 135, 180, 225, 270, 315]
export const FILLS: ShapeFill[] = ['solid', 'striped', 'dotted', 'outline']
export const COUNTS: (1 | 2 | 3)[] = [1, 2, 3]

const ROTATION_PERIOD: Record<ShapeType, number> = {
  circle: 1,
  square: 90,
  cross: 90,
  triangle: 120,
  star: 72,
  pentagon: 72,
  hexagon: 60,
  arrow: 360,
}

export function generateRandomShape(rng: RngFn): ShapeSpec {
  return {
    type: pickOne(rng, SHAPE_TYPES),
    color: pickOne(rng, COLORS),
    size: pickOne(rng, SIZES),
    rotation: pickOne(rng, ROTATIONS),
    fill: pickOne(rng, FILLS),
    count: 1,
  }
}

/** True when two specs would render as visually identical pictures. */
export function shapesLookAlike(a: ShapeSpec, b: ShapeSpec): boolean {
  if (a.type !== b.type || a.color !== b.color || a.size !== b.size || a.fill !== b.fill) return false
  if ((a.count ?? 1) !== (b.count ?? 1)) return false
  const period = ROTATION_PERIOD[a.type]
  return ((a.rotation - b.rotation) % period + period) % period === 0
}
