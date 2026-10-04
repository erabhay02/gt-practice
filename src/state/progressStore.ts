import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty, SubType } from '../content/types'
import { LEGACY_PROFILE_ID } from './profilesStore'

export interface SessionResult {
  // Stable id so the same session arriving from two devices is counted once.
  id: string
  subType: SubType
  correct: number
  total: number
  completedAt: string // ISO timestamp
  // Missing on sessions saved before mock tracking existed; treated as practice.
  kind?: 'practice' | 'mock' | 'daily'
  // Groups the parts of one mock-test run.
  mockRunId?: string
  mockMode?: string
}

export type NewSession = Omit<SessionResult, 'id'> & { id?: string }

/** Everything saved for one child. */
export interface ProfileProgress {
  sessions: SessionResult[]
  shownQuestionIds: Record<string, string[]>
  dailyPlanDates: string[] // local YYYY-MM-DD days "Today's practice" was finished
}

export const EMPTY_PROGRESS: ProfileProgress = {
  sessions: [],
  shownQuestionIds: {},
  dailyPlanDates: [],
}

interface ProgressState {
  byProfile: Record<string, ProfileProgress>
  recordSession: (profileId: string, result: NewSession) => void
  recordShownQuestions: (profileId: string, subType: SubType, ids: string[]) => void
  recordDailyPlanDone: (profileId: string) => void
  resetProfile: (profileId: string) => void
  // Used by cloud sync after merging local and server data.
  replaceProgress: (profileId: string, progress: ProfileProgress) => void
}

const RECENT_SESSIONS_FOR_DIFFICULTY = 3
// Generous cap so a bank's full rotation is remembered, but old history
// eventually falls off and questions can naturally recycle.
export const MAX_SHOWN_IDS_PER_SUBTYPE = 60

export const newId = (): string =>
  typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`

function ymd(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function todayStr(): string {
  return ymd(new Date())
}

/** The device-local calendar day an ISO timestamp falls on. */
export const localDay = (iso: string): string => ymd(new Date(iso))

function previousDay(day: string): string {
  const d = new Date(`${day}T12:00:00`)
  d.setDate(d.getDate() - 1)
  return ymd(d)
}

/**
 * Consecutive practice days ending today (or yesterday, so the streak isn't
 * shown as broken before today's practice). Derived from dates rather than a
 * stored counter so two devices can never disagree.
 */
export function currentStreak(progress: ProfileProgress, today: string = todayStr()): number {
  const days = new Set([...progress.sessions.map((s) => localDay(s.completedAt)), ...progress.dailyPlanDates])
  let day = days.has(today) ? today : previousDay(today)
  let streak = 0
  while (days.has(day)) {
    streak++
    day = previousDay(day)
  }
  return streak
}

export function difficultyForSubType(progress: ProfileProgress, subType: SubType): Difficulty {
  const recent = progress.sessions.filter((s) => s.subType === subType).slice(-RECENT_SESSIONS_FOR_DIFFICULTY)
  if (recent.length === 0) return 1
  const correct = recent.reduce((sum, s) => sum + s.correct, 0)
  const total = recent.reduce((sum, s) => sum + s.total, 0)
  const accuracy = total === 0 ? 0 : correct / total
  if (accuracy >= 0.85) return 3
  if (accuracy >= 0.7) return 2
  return 1
}

export const recentlyShownIds = (progress: ProfileProgress, subType: SubType): string[] =>
  progress.shownQuestionIds[subType] ?? []

type LegacySession = Omit<SessionResult, 'id'> & { id?: string }
type StoredProgress = Partial<Omit<ProfileProgress, 'sessions'>> & { sessions?: LegacySession[] }

const withIds = (sessions: LegacySession[] = []): SessionResult[] => sessions.map((s) => ({ ...s, id: s.id ?? newId() }))

const normalize = (p: StoredProgress): ProfileProgress => ({
  sessions: withIds(p.sessions),
  shownQuestionIds: p.shownQuestionIds ?? {},
  dailyPlanDates: p.dailyPlanDates ?? [],
})

/**
 * v0/v1: one flat record (before profiles) → moved under the first child.
 * v2: per-child records whose sessions have no ids → ids added once.
 */
export function migrateProgress(persisted: unknown, version: number): { byProfile: Record<string, ProfileProgress> } {
  const old = (persisted ?? {}) as StoredProgress & { byProfile?: Record<string, StoredProgress> }
  if (version >= 2 && old.byProfile) {
    return {
      byProfile: Object.fromEntries(Object.entries(old.byProfile).map(([id, p]) => [id, normalize(p)])),
    }
  }
  const hasData = (old.sessions?.length ?? 0) > 0 || Object.keys(old.shownQuestionIds ?? {}).length > 0
  if (!hasData) return { byProfile: {} }
  return { byProfile: { [LEGACY_PROFILE_ID]: normalize(old) } }
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set) => {
      const update = (profileId: string, fn: (p: ProfileProgress) => Partial<ProfileProgress>) =>
        set((state) => {
          const current = state.byProfile[profileId] ?? EMPTY_PROGRESS
          return { byProfile: { ...state.byProfile, [profileId]: { ...current, ...fn(current) } } }
        })
      return {
        byProfile: {},
        recordSession: (profileId, result) =>
          update(profileId, (p) => ({ sessions: [...p.sessions, { ...result, id: result.id ?? newId() }] })),
        recordShownQuestions: (profileId, subType, ids) =>
          update(profileId, (p) => ({
            shownQuestionIds: {
              ...p.shownQuestionIds,
              [subType]: [...(p.shownQuestionIds[subType] ?? []), ...ids].slice(-MAX_SHOWN_IDS_PER_SUBTYPE),
            },
          })),
        recordDailyPlanDone: (profileId) =>
          update(profileId, (p) => ({
            dailyPlanDates: p.dailyPlanDates.includes(todayStr()) ? p.dailyPlanDates : [...p.dailyPlanDates, todayStr()],
          })),
        resetProfile: (profileId) => update(profileId, () => EMPTY_PROGRESS),
        replaceProgress: (profileId, progress) => update(profileId, () => progress),
      }
    },
    {
      // Storage key kept from before the rename so existing progress survives.
      name: 'gt-practice-progress',
      version: 3,
      migrate: migrateProgress,
    },
  ),
)

export function useProfileProgress(profileId: string | null | undefined): ProfileProgress {
  return useProgressStore((s) => (profileId ? s.byProfile[profileId] : undefined) ?? EMPTY_PROGRESS)
}
