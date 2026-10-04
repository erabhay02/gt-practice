import { describe, expect, it } from 'vitest'
import type { ChildProfile } from '../state/profilesStore'
import { EMPTY_PROGRESS, type SessionResult } from '../state/progressStore'
import { mergeAll, mergeSessions, mergeShown, sessionToRow, type ChildRow, type LocalState } from './merge'

const NOW = '2026-10-03T12:00:00.000Z'
const s = (id: string, day = '01'): SessionResult => ({
  id,
  subType: 'figure-matrix',
  correct: 5,
  total: 8,
  completedAt: `2026-10-${day}T10:00:00.000Z`,
  kind: 'practice',
})
const child = (id: string, name: string, updatedAt: string): ChildProfile => ({
  id,
  name,
  grade: 2,
  avatar: '🦊',
  testDate: null,
  updatedAt,
})
const row = (id: string, name: string, updatedAt: string, extra: Partial<ChildRow> = {}): ChildRow => ({
  id,
  name,
  grade: 2,
  avatar: '🦊',
  test_date: null,
  shown_question_ids: {},
  daily_plan_dates: [],
  updated_at: updatedAt,
  deleted_at: null,
  ...extra,
})
const local = (partial: Partial<LocalState>): LocalState => ({ profiles: [], deletedIds: [], byProfile: {}, ...partial })

describe('merge helpers', () => {
  it('sessions: union by id, nothing doubled, oldest first', () => {
    expect(mergeSessions([s('a', '02'), s('b', '01')], [s('b', '01'), s('c', '03')]).map((x) => x.id)).toEqual(['b', 'a', 'c'])
  })
  it('shown questions: both histories kept, no duplicates', () => {
    expect(mergeShown({ x: ['1', '2'] }, { x: ['2', '3'], y: ['9'] })).toEqual({ x: ['2', '3', '1'], y: ['9'] })
  })
})

describe('mergeAll', () => {
  it('first sign-in on a device uploads its local children and sessions', () => {
    const r = mergeAll(
      local({ profiles: [child('k1', 'Aarav', NOW)], byProfile: { k1: { ...EMPTY_PROGRESS, sessions: [s('a')] } } }),
      { children: [], sessions: [] },
      NOW,
    )
    expect(r.profiles.map((p) => p.name)).toEqual(['Aarav'])
    expect(r.push.children.map((c) => c.id)).toEqual(['k1'])
    expect(r.push.sessions.map((x) => x.id)).toEqual(['a'])
  })

  it('a new device downloads children and progress from the server', () => {
    const r = mergeAll(
      local({}),
      { children: [row('k1', 'Mia', NOW, { grade: 1, daily_plan_dates: ['2026-10-02'] })], sessions: [sessionToRow('k1', s('a'))] },
      NOW,
    )
    expect(r.profiles[0]).toMatchObject({ id: 'k1', name: 'Mia', grade: 1 })
    expect(r.byProfile.k1.sessions.map((x) => x.id)).toEqual(['a'])
    expect(r.byProfile.k1.dailyPlanDates).toEqual(['2026-10-02'])
    expect(r.push.sessions).toEqual([])
  })

  it('practice done on two devices offline is combined, and only new sessions are uploaded', () => {
    const r = mergeAll(
      local({ profiles: [child('k1', 'Aarav', NOW)], byProfile: { k1: { ...EMPTY_PROGRESS, sessions: [s('a'), s('local-only', '02')] } } }),
      { children: [row('k1', 'Aarav', NOW)], sessions: [sessionToRow('k1', s('a')), sessionToRow('k1', s('remote-only', '03'))] },
      NOW,
    )
    expect(r.byProfile.k1.sessions.map((x) => x.id)).toEqual(['a', 'local-only', 'remote-only'])
    expect(r.push.sessions.map((x) => x.id)).toEqual(['local-only'])
  })

  it('re-syncing with nothing new uploads no sessions (idempotent)', () => {
    const first = mergeAll(
      local({ profiles: [child('k1', 'Aarav', NOW)], byProfile: { k1: { ...EMPTY_PROGRESS, sessions: [s('a')] } } }),
      { children: [], sessions: [] },
      NOW,
    )
    const again = mergeAll(first, { children: first.push.children, sessions: first.push.sessions }, NOW)
    expect(again.push.sessions).toEqual([])
    expect(again.byProfile.k1.sessions).toHaveLength(1)
  })

  it('the most recent edit of a child wins', () => {
    const newerLocal = mergeAll(
      local({ profiles: [child('k1', 'Aarav S.', '2026-10-03T10:00:00Z')] }),
      { children: [row('k1', 'Aarav', '2026-10-02T10:00:00Z')], sessions: [] },
      NOW,
    )
    expect(newerLocal.profiles[0].name).toBe('Aarav S.')
    expect(newerLocal.push.children[0].name).toBe('Aarav S.')
    const newerRemote = mergeAll(
      local({ profiles: [child('k1', 'Aarav', '2026-10-01T10:00:00Z')] }),
      { children: [row('k1', 'Aarav S.', '2026-10-02T10:00:00Z')], sessions: [] },
      NOW,
    )
    expect(newerRemote.profiles[0].name).toBe('Aarav S.')
  })

  it('removing a child on one device removes it everywhere', () => {
    const removedHere = mergeAll(local({ deletedIds: ['k1'] }), { children: [row('k1', 'Mia', NOW)], sessions: [] }, NOW)
    expect(removedHere.profiles).toEqual([])
    expect(removedHere.push.children).toEqual([expect.objectContaining({ id: 'k1', deleted_at: NOW })])

    const removedElsewhere = mergeAll(
      local({ profiles: [child('k1', 'Mia', NOW)], byProfile: { k1: { ...EMPTY_PROGRESS, sessions: [s('a')] } } }),
      { children: [row('k1', 'Mia', NOW, { deleted_at: NOW })], sessions: [] },
      NOW,
    )
    expect(removedElsewhere.profiles).toEqual([])
    expect(removedElsewhere.byProfile.k1).toBeUndefined()
    expect(removedElsewhere.push.sessions).toEqual([])
  })
})
