import { describe, expect, it } from 'vitest'
import { buildArithmeticPicturesBank, buildAuralReasoningBank, buildFollowingDirectionsBank } from './banks/olsatListening'
import { buildAntonymBank, buildLogicalSelectionBank, buildSentenceArrangementBank } from './banks/olsatVerbal'
import { buildSentenceReadingBank } from './banks/sentenceReading'
import { buildVerbalAnalogyBank } from './banks/verbalAnalogy'
import { buildVerbalClassificationBank } from './banks/verbalClassification'
import { getQuestionPool, getRampedQuestions, testPlan } from './contentLoader'
import { FAMILIES, TEST_FAMILIES, levelName } from './families'
import {
  generatePatternCompletionQuestion,
  generateReasoningByAnalogyQuestion,
  generateSerialReasoningQuestion,
  generateSpatialVisualizationQuestion,
} from './generators/nnatGenerators'
import {
  generateArithmeticReasoningQuestion,
  generateFiguralSeriesQuestion,
  generateNumberMatrixQuestion,
  numberMatrixIsUnambiguous,
} from './generators/olsatGenerators'
import { shapesLookAlike } from './generators/shapePalette'
import { GRADES } from './levels'
import type { ContentSpec, Difficulty, Grade, LineStroke, Question } from './types'

const seeds = Array.from({ length: 200 }, (_, i) => i * 131 + 7)
const DIFFS = [1, 2, 3] as const
const val = (c: ContentSpec) => (c.kind === 'emoji' || c.kind === 'word' || c.kind === 'text' ? c.value : JSON.stringify(c))
const correctOf = (q: Question) => q.choices.find((c) => c.isCorrect)!.content

function expectWellFormed(q: Question) {
  expect(q.choices, q.id).toHaveLength(4)
  expect(q.choices.filter((c) => c.isCorrect), q.id).toHaveLength(1)
  expect(new Set(q.choices.map((c) => val(c.content))).size, q.id).toBe(4)
}

describe('test plans', () => {
  it('give every family and grade a level name and at least one part per battery used', () => {
    for (const family of TEST_FAMILIES) {
      for (const grade of GRADES) {
        const plan = testPlan(family, grade)
        expect(plan.levelName).toBe(levelName(family, grade))
        expect(plan.parts.length).toBeGreaterThan(0)
        expect(new Set(plan.parts.map((p) => p.subType)).size, `${family} ${grade}`).toBe(plan.parts.length)
        for (const p of plan.parts) expect(plan.mockLength(p.subType), `${family} ${grade} ${p.subType}`).toBeGreaterThan(0)
      }
    }
  })

  it('NNAT3 is all figural, 48 items in 30 minutes at every level', () => {
    for (const grade of GRADES) {
      const plan = testPlan('nnat3', grade)
      expect(plan.parts.every((p) => p.domain === 'nonverbal')).toBe(true)
      expect(plan.parts.reduce((n, p) => n + plan.mockLength(p.subType), 0)).toBe(48)
      expect(plan.totalMinutes).toBe(30)
    }
  })

  it('OLSAT practice tests match the public item totals per level', () => {
    const expected: Record<string, number> = { A: 40, B: 60, C: 60, D: 64, E: 72, F: 72 }
    for (const grade of GRADES) {
      const plan = testPlan('olsat', grade)
      const total = plan.parts.reduce((n, p) => n + plan.mockLength(p.subType), 0)
      expect(total, `grade ${grade}`).toBe(expected[FAMILIES.olsat.levels[grade]])
    }
  })

  it('CogAT keeps the official Riverside item counts', () => {
    expect(testPlan('cogat', 1).mockLength('picture-analogy')).toBe(16)
    expect(testPlan('cogat', 3).mockLength('figure-matrix')).toBe(20)
    expect(testPlan('cogat', 5).mockLength('verbal-analogy')).toBe(24)
  })

  it('serves well-formed practice and full practice tests for every family, grade and part', () => {
    for (const family of TEST_FAMILIES) {
      for (const grade of GRADES) {
        const plan = testPlan(family, grade)
        for (const { subType } of plan.parts) {
          const pool = getQuestionPool(subType, 2, 8, [], grade)
          expect(pool, `${family} ${grade} ${subType}`).toHaveLength(8)
          pool.forEach(expectWellFormed)
          // A full part plus its untimed example.
          const mock = getRampedQuestions(subType, plan.mockLength(subType), [], grade)
          expect(mock).toHaveLength(plan.mockLength(subType))
          expect(getQuestionPool(subType, 1, 1, mock.map((q) => q.id), grade)).toHaveLength(1)
        }
      }
    }
  })
})

