import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Choice, Question } from '../content/types'
import { useSpeech } from '../hooks/useSpeech'
import { Confetti } from '../ui/Celebration'
import { KidButton } from '../ui/KidButton'
import { Mascot } from '../ui/Mascot'
import { AnswerFeedback, QuestionNav, QuestionView } from './QuestionView'

export type Answers = Record<number, Choice>

interface Props {
  title: string
  questions: Question[]
  explanationFor: (q: Question) => string | undefined
  // Called once, when the child taps Finish on the last question.
  onFinish: (answers: Answers) => void
  finishedMessage?: string
}

export function QuizHeader({ title, index, total, onExit }: { title: string; index: number; total: number; onExit: () => void }) {
  return (
    <header className="mx-auto mb-4 w-full max-w-md">
      <div className="mb-2 flex items-center justify-between">
        <button className="font-display text-base text-slate-500" onClick={onExit}>
          ✕ Exit
        </button>
        <span className="font-display text-base font-medium text-slate-600">
          {title} · {index + 1} / {total}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-sprout-100">
        <div className="h-full rounded-full bg-sprout-400 transition-all" style={{ width: `${((index + 1) / total) * 100}%` }} />
      </div>
    </header>
  )
}

export function QuizRunner({ title, questions, explanationFor, onFinish, finishedMessage }: Props) {
  const navigate = useNavigate()
  const { speak, stop, speaking, problem, isSupported } = useSpeech()
  const [index, setIndex] = useState(0)
  // First answer per question; it's what counts, and Previous shows it again.
  const [answers, setAnswers] = useState<Answers>({})
  const [complete, setComplete] = useState(false)

  const current = questions[index]
  const selected = answers[index] ?? null
  const correctCount = Object.values(answers).filter((c) => c.isCorrect).length

  // Read aloud only on request; stop any reading when the question changes.
  useEffect(() => stop, [index, stop])

  if (complete) {
    const ratio = correctCount / questions.length
    const stars = ratio >= 0.85 ? 3 : ratio >= 0.6 ? 2 : 1
    const skipped = questions.length - Object.keys(answers).length
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-5 bg-cream p-6 text-center">
        {stars >= 2 && <Confetti />}
        <Mascot mood={stars >= 2 ? 'cheer' : 'happy'} size={140} float />
        <div className="flex gap-1 text-5xl" aria-label={`${stars} stars`}>
          {[1, 2, 3].map((n) => (
            <span key={n} className={n <= stars ? 'animate-pop' : 'opacity-20 grayscale'}>
              ⭐
            </span>
          ))}
        </div>
        <h2 className="font-display text-3xl font-semibold text-ink">{finishedMessage ?? 'Great job!'}</h2>
        <p className="font-display text-xl text-slate-600">
          You got {correctCount} out of {questions.length} right.
          {skipped > 0 && <span className="block text-base text-sun-600">({skipped} skipped)</span>}
        </p>
        <div className="flex gap-3">
          <KidButton variant="white" onClick={() => navigate(0)}>
            Again
          </KidButton>
          <KidButton onClick={() => navigate('/')}>Home</KidButton>
        </div>
      </div>
    )
  }

  function handleNext() {
    if (index === questions.length - 1) {
      onFinish(answers)
      setComplete(true)
      return
    }
    setIndex((i) => i + 1)
  }

  return (
    <div className="min-h-screen bg-cream p-4">
      <QuizHeader title={title} index={index} total={questions.length} onExit={() => navigate('/')} />
      <QuestionView
        question={current}
        selectedId={selected?.id ?? null}
        showFeedback={selected !== null}
        onSelect={(choice) => {
          if (!selected) setAnswers((a) => ({ ...a, [index]: choice }))
        }}
        speech={isSupported ? { speak: () => speak(current.promptAudioText), stop, speaking, problem } : undefined}
      />
      {selected && <AnswerFeedback isCorrect={selected.isCorrect} explanation={explanationFor(current)} />}
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
