import { describe, expect, it } from 'vitest'
import { AVAILABLE_SUBTYPES, getQuestionPool, getRampedQuestions } from './contentLoader'

describe('getQuestionPool', () => {
  it('serves 4-choice, one-correct questions for all 9 subtests', () => {
    expect(AVAILABLE_SUBTYPES).toHaveLength(9)
    for (const { subType } of AVAILABLE_SUBTYPES) {
      const pool = getQuestionPool(subType, 2, 8)
      expect(pool).toHaveLength(8)
      for (const q of pool) {
        expect(q.subType).toBe(subType)
        expect(q.choices).toHaveLength(4)
        expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
      }
    }
  })

  it('does not always put the correct answer in the same position', () => {
    for (const subType of ['picture-analogy', 'picture-classification', 'sentence-completion'] as const) {
      const positions = new Set(
        getQuestionPool(subType, 1, 30).map((q) => q.choices.findIndex((c) => c.isCorrect)),
      )
      expect(positions.size).toBeGreaterThan(1)
    }
  })
})

describe('repeat avoidance for authored banks', () => {
  it('back-to-back draws excluding shown ids do not repeat until the bank runs out', () => {
    const shown: string[] = []
    for (let i = 0; i < 3; i++) {
      const ids = getQuestionPool('picture-classification', 1, 8, shown).map((q) => q.id)
      expect(ids.filter((id) => shown.includes(id))).toHaveLength(0)
      shown.push(...ids)
    }
  })

  it('always returns the requested count even once the bank is exhausted', () => {
    const allIds = Array.from({ length: 100 }, (_, i) => `picture-classification-${i}`)
    expect(getQuestionPool('picture-classification', 1, 8, allIds)).toHaveLength(8)
  })
})

describe('getRampedQuestions', () => {
  it('runs easy to hard like a real subtest', () => {
    const qs = getRampedQuestions('figure-matrix', 16)
    expect(qs).toHaveLength(16)
    const difficulties = qs.map((q) => q.difficulty)
    expect(difficulties).toEqual([...difficulties].sort())
    expect(difficulties[0]).toBe(1)
    expect(difficulties[15]).toBe(3)
  })
})