describe('NNAT3 generators', () => {
  const each = (gen: (d: Difficulty, s: number, g: Grade) => Question, fn: (q: Question) => void) => {
    for (const grade of GRADES) for (const d of DIFFS) for (const seed of seeds.slice(0, 60)) fn(gen(d, seed, grade))
  }

  it('are reproducible from their seed', () => {
    for (const gen of [generatePatternCompletionQuestion, generateReasoningByAnalogyQuestion, generateSerialReasoningQuestion, generateSpatialVisualizationQuestion]) {
      expect(gen(2, 42, 3)).toEqual(gen(2, 42, 3))
    }
  })

  it('pattern completion: the answer is exactly the hidden block and every other piece differs', () => {
    each(generatePatternCompletionQuestion, (q) => {
      expectWellFormed(q)
      const prompt = q.promptVisual![0][0]
      if (prompt.kind !== 'pattern' || !prompt.hole) throw new Error('expected a pattern with a hole')
      const { row, col, size } = prompt.hole
      const hidden = prompt.cells.slice(row, row + size).map((r) => r.slice(col, col + size))
      expect(JSON.stringify((correctOf(q) as { cells: string[][] }).cells)).toBe(JSON.stringify(hidden))
    })
  })

  it('3x3 matrices and series never offer two answers that look the same', () => {
    for (const gen of [generateReasoningByAnalogyQuestion, generateSerialReasoningQuestion, generateFiguralSeriesQuestion]) {
      each(gen, (q) => {
        expectWellFormed(q)
        const specs = q.choices.map((c) => (c.content.kind === 'shape' ? c.content.spec : null))
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) {
          if (specs[i] && specs[j]) expect(shapesLookAlike(specs[i]!, specs[j]!), q.id).toBe(false)
        }
        for (const s of specs) if (s) expect(s.type, q.id).toBeTruthy()
      })
    }
  })

  it('spatial visualization: the answer combines the last row exactly like the example rows', () => {
    each(generateSpatialVisualizationQuestion, (q) => {
      expectWellFormed(q)
      const rows = q.promptVisual!
      const strokes = (c: ContentSpec) => (c.kind === 'lines' ? c.strokes : [])
      const key = (s: LineStroke[]) => [...s].sort().join()
      const cancel = q.promptAudioText.includes('disappear')
      const combine = (a: LineStroke[], b: LineStroke[]) =>
        cancel ? [...a.filter((x) => !b.includes(x)), ...b.filter((x) => !a.includes(x))] : [...new Set([...a, ...b])]
      for (const r of rows.slice(0, -1)) expect(key(combine(strokes(r[0]), strokes(r[1])))).toBe(key(strokes(r[2])))
      const last = rows[rows.length - 1]
      expect(key(strokes(correctOf(q)))).toBe(key(combine(strokes(last[0]), strokes(last[1]))))
    })
  })
})

describe('OLSAT generators', () => {
  it('number matrices have one rule that fits, and the answer follows it', () => {
    for (const grade of [3, 4, 5, 6] as const) for (const d of DIFFS) for (const seed of seeds) {
      const q = generateNumberMatrixQuestion(d, seed, grade)
      expectWellFormed(q)
      const nums = q.promptVisual!.map((r) => r.map((c) => (c.kind === 'word' ? Number(c.value) : Number(val(correctOf(q))))))
      expect(numberMatrixIsUnambiguous(nums as [number, number, number][]), q.id).toBe(true)
    }
  })

  it('word problems have positive whole-number answers and four different choices', () => {
    for (const grade of [3, 4, 5, 6] as const) for (const d of DIFFS) for (const seed of seeds) {
      const q = generateArithmeticReasoningQuestion(d, seed, grade)
      expectWellFormed(q)
      const answer = Number(val(correctOf(q)))
      expect(Number.isInteger(answer) && answer > 0, q.id).toBe(true)
    }
  })
})

