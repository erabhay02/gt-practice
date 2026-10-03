import { describe, expect, it } from 'vitest'
import { generatePaperFoldingQuestion } from './paperFoldingGenerator'
import type { ContentSpec, Point } from '../types'

const seeds = Array.from({ length: 80 }, (_, i) => i * 31337 + 11)

function holes(c: ContentSpec): Point[] {
  if (c.kind !== 'paper') throw new Error('expected paper')
  return c.holes
}

function key(pts: Point[]): string {
  return pts.map((p) => `${p.x},${p.y}`).sort().join('|')
}

describe('generatePaperFoldingQuestion (fold, punch, unfold)', () => {
  it('has 4 choices, exactly one correct, all different', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generatePaperFoldingQuestion(d, seed)
        expect(q.choices).toHaveLength(4)
        expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
        expect(new Set(q.choices.map((c) => key(holes(c.content)))).size).toBe(4)
      }
    }
  })

  it('the correct answer has punched holes x 2 per fold, all on the paper', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generatePaperFoldingQuestion(d, seed)
        const row = q.promptVisual![0].filter((c) => c.kind === 'paper')
        const folds = row.length - 1
        const punched = holes(row[row.length - 1]).length
        const correct = holes(q.choices.find((c) => c.isCorrect)!.content)
        expect(correct).toHaveLength(punched * 2 ** folds)
        for (const p of correct) {
          expect(p.x).toBeGreaterThan(0)
          expect(p.x).toBeLessThan(64)
          expect(p.y).toBeGreaterThan(0)
          expect(p.y).toBeLessThan(64)
        }
      }
    }
  })

  it('every choice is visibly different from the others (no near-identical hole sets)', () => {
    const close = (p: Point, set: Point[]) => set.some((q) => Math.abs(p.x - q.x) < 12 && Math.abs(p.y - q.y) < 12)
    const nearlySame = (a: Point[], b: Point[]) =>
      a.length === b.length && a.every((p) => close(p, b)) && b.every((p) => close(p, a))
    for (let seed = 1; seed <= 400; seed++) {
      for (const d of [1, 2, 3] as const) {
        const sets = generatePaperFoldingQuestion(d, seed).choices.map((c) => holes(c.content))
        expect(sets).toHaveLength(4)
        for (let i = 0; i < sets.length; i++)
          for (let j = i + 1; j < sets.length; j++) expect(nearlySame(sets[i], sets[j])).toBe(false)
      }
    }
  })

  it('uses two folds on the hardest items', () => {
    const q = generatePaperFoldingQuestion(3, 42)
    expect(q.promptVisual![0].filter((c) => c.kind === 'paper')).toHaveLength(3)
  })

  it('is deterministic for a given seed', () => {
    expect(generatePaperFoldingQuestion(2, 777)).toEqual(generatePaperFoldingQuestion(2, 777))
  })
})
