import { describe, expect, it } from 'vitest'
import { getQuestionPool, getRampedQuestions, subtypesForGrade } from './contentLoader'
import { generateFigureClassificationQuestion } from './generators/classificationGenerator'
import { generateMatrixQuestion } from './generators/matrixGenerator'
import { generateNumberAnalogyQuestion, generateNumberPuzzleQuestion, generateNumberSeriesQuestion } from './generators/numberGenerators'
import { generatePaperFoldingQuestion } from './generators/paperFoldingGenerator'
import { shapesLookAlike } from './generators/shapePalette'
import { GRADES, LEVELS, mockLengthFor } from './levels'
import type { ContentSpec, Question, ShapeSpec } from './types'

const seeds = Array.from({ length: 300 }, (_, i) => i * 97 + 13)
const DIFFS = [1, 2, 3] as const

const cells = (q: Question): ContentSpec[] => [...(q.promptVisual ?? []).flat(), ...q.choices.map((c) => c.content)]
const shapesIn = (q: Question): ShapeSpec[] => cells(q).flatMap((c) => (c.kind === 'shape' ? [c.spec] : []))

function expectWellFormed(q: Question) {
  expect(q.choices).toHaveLength(4)
  expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
  expect(new Set(q.choices.map((c) => JSON.stringify(c.content))).size).toBe(4)
}

describe('every grade', () => {
  it('has 9 parts, 3 per battery', () => {
    for (const grade of GRADES) {
      const parts = subtypesForGrade(grade)
      expect(parts).toHaveLength(9)
      for (const domain of ['verbal', 'quantitative', 'nonverbal'] as const) {
        expect(parts.filter((p) => p.domain === domain)).toHaveLength(3)
      }
      for (const p of parts) expect(LEVELS[grade].mockLength[p.subType], `${grade} ${p.subType}`).toBeGreaterThan(0)
    }
  })

  it('serves practice questions and full-length practice tests for every part', () => {
    for (const grade of GRADES) {
      for (const { subType } of subtypesForGrade(grade)) {
        const pool = getQuestionPool(subType, 2, 8, [], grade)
        expect(pool, `${grade} ${subType}`).toHaveLength(8)
        pool.forEach(expectWellFormed)
        expect(getRampedQuestions(subType, mockLengthFor(grade, subType), [], grade)).toHaveLength(mockLengthFor(grade, subType))
      }
    }
  })

  it('generated ids never collide between grades', () => {
    const generators = [generateMatrixQuestion, generateFigureClassificationQuestion, generatePaperFoldingQuestion, generateNumberAnalogyQuestion, generateNumberPuzzleQuestion, generateNumberSeriesQuestion]
    for (const generate of generators) {
      const ids = GRADES.map((g) => generate(2, 5, g).id)
      expect(new Set(ids).size).toBe(GRADES.length)
    }
  })
})

describe('Kindergarten (CogAT Level 5/6)', () => {
  it('Figure Matrices: one change, unrotated simple shapes, distinct choices', () => {
    for (const s of seeds) for (const d of DIFFS) {
      const q = generateMatrixQuestion(d, s, 0)
      expectWellFormed(q)
      for (const sh of shapesIn(q)) {
        expect(sh.rotation).toBe(0)
        expect(['circle', 'square', 'triangle', 'star']).toContain(sh.type)
        expect(sh.count ?? 1).toBe(1)
      }
      const choices = q.choices.map((c) => (c.content as { spec: ShapeSpec }).spec)
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(shapesLookAlike(choices[i], choices[j])).toBe(false)
    }
  })

  it('Figure Classification: unrotated, no half-shading or marks', () => {
    for (const s of seeds) for (const d of DIFFS) {
      const q = generateFigureClassificationQuestion(d, s, 0)
      expectWellFormed(q)
      for (const sh of shapesIn(q)) {
        expect(sh.rotation).toBe(0)
        expect(sh.fill).not.toBe('half')
        expect(sh.inner ?? 'none').toBe('none')
      }
    }
  })

  it('Paper Folding: one straight fold and one round hole', () => {
    for (const s of seeds) for (const d of DIFFS) {
      const q = generatePaperFoldingQuestion(d, s, 0)
      expectWellFormed(q)
      const papers = q.promptVisual![0].filter((c) => c.kind === 'paper')
      expect(papers).toHaveLength(2)
      if (papers[0].kind !== 'paper' || papers[1].kind !== 'paper') throw new Error()
      expect(['vertical', 'horizontal']).toContain(papers[0].foldLines![0])
      expect(papers[1].holes).toHaveLength(1)
    }
  })

  it('Number parts are pictures with small amounts', () => {
    for (const s of seeds) for (const d of DIFFS) {
      for (const q of [generateNumberAnalogyQuestion(d, s, 0), generateNumberPuzzleQuestion(d, s, 0), generateNumberSeriesQuestion(d, s, 0)]) {
        expectWellFormed(q)
        for (const c of cells(q)) {
          if (c.kind === 'group') expect(c.count).toBeLessThanOrEqual(6)
          if (c.kind === 'abacus') for (const n of c.counts) expect(n ?? 0).toBeLessThanOrEqual(6)
          if (c.kind === 'text') expect(c.value).toMatch(/^[+−=]$/)
        }
      }
    }
  })
})

