import { describe, expect, it } from 'vitest'
import { generatePaperFoldingQuestion } from './paperFoldingGenerator'
import type { ContentSpec, Hole } from '../types'

const seeds = Array.from({ length: 400 }, (_, i) => i + 1)
const norm = (a: number) => ((a % 360) + 360) % 360

function holes(c: ContentSpec): Hole[] {
  if (c.kind !== 'paper') throw new Error('expected paper')
  return c.holes
}

const look = (h: Hole) => `${h.cut ?? 'circle'}${h.cut === 'triangle' ? norm(h.angle ?? 0) : ''}`
const key = (pts: Hole[]) => pts.map((p) => `${p.x},${p.y},${look(p)}`).sort().join('|')
const nearlySame = (a: Hole[], b: Hole[]) => {
  const close = (p: Hole, set: Hole[]) => set.some((q) => Math.abs(p.x - q.x) < 12 && Math.abs(p.y - q.y) < 12 && look(p) === look(q))
  return a.length === b.length && a.every((p) => close(p, b)) && b.every((p) => close(p, a))
}

describe('generatePaperFoldingQuestion (fold, punch/cut, unfold)', () => {
  it('has 4 choices, exactly one correct, all visibly different', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generatePaperFoldingQuestion(d, seed)
        expect(q.choices).toHaveLength(4)
        expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
        const sets = q.choices.map((c) => holes(c.content))
        expect(new Set(sets.map(key)).size).toBe(4)
        for (let i = 0; i < 4; i++) for (let j = i + 1; j < 4; j++) expect(nearlySame(sets[i], sets[j])).toBe(false)
      }
    }
  })

  it('the correct answer has punched holes x 2 per fold, all on the paper', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const q = generatePaperFoldingQuestion(d, seed)
        const row = q.promptVisual![0].filter((c) => c.kind === 'paper')
        const punched = holes(row[row.length - 1]).length
        const correct = holes(q.choices.find((c) => c.isCorrect)!.content)
        expect(correct).toHaveLength(punched * 2 ** (row.length - 1))
        for (const p of correct) {
          expect(p.x > 0 && p.x < 64 && p.y > 0 && p.y < 64).toBe(true)
        }
      }
    }
  })

  it('no paper shows two holes on top of each other', () => {
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        for (const c of generatePaperFoldingQuestion(d, seed).choices) {
          const h = holes(c.content)
          for (let i = 0; i < h.length; i++)
            for (let j = i + 1; j < h.length; j++)
              expect(Math.abs(h[i].x - h[j].x) >= 10 || Math.abs(h[i].y - h[j].y) >= 10).toBe(true)
        }
      }
    }
  })

  it('a triangle cut-out flips direction in its mirror copy', () => {
    let checked = 0
    for (const seed of seeds) {
      const q = generatePaperFoldingQuestion(3, seed)
      const correct = holes(q.choices.find((c) => c.isCorrect)!.content)
      if (correct[0].cut !== 'triangle') continue
      expect(norm(correct[0].angle!)).not.toBe(norm(correct[1].angle!))
      checked++
    }
    expect(checked).toBeGreaterThan(50)
  })

  it('covers every fold type, including diagonals, across difficulties', () => {
    const seen = new Set<string>()
    for (const seed of seeds) {
      for (const d of [1, 2, 3] as const) {
        const first = generatePaperFoldingQuestion(d, seed).promptVisual![0][0]
        if (first.kind === 'paper') first.foldLines?.forEach((f) => seen.add(f))
      }
    }
    expect([...seen].sort()).toEqual(['anti-diagonal', 'diagonal', 'horizontal', 'vertical'])
  })

  it('easy items are one straight fold and one round hole', () => {
    for (const seed of seeds) {
      const q = generatePaperFoldingQuestion(1, seed)
      const row = q.promptVisual![0].filter((c) => c.kind === 'paper')
      expect(row).toHaveLength(2)
      const first = row[0]
      if (first.kind !== 'paper') throw new Error()
      expect(['vertical', 'horizontal']).toContain(first.foldLines![0])
      expect(holes(row[1]).every((h) => (h.cut ?? 'circle') === 'circle')).toBe(true)
    }
  })

  it('is deterministic for a given seed', () => {
    expect(generatePaperFoldingQuestion(3, 777)).toEqual(generatePaperFoldingQuestion(3, 777))
  })
})
