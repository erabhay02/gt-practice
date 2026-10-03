import type { SubType } from '../content/types'
import type { SessionResult } from './progressStore'

const RECENT = 3
const TREND_POINTS = 8
export const FOCUS_THRESHOLD = 80

const pct = (correct: number, total: number) => (total === 0 ? 0 : Math.round((correct / total) * 100))

export interface SubtypeStats {
  sessions: number
  correct: number
  total: number
  // Accuracy over the last few sessions; null if never tried.
  recentPct: number | null
  // Accuracy of each of the last few sessions, oldest first.
  trend: number[]
}

export function statsBySubtype(sessions: SessionResult[]): Partial<Record<SubType, SubtypeStats>> {
  const out: Partial<Record<SubType, SubtypeStats>> = {}
  const grouped = new Map<SubType, SessionResult[]>()
  for (const s of sessions) grouped.set(s.subType, [...(grouped.get(s.subType) ?? []), s])

  for (const [subType, list] of grouped) {
    const recent = list.slice(-RECENT)
    const rc = recent.reduce((n, s) => n + s.correct, 0)
    const rt = recent.reduce((n, s) => n + s.total, 0)
    out[subType] = {
      sessions: list.length,
      correct: list.reduce((n, s) => n + s.correct, 0),
      total: list.reduce((n, s) => n + s.total, 0),
      recentPct: rt === 0 ? null : pct(rc, rt),
      trend: list.slice(-TREND_POINTS).map((s) => pct(s.correct, s.total)),
    }
  }
  return out
}

export type FocusItem = { subType: SubType; reason: 'low'; pct: number } | { subType: SubType; reason: 'not-tried' }

/** Up to `limit` parts to work on next: weakest recent scores first, then untried parts. */
export function focusAreas(
  stats: Partial<Record<SubType, SubtypeStats>>,
  allSubtypes: SubType[],
  limit = 3,
): FocusItem[] {
  const low: FocusItem[] = allSubtypes
    .flatMap((subType) => {
      const p = stats[subType]?.recentPct
      return p !== null && p !== undefined && p < FOCUS_THRESHOLD ? [{ subType, reason: 'low' as const, pct: p }] : []
    })
    .sort((a, b) => a.pct - b.pct)
  const untried: FocusItem[] = allSubtypes.filter((s) => !stats[s]).map((subType) => ({ subType, reason: 'not-tried' }))
  return [...low, ...untried].slice(0, limit)
}

export interface MockRun {
  id: string
  mode: string
  completedAt: string
  correct: number
  total: number
  parts: { subType: SubType; correct: number; total: number }[]
}

/** Mock-test runs, newest first. */
export function mockRuns(sessions: SessionResult[]): MockRun[] {
  const runs = new Map<string, MockRun>()
  for (const s of sessions) {
    if (s.kind !== 'mock' || !s.mockRunId) continue
    const run = runs.get(s.mockRunId) ?? {
      id: s.mockRunId,
      mode: s.mockMode ?? 'mock',
      completedAt: s.completedAt,
      correct: 0,
      total: 0,
      parts: [],
    }
    run.correct += s.correct
    run.total += s.total
    run.completedAt = s.completedAt > run.completedAt ? s.completedAt : run.completedAt
    run.parts.push({ subType: s.subType, correct: s.correct, total: s.total })
    runs.set(s.mockRunId, run)
  }
  return [...runs.values()].sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}

export function summary(sessions: SessionResult[]) {
  return {
    questionsAnswered: sessions.reduce((n, s) => n + s.total, 0),
    daysPracticed: new Set(sessions.map((s) => s.completedAt.slice(0, 10))).size,
  }
}
