import { useMemo } from 'react'
import { Navigate } from 'react-router-dom'
import { AVAILABLE_SUBTYPES } from '../content/contentLoader'
import type { SubType } from '../content/types'
import { buildDailyQuestions } from '../state/dailyPlan'
import { useActiveProfile } from '../state/profilesStore'
import { EMPTY_PROGRESS, todayStr, useProgressStore } from '../state/progressStore'
import { QuizRunner } from './QuizRunner'

const tipFor = (subType: SubType) => AVAILABLE_SUBTYPES.find((s) => s.subType === subType)?.tip

/** "Today's practice": a short mix weighted toward the child's weakest parts. */
export function DailyPractice() {
  const profile = useActiveProfile()
  const recordSession = useProgressStore((s) => s.recordSession)
  const recordShownQuestions = useProgressStore((s) => s.recordShownQuestions)
  const recordDailyPlanDone = useProgressStore((s) => s.recordDailyPlanDone)

  const questions = useMemo(() => {
    if (!profile) return []
    const progress = useProgressStore.getState().byProfile[profile.id] ?? EMPTY_PROGRESS
    const qs = buildDailyQuestions(progress, profile.grade, todayStr())
    for (const subType of new Set(qs.map((q) => q.subType))) {
      recordShownQuestions(profile.id, subType, qs.filter((q) => q.subType === subType).map((q) => q.id))
    }
    return qs
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  if (!profile) return <Navigate to="/who" replace />

  return (
    <QuizRunner
      title="Today's practice"
      questions={questions}
      explanationFor={(q) => q.explanationAudioText ?? tipFor(q.subType)}
      finishedMessage="Today's practice is done!"
      onFinish={(answers) => {
        const now = new Date().toISOString()
        for (const subType of new Set(questions.map((q) => q.subType))) {
          const idx = questions.map((q, i) => (q.subType === subType ? i : -1)).filter((i) => i >= 0)
          recordSession(profile.id, {
            subType,
            correct: idx.filter((i) => answers[i]?.isCorrect).length,
            total: idx.length,
            completedAt: now,
            kind: 'daily',
          })
        }
        recordDailyPlanDone(profile.id)
      }}
    />
  )
}
