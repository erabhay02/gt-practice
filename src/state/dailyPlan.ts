import { AVAILABLE_SUBTYPES, getQuestionPool } from '../content/contentLoader'
import type { Grade, Question, SubType } from '../content/types'
import { focusAreas, statsBySubtype } from './progressStats'
import { difficultyForSubType, recentlyShownIds, type ProfileProgress } from './progressStore'

export const DAILY_PARTS = 3
export const DAILY_QUESTIONS_PER_PART = 4

const ALL = AVAILABLE_SUBTYPES.map((s) => s.subType)

function dayNumber(date: string): number {
  return Math.floor(new Date(`${date}T00:00:00Z`).getTime() / 86_400_000)
}

/**
 * Today's three parts: the weakest recent part, the least-practiced part, and
 * one that rotates by date, so every part comes up regularly.
 */
export function chooseDailyParts(progress: ProfileProgress, date: string): SubType[] {
  const stats = statsBySubtype(progress.sessions)
  const picked: SubType[] = []
  const add = (s: SubType | undefined) => {
    if (s && !picked.includes(s) && picked.length < DAILY_PARTS) picked.push(s)
  }

  add(focusAreas(stats, ALL, ALL.length).find((f) => f.reason === 'low')?.subType)
  add([...ALL].sort((a, b) => (stats[a]?.sessions ?? 0) - (stats[b]?.sessions ?? 0))[0])
  const start = dayNumber(date) % ALL.length
  for (let i = 0; picked.length < DAILY_PARTS && i < ALL.length; i++) add(ALL[(start + i) % ALL.length])
  return picked
}

export function buildDailyQuestions(progress: ProfileProgress, grade: Grade, date: string): Question[] {
  return chooseDailyParts(progress, date).flatMap((subType) =>
    getQuestionPool(
      subType,
      difficultyForSubType(progress, subType),
      DAILY_QUESTIONS_PER_PART,
      recentlyShownIds(progress, subType),
      grade,
    ),
  )
}
