import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Difficulty, SubType } from '../content/types'

export interface SessionResult {
  subType: SubType
  correct: number
  total: number
  completedAt: string // ISO timestamp
  // Missing on sessions saved before mock tracking existed; treated as practice.
  kind?: 'practice' | 'mock'
  // Groups the parts of one mock-test run.
  mockRunId?: string
  mockMode?: string
}

interface ProgressState {
  version: number
  sessions: SessionResult[]
  lastPracticeDate: string | null // YYYY-MM-DD
  streak: number
  shownQuestionIds: Record<string, string[]>
  recordSession: (result: SessionResult) => void
  accuracyBySubType: () => Record<string, { correct: number; total: number }>
  difficultyForSubType: (subType: SubType) => Difficulty
  getRecentlyShownIds: (subType: SubType) => string[]
  recordShownQuestions: (subType: SubType, ids: string[]) => void
  resetProgress: () => void
}

const RECENT_SESSIONS_FOR_DIFFICULTY = 3
// Generous cap so a bank's full rotation is remembered, but old history
// eventually falls off and questions can naturally recycle.
const MAX_SHOWN_IDS_PER_SUBTYPE = 60

function todayStr(): string {
  return new Date().toISOString().slice(0, 10)
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay)
}

export const useProgressStore = create<ProgressState>()(
  persist(
    (set, get) => ({
      version: 1,
      sessions: [],
      lastPracticeDate: null,
      streak: 0,
      shownQuestionIds: {},
      recordSession: (result) => {
        set((state) => {
          const today = todayStr()
          let streak = state.streak
          if (state.lastPracticeDate !== today) {
            if (state.lastPracticeDate && daysBetween(state.lastPracticeDate, today) === 1) {
              streak += 1
            } else {
              streak = 1
            }
          }
          return {
            sessions: [...state.sessions, result],
            lastPracticeDate: today,
            streak,
          }
        })
      },
      accuracyBySubType: () => {
        const sessions = get().sessions
        const acc: Record<string, { correct: number; total: number }> = {}
        for (const s of sessions) {
          if (!acc[s.subType]) acc[s.subType] = { correct: 0, total: 0 }
          acc[s.subType].correct += s.correct
          acc[s.subType].total += s.total
        }
        return acc
      },
      difficultyForSubType: (subType) => {
        const recent = get()
          .sessions.filter((s) => s.subType === subType)
          .slice(-RECENT_SESSIONS_FOR_DIFFICULTY)
        if (recent.length === 0) return 1
        const correct = recent.reduce((sum, s) => sum + s.correct, 0)
        const total = recent.reduce((sum, s) => sum + s.total, 0)
        const accuracy = total === 0 ? 0 : correct / total
        if (accuracy >= 0.85) return 3
        if (accuracy >= 0.7) return 2
        return 1
      },
      getRecentlyShownIds: (subType) => get().shownQuestionIds[subType] ?? [],
      recordShownQuestions: (subType, ids) => {
        set((state) => {
          const existing = state.shownQuestionIds[subType] ?? []
          const combined = [...existing, ...ids].slice(-MAX_SHOWN_IDS_PER_SUBTYPE)
          return { shownQuestionIds: { ...state.shownQuestionIds, [subType]: combined } }
        })
      },
      resetProgress: () => set({ sessions: [], lastPracticeDate: null, streak: 0, shownQuestionIds: {} }),
    }),
    { name: 'gt-practice-progress' },
  ),
)