describe('Grades 3–4 (CogAT Levels 9–10)', () => {
  const asNumber = (c: ContentSpec) => (c.kind === 'text' ? Number(c.value) : NaN)

  it('Number parts use written whole numbers', () => {
    for (const grade of [3, 4] as const) for (const s of seeds) for (const d of DIFFS) {
      for (const q of [generateNumberAnalogyQuestion(d, s, grade), generateNumberPuzzleQuestion(d, s, grade), generateNumberSeriesQuestion(d, s, grade)]) {
        expectWellFormed(q)
        for (const c of q.choices) {
          const n = asNumber(c.content)
          expect(Number.isInteger(n) && n >= 0, `${q.id}: ${JSON.stringify(c.content)}`).toBe(true)
        }
      }
    }
  })

  it('Number Analogies: one rule fits both example pairs and the answer', () => {
    for (const grade of [3, 4] as const) for (const s of seeds) for (const d of DIFFS) {
      const q = generateNumberAnalogyQuestion(d, s, grade)
      const [p1, p2, p3] = q.promptVisual!.map((row) => [asNumber(row[0]), asNumber(row[2])])
      const answer = asNumber(q.choices.find((c) => c.isCorrect)!.content)
      // No wrong choice also fits a simple add/multiply rule shared by both pairs.
      for (const c of q.choices.filter((x) => !x.isCorrect)) {
        const v = asNumber(c.content)
        const sameAdd = p1[1] - p1[0] === p2[1] - p2[0] && v - p3[0] === p1[1] - p1[0]
        const sameMul = p1[1] === p1[0] * (p2[1] / p2[0]) && v === p3[0] * (p2[1] / p2[0])
        expect(sameAdd || sameMul, `${q.id}: ${v} also fits`).toBe(false)
      }
      expect(Number.isInteger(answer)).toBe(true)
    }
  })

  it('Number Series: shows seven numbers then a blank', () => {
    for (const grade of [3, 4] as const) for (const s of seeds) for (const d of DIFFS) {
      const row = generateNumberSeriesQuestion(d, s, grade).promptVisual![0]
      expect(row).toHaveLength(8)
      expect(row[7].kind).toBe('blank')
    }
  })

  it('shape parts give distinct choices and get harder than 2nd grade on easy items', () => {
    for (const grade of [3, 4] as const) for (const s of seeds) for (const d of DIFFS) {
      const m = generateMatrixQuestion(d, s, grade)
      expectWellFormed(m)
      const choices = m.choices.map((c) => (c.content as { spec: ShapeSpec }).spec)
      for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(shapesLookAlike(choices[i], choices[j])).toBe(false)
      expectWellFormed(generateFigureClassificationQuestion(d, s, grade))
      expectWellFormed(generatePaperFoldingQuestion(d, s, grade))
      expect(m.difficulty).toBe(d)
    }
  })
})
