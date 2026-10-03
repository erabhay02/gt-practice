import { describe, expect, it } from 'vitest'
import { focusAreas, mockRuns, statsBySubtype, summary } from './progressStats'
import type { SessionResult } from './progressStore'

const s = (subType: SessionResult['subType'], correct: number, total: number, day: string, extra: Partial<SessionResult> = {}): SessionResult => ({
  subType,
  correct,
  total,
  completedAt: `2026-10-${day}T10:00:00.000Z`,
  ...extra,
})

describe('progress stats', () => {
  const sessions = [
    s('figure-matrix', 2, 8, '01'),
    s('figure-matrix', 4, 8, '02'),
    s('figure-matrix', 6, 8, '03'),
    s('figure-matrix', 8, 8, '04'),
    s('number-series', 7, 8, '04'),
    s('paper-folding', 3, 8, '05'),
  ]

  it('recent accuracy uses only the last 3 sessions; trend lists each session', () => {
    const stats = statsBySubtype(sessions)
    expect(stats['figure-matrix']!.recentPct).toBe(75) // (4+6+8)/24
    expect(stats['figure-matrix']!.trend).toEqual([25, 50, 75, 100])
    expect(stats['figure-matrix']!.sessions).toBe(4)
  })

  it('focus areas: weakest recent first, then untried', () => {
    const focus = focusAreas(statsBySubtype(sessions), ['figure-matrix', 'number-series', 'paper-folding', 'number-puzzle'])
    expect(focus).toEqual([
      { subType: 'paper-folding', reason: 'low', pct: 38 },
      { subType: 'figure-matrix', reason: 'low', pct: 75 },
      { subType: 'number-puzzle', reason: 'not-tried' },
    ])
  })

  it('groups mock-test parts into runs, newest first, ignoring practice', () => {
    const runs = mockRuns([
      ...sessions,
      s('figure-matrix', 10, 16, '06', { kind: 'mock', mockRunId: 'a', mockMode: 'nonverbal' }),
      s('paper-folding', 7, 14, '06', { kind: 'mock', mockRunId: 'a', mockMode: 'nonverbal' }),
      s('number-series', 12, 16, '08', { kind: 'mock', mockRunId: 'b', mockMode: 'quantitative' }),
    ])
    expect(runs.map((r) => r.id)).toEqual(['b', 'a'])
    expect(runs[1]).toMatchObject({ correct: 17, total: 30, mode: 'nonverbal' })
    expect(runs[1].parts).toHaveLength(2)
  })

  it('summary counts questions and distinct days', () => {
    expect(summary(sessions)).toEqual({ questionsAnswered: 48, daysPracticed: 5 })
  })
})
