import { beforeEach, describe, expect, it } from 'vitest'
import { AVAILABLE_SUBTYPES } from '../content/contentLoader'
import { chooseDailyParts, buildDailyQuestions, DAILY_PARTS, DAILY_QUESTIONS_PER_PART } from './dailyPlan'
import { LEGACY_PROFILE_ID } from './profilesStore'
import { EMPTY_PROGRESS, migrateProgress, todayStr, useProgressStore, type ProfileProgress, type SessionResult } from './progressStore'

const session = (subType: SessionResult['subType'], correct: number, total = 8): SessionResult => ({
  subType,
  correct,
  total,
  completedAt: '2026-10-01T10:00:00.000Z',
  kind: 'practice',
})

describe('migration from before child profiles', () => {
  it('moves existing progress under the first child, keeping every session', () => {
    const old = {
      version: 1,
      sessions: [session('figure-matrix', 6), session('paper-folding', 3)],
      lastPracticeDate: '2026-10-01',
      streak: 4,
      shownQuestionIds: { 'picture-analogy': ['picture-analogy-1'] },
    }
    const migrated = migrateProgress(old, 0)
    expect(Object.keys(migrated.byProfile)).toEqual([LEGACY_PROFILE_ID])
    const p = migrated.byProfile[LEGACY_PROFILE_ID]
    expect(p.sessions).toEqual(old.sessions)
    expect(p.streak).toBe(4)
    expect(p.shownQuestionIds).toEqual(old.shownQuestionIds)
  })

  it('a fresh device gets no profiles; already-migrated data passes through', () => {
    expect(migrateProgress(undefined, 0)).toEqual({ byProfile: {} })
    const current = { byProfile: { a: EMPTY_PROGRESS } }
    expect(migrateProgress(current, 2)).toEqual(current)
  })
})

describe('per-child progress', () => {
  beforeEach(() => useProgressStore.setState({ byProfile: {} }))

  it('keeps each child separate', () => {
    const { recordSession, recordShownQuestions, resetProfile } = useProgressStore.getState()
    recordSession('ana', session('figure-matrix', 7))
    recordSession('ben', session('number-series', 2))
    recordShownQuestions('ana', 'picture-analogy', ['x'])
    const { byProfile } = useProgressStore.getState()
    expect(byProfile.ana.sessions.map((s) => s.subType)).toEqual(['figure-matrix'])
    expect(byProfile.ben.sessions.map((s) => s.subType)).toEqual(['number-series'])
    expect(byProfile.ben.shownQuestionIds).toEqual({})
    resetProfile('ana')
    expect(useProgressStore.getState().byProfile.ana.sessions).toEqual([])
    expect(useProgressStore.getState().byProfile.ben.sessions).toHaveLength(1)
  })

  it('finishing today\'s practice is recorded once per day', () => {
    const { recordDailyPlanDone } = useProgressStore.getState()
    recordDailyPlanDone('ana')
    recordDailyPlanDone('ana')
    expect(useProgressStore.getState().byProfile.ana.dailyPlanDates).toEqual([todayStr()])
  })
})

describe("today's practice", () => {
  const ALL = AVAILABLE_SUBTYPES.map((s) => s.subType)

  it('picks 3 different parts, led by the weakest recent one', () => {
    const progress: ProfileProgress = {
      ...EMPTY_PROGRESS,
      sessions: ALL.map((s) => session(s, s === 'paper-folding' ? 2 : 7)),
    }
    const parts = chooseDailyParts(progress, '2026-10-03')
    expect(new Set(parts).size).toBe(DAILY_PARTS)
    expect(parts[0]).toBe('paper-folding')
  })

  it('brings in the least-practiced part', () => {
    const progress: ProfileProgress = {
      ...EMPTY_PROGRESS,
      sessions: ALL.filter((s) => s !== 'number-puzzle').flatMap((s) => [session(s, 7), session(s, 7)]),
    }
    expect(chooseDailyParts(progress, '2026-10-03')).toContain('number-puzzle')
  })

  it('rotates so every part shows up over a couple of weeks', () => {
    const seen = new Set<string>()
    for (let day = 1; day <= 14; day++) {
      for (const p of chooseDailyParts(EMPTY_PROGRESS, `2026-10-${String(day).padStart(2, '0')}`)) seen.add(p)
    }
    expect(seen.size).toBe(ALL.length)
  })

  it('builds 12 questions at the child\'s grade', () => {
    const qs = buildDailyQuestions(EMPTY_PROGRESS, 1, '2026-10-03')
    expect(qs).toHaveLength(DAILY_PARTS * DAILY_QUESTIONS_PER_PART)
    const generated = qs.filter((q) => q.source === 'generated')
    expect(generated.every((q) => q.id.includes('-g1-'))).toBe(true)
  })
})
