import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty, SubType } from '../content/types'
import { LEGACY_PROFILE_ID } from './profilesStore'

export interface SessionResult {
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

/** Everything saved for one child. */
export interface ProfileProgress {
  sessions: SessionResult[]
  lastPracticeDate: string | null // YYYY-MM-DD
  streak: number
  shownQuestionIds: Record<string, string[]>
  dailyPlanDates: string[] // days "Today's practice" was finished
}

export const EMPTY_PROGRESS: ProfileProgress = {
  sessions: [],
  lastPracticeDate: null,
  streak: 0,
  shownQuestionIds: {},
  dailyPlanDates: [],
}

interface ProgressState {
  byProfile: Record<string, ProfileProgress>
  recordSession: (profileId: string, result: SessionResult) => void
  recordShownQuestions: (profileId: string, subType: SubType, ids: string[]) => void
  recordDailyPlanDone: (profileId: string) => void
  resetProfile: (profileId: string) => void
}

const RECENT_SESSIONS_FOR_DIFFICULTY = 3
// Generous cap so a bank's full rotation is remembered, but old history
// eventually falls off and questions can naturally recycle.
const MAX_SHOWN_IDS_PER_SUBTYPE = 60

export function todayStr(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

function withStreak(p: ProfileProgress): Pick<ProfileProgress, 'lastPracticeDate' | 'streak'> {
  const today = todayStr()
  if (p.lastPracticeDate === today) return { lastPracticeDate: today, streak: p.streak }
  const continues = p.lastPracticeDate !== null && daysBetween(p.lastPracticeDate, today) === 1
  return { lastPracticeDate: today, streak: continues ? p.streak + 1 : 1 }
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

/** Moves pre-profile data (one flat record) under the first child's id. */
export function migrateProgress(persisted: unknown, version: number): { byProfile: Record<string, ProfileProgress> } {
  const old = (persisted ?? {}) as Partial<ProfileProgress> & { byProfile?: Record<string, ProfileProgress> }
  if (version >= 2 && old.byProfile) return { byProfile: old.byProfile }
  const hasData = (old.sessions?.length ?? 0) > 0 || Object.keys(old.shownQuestionIds ?? {}).length > 0
  if (!hasData) return { byProfile: {} }
  return {
    byProfile: {
      [LEGACY_PROFILE_ID]: {
        ...EMPTY_PROGRESS,
        sessions: old.sessions ?? [],
        lastPracticeDate: old.lastPracticeDate ?? null,
        streak: old.streak ?? 0,
        shownQuestionIds: old.shownQuestionIds ?? {},
      },
    },
  }
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
          update(profileId, (p) => ({ sessions: [...p.sessions, result], ...withStreak(p) })),
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
            ...withStreak(p),
          })),
        resetProfile: (profileId) => update(profileId, () => EMPTY_PROGRESS),
      }
    },
    {
      // Storage key kept from before the rename so existing progress survives.
      name: 'gt-practice-progress',
      version: 2,
      migrate: migrateProgress,
    },
  ),
)

export function useProfileProgress(profileId: string | null | undefined): ProfileProgress {
  return useProgressStore((s) => (profileId ? s.byProfile[profileId] : undefined) ?? EMPTY_PROGRESS)
}
