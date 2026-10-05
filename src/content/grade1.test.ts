import { describe, expect, it } from 'vitest'
import { getQuestionPool, getRampedQuestions, AVAILABLE_SUBTYPES } from './contentLoader'
import { generateFigureClassificationQuestion } from './generators/classificationGenerator'
import { generateMatrixQuestion } from './generators/matrixGenerator'
import { generateNumberAnalogyQuestion, generateNumberPuzzleQuestion, generateNumberSeriesQuestion } from './generators/numberGenerators'
import { generatePaperFoldingQuestion } from './generators/paperFoldingGenerator'
import { shapesLookAlike } from './generators/shapePalette'
import { mockLengthFor } from './levels'
import type { ContentSpec, Question, ShapeSpec } from './types'

const seeds = Array.from({ length: 300 }, (_, i) => i * 97 + 13)
const DIFFS = [1, 2, 3] as const

const shapesIn = (q: Question): ShapeSpec[] =>
  [...(q.promptVisual ?? []).flat(), ...q.choices.map((c) => c.content)].flatMap((c: ContentSpec) =>
    c.kind === 'shape' ? [c.spec] : [],
  )

function expectWellFormed(q: Question) {
  expect(q.choices).toHaveLength(4)
  expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
}

describe('1st grade (CogAT Level 7) stays within 1st-grade features', () => {
  it('Figure Matrices: no marks, nested shapes or half-shading; only quarter/half turns; distinct choices', () => {
    for (const s of seeds) for (const d of DIFFS) {
      const q = generateMatrixQuestion(d, s, 1)
      expectWellFormed(q)
      for (const sh of shapesIn(q)) {
        expect(sh.inner ?? 'none').toBe('none')
        expect(sh.nested ?? null).toBeNull()
        expect(sh.fill).not.toBe('half')
        expect(sh.rotation % 90).toBe(0)
      }
      const choices = q.choices.map((c) => (c.content as { spec: ShapeSpec }).spec)
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(shapesLookAlike(choices[i], choices[j])).toBe(false)
    }
  })

  it('Figure Classification: unrotated, no half-shading/marks/nested shapes', () => {
    for (const s of seeds) for (const d of DIFFS) {
      const q = generateFigureClassificationQuestion(d, s, 1)
      expectWellFormed(q)
      for (const sh of shapesIn(q)) {
        expect(sh.rotation).toBe(0)
        expect(sh.fill).not.toBe('half')
        expect(sh.inner ?? 'none').toBe('none')
        expect(sh.nested ?? null).toBeNull()
      }
    }
  })

  it('Paper Folding: one straight fold, round holes, at most 2 punched', () => {
    for (const s of seeds) for (const d of DIFFS) {
      const q = generatePaperFoldingQuestion(d, s, 1)
      expectWellFormed(q)
      const papers = q.promptVisual![0].filter((c) => c.kind === 'paper')
      expect(papers).toHaveLength(2)
      const first = papers[0]
      if (first.kind !== 'paper') throw new Error()
      expect(['vertical', 'horizontal']).toContain(first.foldLines![0])
      const punched = papers[1].kind === 'paper' ? papers[1].holes : []
      expect(punched.length).toBeLessThanOrEqual(2)
      expect(punched.every((h) => (h.cut ?? 'circle') === 'circle')).toBe(true)
    }
  })

  it('Number parts: amounts up to 8; Number Puzzles are always pictures', () => {
    const amount = (c: ContentSpec) =>
      c.kind === 'group' ? c.count : c.kind === 'abacus' ? Math.max(...c.counts.map((n) => n ?? 0)) : c.kind === 'text' ? Number(c.value) : 0
    for (const s of seeds) for (const d of DIFFS) {
      for (const q of [generateNumberAnalogyQuestion(d, s, 1), generateNumberSeriesQuestion(d, s, 1), generateNumberPuzzleQuestion(d, s, 1)]) {
        expectWellFormed(q)
        for (const c of [...(q.promptVisual ?? []).flat(), ...q.choices.map((x) => x.content)]) {
          if (c.kind === 'text' && !/^\d+$/.test(c.value)) continue
          expect(amount(c)).toBeLessThanOrEqual(8)
        }
      }
      const puzzle = generateNumberPuzzleQuestion(d, s, 1)
      expect(puzzle.choices.every((c) => c.content.kind === 'group')).toBe(true)
    }
  })

  it('every part serves 1st-grade questions and full-length Level 7 practice tests', () => {
    for (const { subType } of AVAILABLE_SUBTYPES) {
      expect(getQuestionPool(subType, 2, 8, [], 1)).toHaveLength(8)
      expect(getRampedQuestions(subType, mockLengthFor(1, subType), [], 1)).toHaveLength(mockLengthFor(1, subType))
    }
  })

  it('1st-grade generated questions have their own ids (no collisions with 2nd grade)', () => {
    expect(generateMatrixQuestion(2, 5, 1).id).not.toBe(generateMatrixQuestion(2, 5, 2).id)
  })
})
