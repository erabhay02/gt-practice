import { describe, expect, it } from 'vitest'
import { generateFigureClassificationQuestion } from './classificationGenerator'
import { shapesLookAlike } from './shapePalette'
import type { ContentSpec, ShapeSpec } from '../types'

const seeds = Array.from({ length: 80 }, (_, i) => i * 104729 + 3)
const FEATURES = ['type', 'color', 'fill', 'size', 'count'] as const

function spec(c: ContentSpec): ShapeSpec {
  if (c.kind !== 'shape') throw new Error('expected shape')
  return c.spec
}

function value(s: ShapeSpec, f: (typeof FEATURES)[number]) {
  return f === 'count' ? (s.count ?? 1) : s[f]
}

describe('generateFigureClassificationQuestion', () => {
  it('shows 3 examples and 4 choices with exactly one correct', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generateFigureClassificationQuestion(d, seed)
        expect(q.promptVisual![0]).toHaveLength(3)
        expect(q.choices).toHaveLength(4)
        expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
      }
    }
  })

  it('is unambiguous: only the correct choice fits every feature the examples share', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generateFigureClassificationQuestion(d, seed)
        const examples = q.promptVisual![0].map(spec)
        const common = FEATURES.filter((f) => new Set(examples.map((e) => value(e, f))).size === 1)
        const fits = (s: ShapeSpec) => common.every((f) => value(s, f) === value(examples[0], f))
        for (const c of q.choices) expect(fits(spec(c.content))).toBe(c.isCorrect)
      }
    }
  })

  it('has no look-alike choices', () => {
    for (const seed of seeds) {
      const specs = generateFigureClassificationQuestion(3, seed).choices.map((c) => spec(c.content))
      for (let i = 0; i < specs.length; i++)
        for (let j = i + 1; j < specs.length; j++) expect(shapesLookAlike(specs[i], specs[j])).toBe(false)
    }
  })

  it('is deterministic for a given seed', () => {
    expect(generateFigureClassificationQuestion(2, 555)).toEqual(generateFigureClassificationQuestion(2, 555))
  })
})
