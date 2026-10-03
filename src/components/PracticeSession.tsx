import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AVAILABLE_SUBTYPES, getQuestionPool } from '../content/contentLoader'
import type { Choice, Question, SubType } from '../content/types'
import { useSpeech } from '../hooks/useSpeech'
import { useProgressStore } from '../state/progressStore'
import { AnswerFeedback, QuestionNav, QuestionView } from './QuestionView'

const SESSION_LENGTH = 8

export function PracticeSession() {
  const { subtype } = useParams<{ domain: string; subtype: SubType }>()
  const navigate = useNavigate()
  const { speak, stop, isSupported } = useSpeech()
  const recordSession = useProgressStore((s) => s.recordSession)
  const difficultyForSubType = useProgressStore((s) => s.difficultyForSubType)
  const getRecentlyShownIds = useProgressStore((s) => s.getRecentlyShownIds)
  const recordShownQuestions = useProgressStore((s) => s.recordShownQuestions)

  const info = AVAILABLE_SUBTYPES.find((s) => s.subType === subtype)

  const questions = useMemo<Question[]>(() => {
    if (!info) return []
    const pool = getQuestionPool(
      info.subType,
      difficultyForSubType(info.subType),
      SESSION_LENGTH,
      getRecentlyShownIds(info.subType),
    )
    recordShownQuestions(info.subType, pool.map((q) => q.id))
    return pool
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [info?.subType])

  const [index, setIndex] = useState(0)
  // First answer per question; it's what counts, and Previous shows it again.
  const [answers, setAnswers] = useState<Record<number, Choice>>({})
  const [complete, setComplete] = useState(false)

  const current = questions[index]
  const selected = answers[index] ?? null
  const correctCount = Object.values(answers).filter((c) => c.isCorrect).length

  // Read aloud only on request; stop any reading when the question changes.
  useEffect(() => stop, [index, stop])

  if (!info || questions.length === 0) {
    return (
      <div className="p-6">
        <p>Unknown practice type.</p>
        <button className="mt-4 text-indigo-600 underline" onClick={() => navigate('/')}>
          Back home
        </button>
      </div>
    )
  }

  if (complete) {
    const stars = correctCount >= questions.length * 0.85 ? 3 : correctCount >= questions.length * 0.6 ? 2 : 1
    const skipped = questions.length - Object.keys(answers).length
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-indigo-50 p-6 text-center">
        <div className="text-6xl">{'⭐'.repeat(stars)}</div>
        <h2 className="text-2xl font-bold text-slate-800">Great job!</h2>
        <p className="text-lg text-slate-600">
          You got {correctCount} out of {questions.length} correct.
          {skipped > 0 && <span className="block text-sm text-amber-600">({skipped} skipped)</span>}
        </p>
        <div className="flex gap-3">
          <button
            className="rounded-full border-2 border-indigo-600 px-6 py-3 text-lg font-semibold text-indigo-600"
            onClick={() => navigate(0)}
          >
            Again
          </button>
          <button
            className="rounded-full bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow"
            onClick={() => navigate('/')}
          >
            Home
          </button>
        </div>
      </div>
    )
  }

  function handleSelect(choice: Choice) {
    if (selected) return
    setAnswers((a) => ({ ...a, [index]: choice }))
  }

  function handleNext() {
    if (index === questions.length - 1) {
      recordSession({
        subType: info!.subType,
        correct: correctCount,
        total: questions.length,
        completedAt: new Date().toISOString(),
        kind: 'practice',
      })
      setComplete(true)
      return
    }
    setIndex((i) => i + 1)
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-4">
      <header className="mb-4 flex items-center justify-between">
        <button className="text-sm text-slate-500" onClick={() => navigate('/')}>
          ← Exit
        </button>
        <span className="text-sm font-medium text-slate-500">
          {info.label} · {index + 1} / {questions.length}
        </span>
      </header>

      <QuestionView
        question={current}
        selectedId={selected?.id ?? null}
        showFeedback={selected !== null}
        onSelect={handleSelect}
        onSpeak={isSupported ? () => speak(current.promptAudioText) : undefined}
      />

      {selected && <AnswerFeedback isCorrect={selected.isCorrect} explanation={current.explanationAudioText ?? info.tip} />}

      <QuestionNav
        canGoBack={index > 0}
        onPrevious={() => setIndex((i) => i - 1)}
        onNext={handleNext}
        nextLabel={index === questions.length - 1 ? 'Finish ✓' : selected ? 'Next →' : 'Skip →'}
        nextEmphasis={selected !== null}
      />
    </div>
  )
}