const OLSAT_BANKS: [string, (g: Grade) => Question[], Grade[], number][] = [
  ['following directions', buildFollowingDirectionsBank, [0, 1, 2], 14],
  ['aural reasoning', buildAuralReasoningBank, [0, 1, 2], 20],
  ['arithmetic (pictures)', buildArithmeticPicturesBank, [0, 1, 2], 10],
  ['antonyms', buildAntonymBank, [3, 4, 5, 6], 30],
  ['logical selection', buildLogicalSelectionBank, [3, 4, 5, 6], 18],
  ['sentence arrangement', buildSentenceArrangementBank, [3, 4, 5, 6], 20],
]

describe.each(OLSAT_BANKS)('OLSAT %s bank', (_name, build, grades, minSize) => {
  it(`has at least ${minSize} unique, well-formed questions at each of its grades`, () => {
    for (const grade of grades) {
      const bank = build(grade)
      expect(bank.length, `grade ${grade}`).toBeGreaterThanOrEqual(minSize)
      expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length)
      bank.forEach(expectWellFormed)
      const keys = bank.map((q) => q.promptAudioText + (q.promptVisual ?? []).flat().map(val).join(''))
      expect(new Set(keys).size).toBe(keys.length)
    }
  })
})

describe('OLSAT reading items', () => {
  it('sentence arrangement: shows every word of the sentence, and the answer is its last word', () => {
    for (const grade of [3, 5] as const) {
      for (const q of buildSentenceArrangementBank(grade)) {
        const shown = q.promptVisual![0].map(val)
        const sentence = q.explanationAudioText!.replace('The sentence is: ', '').replace(/[.]/g, '').split(' ')
        expect([...shown].map((w) => w.toLowerCase()).sort()).toEqual(sentence.map((w) => w.toLowerCase()).sort())
        expect(val(correctOf(q))).toBe(sentence[sentence.length - 1])
        expect(shown[shown.length - 1], q.id).not.toBe(sentence[sentence.length - 1])
        for (const c of q.choices) expect(shown, q.id).toContain(val(c.content))
      }
    }
  })

  it('antonyms never use the same word twice as a question', () => {
    const words = [...buildAntonymBank(4), ...buildAntonymBank(5)].map((q) => val(q.promptVisual![0][0]))
    expect(new Set(words).size).toBe(words.length)
  })
})

describe('Levels 11/12 reading depth (Phase 3)', () => {
  it('5th–6th grade no longer get the 3rd-grade baseline tier, but 3rd and 4th still do', () => {
    for (const build of [buildVerbalAnalogyBank, buildVerbalClassificationBank, buildSentenceReadingBank]) {
      const g3 = new Set(build(3).map((q) => q.id))
      const g5 = build(5)
      expect(g5.some((q) => g3.has(q.id))).toBe(false)
      expect(build(4).some((q) => g3.has(q.id))).toBe(true)
      expect(g5.length).toBeGreaterThanOrEqual(100)
    }
  })

  it('CogAT Level 12 mixes in some 3x3 figure matrices; Level 11 does not', () => {
    const is3x3 = (q: Question) => q.promptVisual!.length === 3
    const pool6 = Array.from({ length: 60 }, () => getQuestionPool('figure-matrix', 2, 1, [], 6)[0])
    const pool5 = Array.from({ length: 60 }, () => getQuestionPool('figure-matrix', 2, 1, [], 5)[0])
    expect(pool6.some(is3x3)).toBe(true)
    expect(pool5.some(is3x3)).toBe(false)
  })
})
