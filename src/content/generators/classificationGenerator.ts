import { mulberry32, pickOne, randomSeed, shuffle, type RngFn } from './rng'
import { COLORS, COUNTS, FILLS, ROTATIONS, SHAPE_TYPES, SIZES, shapesLookAlike } from './shapePalette'
import type { ContentSpec, Difficulty, Question, ShapeSpec } from '../types'

type Feature = 'type' | 'color' | 'fill' | 'size' | 'count'

const POOLS: Record<Feature, readonly (string | number)[]> = {
  type: SHAPE_TYPES,
  color: COLORS,
  fill: FILLS,
  size: SIZES,
  count: COUNTS,
}

function featureValue(shape: ShapeSpec, f: Feature): string | number {
  return f === 'count' ? (shape.count ?? 1) : shape[f]
}

function randomShapeWith(rng: RngFn, f: Feature, value: string | number, allowCount: boolean): ShapeSpec {
  const shape: ShapeSpec = {
    type: pickOne(rng, SHAPE_TYPES),
    color: pickOne(rng, COLORS),
    fill: pickOne(rng, FILLS),
    size: pickOne(rng, SIZES),
    rotation: pickOne(rng, ROTATIONS),
    count: allowCount ? pickOne(rng, COUNTS) : 1,
  }
  return { ...shape, [f]: value } as ShapeSpec
}

// Easier items vary fewer "noise" features, so the shared feature stands out.
function varyingFeatures(shared: Feature, difficulty: Difficulty): Feature[] {
  const order: Feature[] = ['type', 'color', 'fill', 'size']
  const others = order.filter((f) => f !== shared)
  if (difficulty === 1) return others.slice(0, 1)
  if (difficulty === 2) return others.slice(0, 2)
  return others
}

export function generateFigureClassificationQuestion(difficulty: Difficulty, seed: number = randomSeed()): Question {
  const rng = mulberry32(seed)
  const shared = pickOne(rng, (difficulty === 1 ? ['type', 'color', 'fill'] : ['type', 'color', 'fill', 'size', 'count']) as Feature[])
  const sharedValue = pickOne(rng, shared === 'count' ? [2, 3] : POOLS[shared])
  const allowCount = shared === 'count'
  const varying = varyingFeatures(shared, difficulty)

  // Base shape everything starts from; non-varying features stay fixed so the
  // only things that change across the examples are noise the child must ignore.
  const base = randomShapeWith(rng, shared, sharedValue, false)
  if (allowCount && base.size === 'large') base.size = 'medium'

  const makeMember = (): ShapeSpec => {
    let s: ShapeSpec = { ...base, rotation: pickOne(rng, ROTATIONS) }
    for (const f of varying) {
      const v = pickOne(rng, POOLS[f])
      s = { ...s, [f]: v } as ShapeSpec
    }
    return s
  }

  // Examples must not accidentally share any feature other than the rule.
  let examples: ShapeSpec[] = []
  for (let attempt = 0; attempt < 200; attempt++) {
    examples = [makeMember(), makeMember(), makeMember()]
    const ok = varying.every((f) => new Set(examples.map((e) => featureValue(e, f))).size >= 2)
    const distinct = !shapesLookAlike(examples[0], examples[1]) && !shapesLookAlike(examples[1], examples[2]) && !shapesLookAlike(examples[0], examples[2])
    if (ok && distinct) break
  }

  let correct = makeMember()
  for (let i = 0; i < 50 && examples.some((e) => shapesLookAlike(e, correct)); i++) correct = makeMember()

  // Distractors look like members (same noise ranges) but break the rule.
  const distractors: ShapeSpec[] = []
  const wrongValues = shuffle(rng, (shared === 'count' ? [1, 2, 3] : [...POOLS[shared]]).filter((v) => v !== sharedValue))
  for (let i = 0; distractors.length < 3 && i < 100; i++) {
    const cand = { ...makeMember(), [shared]: wrongValues[i % wrongValues.length] } as ShapeSpec
    if (shapesLookAlike(cand, correct) || distractors.some((d) => shapesLookAlike(d, cand))) continue
    distractors.push(cand)
  }

  const shape = (spec: ShapeSpec): ContentSpec => ({ kind: 'shape', spec })
  const options = shuffle(rng, [
    { spec: correct, isCorrect: true },
    ...distractors.map((spec) => ({ spec, isCorrect: false })),
  ])

  return {
    id: `figure-classification-${difficulty}-${seed}`,
    domain: 'nonverbal',
    subType: 'figure-classification',
    difficulty,
    promptAudioText: 'The three shapes in the top row are alike in some way. Which shape below goes with them?',
    promptVisual: [examples.map(shape)],
    choices: options.map((o, i) => ({ id: `c${i}`, content: shape(o.spec), isCorrect: o.isCorrect })),
    source: 'generated',
    generatorSeed: seed,
  }
}
