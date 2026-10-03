import { mulberry32, pickOne, randomSeed, shuffle, type RngFn } from './rng'
import {
  COLORS,
  FILLS,
  INNER_MARKS,
  NESTED_TYPES,
  SHAPE_TYPES,
  SIZES,
  canHoldInner,
  generateRandomShape,
  shapesLookAlike,
} from './shapePalette'
import type { ContentSpec, Difficulty, InnerMark, Question, ShapeRotation, ShapeSpec, ShapeType } from '../types'

type Attr = 'color' | 'fill' | 'size' | 'rotation' | 'count' | 'inner' | 'nested'

type Transform =
  | { attr: 'color'; to: string }
  | { attr: 'fill'; to: ShapeSpec['fill'] }
  | { attr: 'size'; to: ShapeSpec['size'] }
  | { attr: 'count'; to: 2 | 3 }
  | { attr: 'rotation'; delta: number }
  | { attr: 'inner'; to: InnerMark }
  | { attr: 'nested'; to: ShapeType | null }

const ROTATION_DELTAS = [45, 90, 135, 180]

function rotate(r: ShapeRotation, delta: number): ShapeRotation {
  return ((((r + delta) % 360) + 360) % 360) as ShapeRotation
}

function apply(shape: ShapeSpec, transforms: Transform[]): ShapeSpec {
  let next = { ...shape }
  for (const t of transforms) {
    switch (t.attr) {
      case 'color':
        next = { ...next, color: t.to }
        break
      case 'fill':
        next = { ...next, fill: t.to }
        break
      case 'size':
        next = { ...next, size: t.to }
        break
      case 'count':
        next = { ...next, count: t.to }
        break
      case 'rotation':
        next = { ...next, rotation: rotate(next.rotation, t.delta) }
        break
      case 'inner':
        next = { ...next, inner: t.to }
        break
      case 'nested':
        next = { ...next, nested: t.to }
        break
    }
  }
  return next
}

function pickAttrs(rng: RngFn, difficulty: Difficulty): Attr[] {
  const pool: Attr[] = ['color', 'fill', 'size', 'rotation', 'count']
  if (difficulty >= 2) pool.push('inner', 'nested')
  for (;;) {
    const attrs = shuffle(rng, pool).slice(0, difficulty)
    const has = (a: Attr) => attrs.includes(a)
    // Combinations that make cramped or self-hiding pictures.
    if (has('size') && has('count')) continue
    if (has('inner') && has('nested')) continue
    if ((has('count') || has('size')) && (has('inner') || has('nested'))) continue
    return attrs
  }
}

function buildTransform(rng: RngFn, attr: Attr, a: ShapeSpec): Transform {
  switch (attr) {
    case 'color':
      return { attr, to: pickOne(rng, COLORS.filter((c) => c !== a.color)) }
    case 'fill':
      return { attr, to: pickOne(rng, FILLS.filter((f) => f !== a.fill)) }
    case 'size':
      return { attr, to: pickOne(rng, SIZES.filter((s) => s !== a.size)) }
    case 'count':
      return { attr, to: pickOne(rng, [2, 3] as const) }
    case 'rotation':
      return { attr, delta: pickOne(rng, ROTATION_DELTAS) }
    case 'inner':
      return { attr, to: pickOne(rng, INNER_MARKS.filter((m) => m !== (a.inner ?? 'none'))) }
    case 'nested':
      return { attr, to: pickOne(rng, [null, ...NESTED_TYPES].filter((n) => n !== (a.nested ?? null))) }
  }
}

// A plausible-but-wrong version of a single transform.
function wrongVersion(rng: RngFn, t: Transform, from: ShapeSpec): Transform {
  switch (t.attr) {
    case 'color':
      return { attr: 'color', to: pickOne(rng, COLORS.filter((c) => c !== t.to && c !== from.color)) }
    case 'fill':
      return { attr: 'fill', to: pickOne(rng, FILLS.filter((f) => f !== t.to && f !== from.fill)) }
    case 'size':
      return { attr: 'size', to: SIZES.find((s) => s !== t.to && s !== from.size) ?? t.to }
    case 'count':
      return { attr: 'count', to: t.to === 2 ? 3 : 2 }
    case 'rotation':
      // Turning the wrong way is the classic mistake.
      return { attr: 'rotation', delta: -t.delta }
    case 'inner':
      return { attr: 'inner', to: pickOne(rng, INNER_MARKS.filter((m) => m !== t.to && m !== (from.inner ?? 'none'))) }
    case 'nested':
      return { attr: 'nested', to: pickOne(rng, NESTED_TYPES.filter((n) => n !== t.to && n !== (from.nested ?? null))) }
  }
}

