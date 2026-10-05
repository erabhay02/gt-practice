import type { Grade, SubType } from '../content/types'
import type { ChildProfile } from '../state/profilesStore'
import { EMPTY_PROGRESS, MAX_SHOWN_IDS_PER_SUBTYPE, type ProfileProgress, type SessionResult } from '../state/progressStore'

/** A `children` row as stored in Supabase (parent_id is added by the sync engine). */
export interface ChildRow {
  id: string
  name: string
  grade: Grade
  avatar: string
  test_date: string | null
  shown_question_ids: Record<string, string[]>
  daily_plan_dates: string[]
  updated_at: string
  deleted_at: string | null
}

/** A `sessions` row as stored in Supabase. */
export interface SessionRow {
  id: string
  child_id: string
  sub_type: SubType
  correct: number
  total: number
  kind: SessionResult['kind'] | null
  mock_run_id: string | null
  mock_mode: string | null
  completed_at: string
}

export interface LocalState {
  profiles: ChildProfile[]
  deletedIds: string[]
  byProfile: Record<string, ProfileProgress>
}

export interface MergeResult extends LocalState {
  push: { children: ChildRow[]; sessions: SessionRow[] }
}

export const sessionToRow = (childId: string, s: SessionResult): SessionRow => ({
  id: s.id,
  child_id: childId,
  sub_type: s.subType,
  correct: s.correct,
  total: s.total,
  kind: s.kind ?? null,
  mock_run_id: s.mockRunId ?? null,
  mock_mode: s.mockMode ?? null,
  completed_at: s.completedAt,
})

export const rowToSession = (r: SessionRow): SessionResult => ({
  id: r.id,
  subType: r.sub_type,
  correct: r.correct,
  total: r.total,
  completedAt: r.completed_at,
  ...(r.kind ? { kind: r.kind } : {}),
  ...(r.mock_run_id ? { mockRunId: r.mock_run_id } : {}),
  ...(r.mock_mode ? { mockMode: r.mock_mode } : {}),
})

/** Every session from either side, once each, oldest first. */
export function mergeSessions(a: SessionResult[], b: SessionResult[]): SessionResult[] {
  const byId = new Map<string, SessionResult>()
  for (const s of [...a, ...b]) if (!byId.has(s.id)) byId.set(s.id, s)
  return [...byId.values()].sort((x, y) => x.completedAt.localeCompare(y.completedAt))
}

/** Recently-shown question ids: keep both sides' history, most recent last, capped. */
export function mergeShown(a: Record<string, string[]>, b: Record<string, string[]>): Record<string, string[]> {
  const out: Record<string, string[]> = {}
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const seen = new Set<string>()
    const merged: string[] = []
    for (const id of [...(b[key] ?? []), ...(a[key] ?? [])]) {
      if (!seen.has(id)) {
        seen.add(id)
        merged.push(id)
      }
    }
    out[key] = merged.slice(-MAX_SHOWN_IDS_PER_SUBTYPE)
  }
  return out
}

export const mergeDates = (a: string[], b: string[]): string[] => [...new Set([...a, ...b])].sort()

const toProfile = (r: ChildRow): ChildProfile => ({
  id: r.id,
  name: r.name,
  grade: r.grade,
  avatar: r.avatar,
  testDate: r.test_date,
  updatedAt: r.updated_at,
})

const toRow = (p: ChildProfile, progress: ProfileProgress, deletedAt: string | null = null): ChildRow => ({
  id: p.id,
  name: p.name,
  grade: p.grade,
  avatar: p.avatar,
  test_date: p.testDate,
  shown_question_ids: progress.shownQuestionIds,
  daily_plan_dates: progress.dailyPlanDates,
  updated_at: p.updatedAt,
  deleted_at: deletedAt,
})

export const tombstone = (r: ChildRow, now: string): ChildRow => ({
  ...r,
  name: 'Removed',
  avatar: '',
  test_date: null,
  shown_question_ids: {},
  daily_plan_dates: [],
  deleted_at: now,
  updated_at: now,
})

/**
 * Combines this device's children/progress with the server's.
 * - A child's name/grade/avatar/test date: the most recently edited copy wins.
 * - Sessions, shown questions and daily-plan days: union (nothing is lost or doubled).
 * - Deleting a child on any device deletes it everywhere.
 */
export function mergeAll(local: LocalState, remote: { children: ChildRow[]; sessions: SessionRow[] }, now: string): MergeResult {
  const remoteById = new Map(remote.children.map((c) => [c.id, c]))
  const localById = new Map(local.profiles.map((p) => [p.id, p]))
  const remoteSessions = new Map<string, SessionResult[]>()
  for (const r of remote.sessions) remoteSessions.set(r.child_id, [...(remoteSessions.get(r.child_id) ?? []), rowToSession(r)])
  const remoteSessionIds = new Set(remote.sessions.map((s) => s.id))

  const profiles: ChildProfile[] = []
  const byProfile: Record<string, ProfileProgress> = {}
  const push: MergeResult['push'] = { children: [], sessions: [] }

  const removedHere = new Set(local.deletedIds)
  const order = [...local.profiles.map((p) => p.id), ...remote.children.map((c) => c.id)]
  for (const id of new Set(order)) {
    const r = remoteById.get(id)
    const l = localById.get(id)
    if (removedHere.has(id) || r?.deleted_at || (!l && !r)) continue
    const localProgress = local.byProfile[id] ?? EMPTY_PROGRESS

    if (!r) {
      // Only on this device: upload it.
      profiles.push(l!)
      byProfile[id] = localProgress
      push.children.push(toRow(l!, localProgress))
      push.sessions.push(...localProgress.sessions.map((s) => sessionToRow(id, s)))
      continue
    }

    const progress: ProfileProgress = {
      sessions: mergeSessions(localProgress.sessions, remoteSessions.get(id) ?? []),
      shownQuestionIds: mergeShown(localProgress.shownQuestionIds, r.shown_question_ids ?? {}),
      dailyPlanDates: mergeDates(localProgress.dailyPlanDates, r.daily_plan_dates ?? []),
    }
    const profile = l && l.updatedAt > r.updated_at ? l : toProfile(r)
    profiles.push(profile)
    byProfile[id] = progress
    push.children.push(toRow(profile, progress))
    push.sessions.push(...progress.sessions.filter((s) => !remoteSessionIds.has(s.id)).map((s) => sessionToRow(id, s)))
  }

  // Removed on this device: tell the server (only if it knows the child). The
  // tombstone keeps only the id, so the child's details leave the server too.
  for (const id of local.deletedIds) {
    const r = remoteById.get(id)
    if (r && !r.deleted_at) push.children.push(tombstone(r, now))
  }

  // Removals that reached the server don't need local tombstones anymore.
  return { profiles, byProfile, deletedIds: [], push }
}
