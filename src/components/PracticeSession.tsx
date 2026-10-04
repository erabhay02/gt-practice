import { useMemo } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { AVAILABLE_SUBTYPES, getQuestionPool } from '../content/contentLoader'
import type { Question, SubType } from '../content/types'
import { useActiveProfile } from '../state/profilesStore'
import { difficultyForSubType, recentlyShownIds, useProgressStore } from '../state/progressStore'
import { QuizRunner } from './QuizRunner'

const SESSION_LENGTH = 8

export function PracticeSession() {
  const { subtype } = useParams<{ domain: string; subtype: SubType }>()
  const profile = useActiveProfile()
  const recordSession = useProgressStore((s) => s.recordSession)
  const recordShownQuestions = useProgressStore((s) => s.recordShownQuestions)
  const info = AVAILABLE_SUBTYPES.find((s) => s.subType === subtype)

  const questions = useMemo<Question[]>(() => {
    if (!info || !profile) return []
    const progress = useProgressStore.getState().byProfile[profile.id]
    const pool = getQuestionPool(
      info.subType,
      progress ? difficultyForSubType(progress, info.subType) : 1,
      SESSION_LENGTH,
      progress ? recentlyShownIds(progress, info.subType) : [],
      profile.grade,
    )
    recordShownQuestions(profile.id, info.subType, pool.map((q) => q.id))
    return pool
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.subType, profile?.id])

  if (!profile) return <Navigate to="/who" replace />
  if (!info || questions.length === 0) return <Navigate to="/" replace />

  return (
    <QuizRunner
      title={info.label}
      questions={questions}
      explanationFor={(q) => q.explanationAudioText ?? info.tip}
      onFinish={(answers) =>
        recordSession(profile.id, {
          subType: info.subType,
          correct: Object.values(answers).filter((c) => c.isCorrect).length,
          total: questions.length,
          completedAt: new Date().toISOString(),
          kind: 'practice',
        })
      }
    />
  )
}
