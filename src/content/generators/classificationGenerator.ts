import { generatedId, mulberry32, pickOne, randomSeed, shuffle, upperGradeDifficulty } from './rng'
import {
  COLORS,
  COUNTS,
  EASY_SHAPE_TYPES,
  FILLS,
  INNER_MARKS,
  NESTED_TYPES,
  ROTATIONS,
  SHAPE_TYPES,
  SIZES,
  canHoldInner,
  shapesLookAlike,
} from './shapePalette'
import type { ContentSpec, Difficulty, Grade, Question, ShapeSpec } from '../types'

export type Feature = 'type' | 'color' | 'fill' | 'size' | 'count' | 'inner' | 'nested'
type Value = string | number | null

export function featureValue(shape: ShapeSpec, f: Feature): Value {
  if (f === 'count') return shape.count ?? 1
  if (f === 'inner') return shape.nested ? 'none' : (shape.inner ?? 'none')
  if (f === 'nested') return shape.nested ?? null
  return shape[f]
}

function sharedChoices(difficulty: Difficulty, grade: Grade): Feature[] {
  // 1st grade: one obvious shared feature; size only on the hardest items.
  if (grade === 1) return difficulty === 1 ? ['type', 'color'] : difficulty === 2 ? ['type', 'color', 'fill'] : ['type', 'color', 'fill', 'size']
  if (difficulty === 1) return ['type', 'color', 'fill']
  if (difficulty === 2) return ['type', 'color', 'fill', 'size', 'count', 'inner']
  return ['type', 'color', 'fill', 'size', 'count', 'inner', 'nested']
}

// Easier items vary fewer "noise" features, so the shared feature stands out.
function varyingFeatures(shared: Feature, difficulty: Difficulty, grade: Grade): Feature[] {
  const others = (['type', 'color', 'fill', 'size'] as Feature[]).filter((f) => f !== shared)
  if (grade === 1) return others.slice(0, difficulty === 3 ? 2 : 1)
  if (difficulty === 1) return others.slice(0, 1)
  if (difficulty === 2) return others.slice(0, 2)
  return others
}

export function generateFigureClassificationQuestion(
  difficulty: Difficulty,
  seed: number = randomSeed(),
  grade: Grade = 2,
): Question {
  // Kindergarten uses the easiest 1st-grade items; grades 3–4 the 2nd-grade
  // rules, one step harder.
  const level: Grade = grade === 0 ? 1 : grade >= 3 ? 2 : grade
  const d: Difficulty = grade === 0 ? 1 : grade >= 3 ? upperGradeDifficulty(difficulty, grade) : difficulty
  const rng = mulberry32(seed)
  const shared = pickOne(rng, sharedChoices(d, level))
  const inside = shared === 'inner' || shared === 'nested'
  const easy = level === 1 || d === 1

  const pools: Record<Feature, readonly Value[]> = {
    type: inside ? SHAPE_TYPES.filter(canHoldInner) : easy ? EASY_SHAPE_TYPES : SHAPE_TYPES,
    color: COLORS,
    fill: easy ? FILLS.filter((f) => f !== 'half') : FILLS,
    size: inside ? SIZES.filter((s) => s !== 'small') : SIZES,
    count: COUNTS,
    inner: INNER_MARKS,
    nested: [null, ...NESTED_TYPES],
  }
  const sharedValue = pickOne(
    rng,
    shared === 'count' ? [2, 3] : shared === 'inner' ? ['dot', 'line', 'x'] : shared === 'nested' ? NESTED_TYPES : pools[shared],
  )
  const varying = varyingFeatures(shared, d, level)

  // Everything starts from one base; only the `varying` features change across
  // examples, so they're the noise the child must learn to ignore.
  let base: ShapeSpec = {
    type: pickOne(rng, pools.type) as ShapeSpec['type'],
    color: pickOne(rng, COLORS),
    fill: pickOne(rng, pools.fill) as ShapeSpec['fill'],
    size: pickOne(rng, pools.size) as ShapeSpec['size'],
    rotation: 0,
    count: 1,
    inner: 'none',
    nested: null,
  }
  base = { ...base, [shared]: sharedValue } as ShapeSpec
  if (shared === 'count' && base.size === 'large') base.size = 'medium'

  const makeMember = (): ShapeSpec => {
    let s: ShapeSpec = { ...base, rotation: easy ? 0 : pickOne(rng, ROTATIONS) }
    for (const f of varying) s = { ...s, [f]: pickOne(rng, pools[f]) } as ShapeSpec
    return s
  }

  // Examples must not accidentally share any noise feature.
  let examples: ShapeSpec[] = []
  for (let attempt = 0; attempt < 200; attempt++) {
    examples = [makeMember(), makeMember(), makeMember()]
    const varied = varying.every((f) => new Set(examples.map((e) => featureValue(e, f))).size >= 2)
    const distinct =
      !shapesLookAlike(examples[0], examples[1]) &&
      !shapesLookAlike(examples[1], examples[2]) &&
      !shapesLookAlike(examples[0], examples[2])
    if (varied && distinct) break
  }

  let correct = makeMember()
  for (let i = 0; i < 50 && examples.some((e) => shapesLookAlike(e, correct)); i++) correct = makeMember()

  // Distractors look like members (same noise ranges) but break the rule.
  const wrongValues = shuffle(
    rng,
    (shared === 'count' ? [1, 2, 3] : [...pools[shared]]).filter((v) => v !== sharedValue),
  )
  const distractors: ShapeSpec[] = []
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
    id: generatedId('figure-classification', grade, difficulty, seed),
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
