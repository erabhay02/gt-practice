import { describe, expect, it } from 'vitest'
import { generateMatrixQuestion } from './matrixGenerator'
import { shapesLookAlike } from './shapePalette'
import type { ContentSpec, ShapeSpec } from '../types'

const seeds = Array.from({ length: 60 }, (_, i) => i * 7919 + 1)

function spec(c: ContentSpec): ShapeSpec {
  if (c.kind !== 'shape') throw new Error('expected shape')
  return c.spec
}

describe('generateMatrixQuestion (2x2 analogy, like CogAT Level 8)', () => {
  it('is always a 2x2 grid with the bottom-right blank', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generateMatrixQuestion(d, seed)
        expect(q.promptVisual).toHaveLength(2)
        expect(q.promptVisual!.every((r) => r.length === 2)).toBe(true)
        expect(q.promptVisual![1][1].kind).toBe('blank')
      }
    }
  })

  it('has 4 choices, exactly one correct, none that look alike', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generateMatrixQuestion(d, seed)
        expect(q.choices).toHaveLength(4)
        expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
        const specs = q.choices.map((c) => spec(c.content))
        for (let i = 0; i < specs.length; i++)
          for (let j = i + 1; j < specs.length; j++) expect(shapesLookAlike(specs[i], specs[j])).toBe(false)
      }
    }
  })

  it('the top-row change is always visible', () => {
    for (const seed of seeds) {
      const q = generateMatrixQuestion(1, seed)
      const [a, b] = q.promptVisual![0].map(spec)
      expect(shapesLookAlike(a, b)).toBe(false)
    }
  })

  it('is deterministic for a given seed', () => {
    expect(generateMatrixQuestion(2, 777)).toEqual(generateMatrixQuestion(2, 777))
  })
})
