import { describe, expect, it } from 'vitest'
import {
  generateNumberAnalogyQuestion,
  generateNumberPuzzleQuestion,
  generateNumberSeriesQuestion,
} from './numberGenerators'
import type { ContentSpec, Question } from '../types'

const seeds = Array.from({ length: 80 }, (_, i) => i * 7727 + 5)

function quantity(c: ContentSpec): number {
  if (c.kind === 'group') return c.count
  if (c.kind === 'text') return Number(c.value)
  if (c.kind === 'abacus' && c.counts.length === 1 && c.counts[0] !== null) return c.counts[0]
  throw new Error(`no quantity in ${c.kind}`)
}

function expectOneCorrectDistinct(q: Question) {
  expect(q.choices).toHaveLength(4)
  expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
  const values = q.choices.map((c) => quantity(c.content))
  expect(new Set(values).size).toBe(4)
  return values
}

// Evaluates a row like [3, +, ?, =, 9] with `answer` substituted for the blank.
function sidesEqual(row: ContentSpec[], answer: number, symbolValue?: number): boolean {
  const tokens = row.map((c) => {
    if (c.kind === 'blank') return String(answer)
    if (c.kind === 'shape') return String(symbolValue)
    if (c.kind === 'group') return String(c.count)
    if (c.kind === 'text') return c.value
    throw new Error(`unexpected ${c.kind}`)
  })
  const eq = tokens.indexOf('=')
  const evalSide = (side: string[]) => {
    let total = Number(side[0])
    for (let i = 1; i < side.length; i += 2) total += side[i] === '+' ? Number(side[i + 1]) : -Number(side[i + 1])
    return total
  }
  return evalSide(tokens.slice(0, eq)) === evalSide(tokens.slice(eq + 1))
}

describe('generateNumberAnalogyQuestion (pictures of quantities)', () => {
  it('one correct answer that follows the top-row rule; counts 1-10', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generateNumberAnalogyQuestion(d, seed)
        const values = expectOneCorrectDistinct(q)
        for (const v of values) expect(v >= 1 && v <= 10).toBe(true)
        const [[a, b], [c]] = q.promptVisual!.map((r) => r.map((x) => (x.kind === 'blank' ? NaN : quantity(x))))
        const correct = quantity(q.choices.find((x) => x.isCorrect)!.content)
        const sameStep = correct - c === b - a
        const sameRatio = correct / c === b / a
        expect(sameStep || sameRatio).toBe(true)
      }
    }
  })
})

describe('generateNumberSeriesQuestion (abacus)', () => {
  it('one correct answer; every rod has 0-10 beads', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generateNumberSeriesQuestion(d, seed)
        const values = expectOneCorrectDistinct(q)
        for (const v of values) expect(v >= 0 && v <= 10).toBe(true)
        const abacus = q.promptVisual![0][0]
        if (abacus.kind !== 'abacus') throw new Error('expected abacus')
        expect(abacus.counts[abacus.counts.length - 1]).toBeNull()
        for (const n of abacus.counts.slice(0, -1)) expect(n! >= 0 && n! <= 10).toBe(true)
      }
    }
  })
})

describe('generateNumberPuzzleQuestion (missing number)', () => {
  it('the correct answer makes the equation true, and no wrong answer does', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generateNumberPuzzleQuestion(d, seed)
        expectOneCorrectDistinct(q)
        const rows = q.promptVisual!
        const symbolRow = rows.length === 2 ? rows[0] : undefined
        const symbolValue = symbolRow ? Number((symbolRow[2] as { value: string }).value) : undefined
        const equation = rows[rows.length - 1]
        for (const c of q.choices) {
          expect(sidesEqual(equation, quantity(c.content), symbolValue)).toBe(c.isCorrect)
          expect(quantity(c.content)).toBeGreaterThanOrEqual(0)
        }
      }
    }
  })
})