function buildItem(rng: RngFn, difficulty: Difficulty) {
  const attrs = pickAttrs(rng, difficulty)
  const usesInside = attrs.includes('inner') || attrs.includes('nested')
  const typePool = usesInside ? SHAPE_TYPES.filter(canHoldInner) : SHAPE_TYPES

  const a: ShapeSpec = { ...generateRandomShape(rng), count: 1, type: pickOne(rng, typePool) }
  if (difficulty >= 2 && !attrs.includes('fill')) a.fill = pickOne(rng, FILLS)
  if (attrs.includes('count') && a.size === 'large') a.size = 'medium'
  // Marks and nested shapes need room to be readable.
  if (usesInside && a.size === 'small') a.size = 'medium'
  if (usesInside && !attrs.includes('size')) a.size = 'large'

  const transforms = attrs.map((attr) => buildTransform(rng, attr, a))

  // C keeps A's values for every changing attribute, so the rule reads clearly;
  // it differs in shape (and, on harder items, one non-changing attribute too).
  let c: ShapeSpec = { ...a, type: pickOne(rng, typePool.filter((t) => t !== a.type)) }
  if (difficulty === 3) {
    const free = (['color', 'fill'] as const).filter((k) => !attrs.includes(k))
    if (free.includes('color')) c = { ...c, color: pickOne(rng, COLORS.filter((x) => x !== a.color)) }
    else if (free.includes('fill')) c = { ...c, fill: pickOne(rng, FILLS.filter((x) => x !== a.fill)) }
  }

  const b = apply(a, transforms)
  const d = apply(c, transforms)
  return { a, b, c, d, transforms, typePool }
}

function buildDistractors(rng: RngFn, item: ReturnType<typeof buildItem>): ShapeSpec[] {
  const { b, c, d, transforms, typePool } = item
  const candidates: ShapeSpec[] = []

  if (transforms.length > 1) {
    const skip = Math.floor(rng() * transforms.length)
    candidates.push(apply(c, transforms.filter((_, i) => i !== skip)))
  } else {
    candidates.push(c)
  }

  const wrongIdx = Math.floor(rng() * transforms.length)
  candidates.push(apply(c, transforms.map((t, i) => (i === wrongIdx ? wrongVersion(rng, t, c) : t))))

  candidates.push(b)
  candidates.push({ ...d, type: pickOne(rng, typePool.filter((t) => t !== d.type && t !== b.type)) })
  candidates.push(c)
  candidates.push(apply(c, transforms.map((t) => wrongVersion(rng, t, c))))

  const result: ShapeSpec[] = []
  for (const cand of candidates) {
    if (shapesLookAlike(cand, d)) continue
    if (result.some((r) => shapesLookAlike(r, cand))) continue
    result.push(cand)
    if (result.length === 3) break
  }
  return result
}

export function generateMatrixQuestion(difficulty: Difficulty, seed: number = randomSeed()): Question {
  const rng = mulberry32(seed)

  let item = buildItem(rng, difficulty)
  let distractors = buildDistractors(rng, item)
  // Re-roll the rare item where a change is invisible or distractors collapse.
  while (
    shapesLookAlike(item.a, item.b) ||
    shapesLookAlike(item.c, item.d) ||
    distractors.length < 3
  ) {
    item = buildItem(rng, difficulty)
    distractors = buildDistractors(rng, item)
  }

  const shape = (spec: ShapeSpec): ContentSpec => ({ kind: 'shape', spec })
  const options = shuffle(rng, [
    { spec: item.d, isCorrect: true },
    ...distractors.map((spec) => ({ spec, isCorrect: false })),
  ])

  return {
    id: `figure-matrix-${difficulty}-${seed}`,
    domain: 'nonverbal',
    subType: 'figure-matrix',
    difficulty,
    promptAudioText:
      'Look at the top row. The first picture changes to make the second picture. In the bottom row, which picture changes the same way to go where the question mark is?',
    promptVisual: [
      [shape(item.a), shape(item.b)],
      [shape(item.c), { kind: 'blank' }],
    ],
    choices: options.map((o, i) => ({ id: `c${i}`, content: shape(o.spec), isCorrect: o.isCorrect })),
    source: 'generated',
    generatorSeed: seed,
  }
}
