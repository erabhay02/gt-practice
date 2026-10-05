import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  BATTERIES,
  getQuestionPool,
  getRampedQuestions,
  subtypesForGrade,
  type SubtestInfo,
} from '../content/contentLoader'
import { LEVELS, mockLengthFor } from '../content/levels'
import type { Choice, Grade, Question, SubType } from '../content/types'
import { useSpeech } from '../hooks/useSpeech'
import { useActiveProfile } from '../state/profilesStore'
import { recentlyShownIds, useProgressStore } from '../state/progressStore'
import { useSettingsStore } from '../state/settingsStore'
import { Confetti } from '../ui/Celebration'
import { KidButton, kidLinkClass } from '../ui/KidButton'
import { Mascot, MascotSays } from '../ui/Mascot'
import { AnswerFeedback, QuestionNav, QuestionView } from './QuestionView'
import { QuizHeader } from './QuizRunner'

// Not an official figure (K–2 levels are officially untimed): a generous
// per-item budget used only when a parent turns the timer on. Grades 3–4 use
// the real per-part limit from LEVELS instead.
const SECONDS_PER_ITEM = 45
const QUICK_ITEMS_PER_SUBTEST = 3

type Mode = 'verbal' | 'quantitative' | 'nonverbal' | 'quick'

interface Block {
  info: SubtestInfo
  questions: Question[]
  // Untimed, not scored: like the examples the teacher walks through on the real test.
  sample: Question
  seconds: number
}

interface BlockResult {
  correct: number
  answered: number
  total: number
}

const minutes = (seconds: number) => `${Math.round(seconds / 60)} min`

function partLength(subType: SubType, mode: Mode, grade: Grade): number {
  return mode === 'quick' ? QUICK_ITEMS_PER_SUBTEST : mockLengthFor(grade, subType)
}

function partSeconds(count: number, mode: Mode, grade: Grade): number {
  const official = LEVELS[grade].minutesPerPart
  return official && mode !== 'quick' ? official * 60 : count * SECONDS_PER_ITEM
}

export function MockTestChooser() {
  const profile = useActiveProfile()
  const timed = useSettingsStore((s) => s.timerEnabled)
  if (!profile) return <Navigate to="/who" replace />
  const grade = profile.grade

  return (
    <div className="min-h-screen bg-cream p-5">
      <div className="mx-auto flex max-w-md flex-col gap-4">
        <Link to="/" className="font-display text-base text-slate-500">
          ← Home
        </Link>
        <MascotSays mood="think">Practice tests are just like test day. Take your time and do your best!</MascotSays>
        <p className="px-1 text-sm text-slate-600">
          Questions start easy and get harder. Each part begins with an example.{' '}
          {timed
            ? 'Each part is timed.'
            : LEVELS[grade].minutesPerPart
              ? `No timer today. On the real test, each part has ${LEVELS[grade].minutesPerPart} minutes.`
              : 'No timer (like the real test at this age).'}
        </p>
        {BATTERIES.map(({ domain, kidLabel, label, icon }) => {
          const subtests = subtypesForGrade(grade).filter((s) => s.domain === domain)
          const items = subtests.reduce((n, s) => n + partLength(s.subType, domain as Mode, grade), 0)
          const seconds = subtests.reduce((n, s) => n + partSeconds(partLength(s.subType, domain as Mode, grade), domain as Mode, grade), 0)
          return (
            <Link
              key={domain}
              to={`/mock-test/${domain}`}
              className="rounded-3xl bg-white p-5 shadow-[0_5px_0_var(--color-sprout-100)] active:translate-y-1 active:shadow-none"
            >
              <p className="font-display text-xl font-semibold text-ink">
                {icon} {kidLabel} test <span className="text-sm font-normal text-slate-500">({label})</span>
              </p>
              <p className="text-sm text-slate-500">{subtests.map((s) => s.label).join(' · ')}</p>
              <p className="mt-1 text-sm font-semibold text-sprout-700">
                {items} questions{timed ? ` · about ${minutes(seconds)}` : ''}
              </p>
            </Link>
          )
        })}
        <Link to="/mock-test/quick" className={`${kidLinkClass('primary')} flex-col !items-start p-5 text-left`}>
          <span className="text-xl">⚡ Quick mixed test</span>
          <span className="text-sm font-normal text-sprout-50">
            All 9 parts, {QUICK_ITEMS_PER_SUBTEST} questions each
          </span>
        </Link>
      </div>
    </div>
  )
}

export function MockTest() {
  const { mode = 'quick' } = useParams<{ mode: Mode }>()
  const navigate = useNavigate()
  const profile = useActiveProfile()
  const { speak, stop, speaking, problem, isSupported } = useSpeech()
  const recordSession = useProgressStore((s) => s.recordSession)
  const recordShownQuestions = useProgressStore((s) => s.recordShownQuestions)
  // Frozen for the whole run so toggling the setting mid-test can't break timing.
  const [timed] = useState(() => useSettingsStore.getState().timerEnabled)
  const [runId] = useState(() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`)

  const blocks = useMemo<Block[]>(() => {
    if (!profile) return []
    const progress = useProgressStore.getState().byProfile[profile.id]
    const parts = subtypesForGrade(profile.grade)
    const infos = mode === 'quick' ? parts : parts.filter((s) => s.domain === mode)
    return infos.map((info) => {
      const count = partLength(info.subType, mode, profile.grade)
      const recent = progress ? recentlyShownIds(progress, info.subType) : []
      const questions = getRampedQuestions(info.subType, count, recent, profile.grade)
      const [sample] = getQuestionPool(info.subType, 1, 1, [...recent, ...questions.map((q) => q.id)], profile.grade)
      recordShownQuestions(profile.id, info.subType, [sample, ...questions].map((q) => q.id))
      return { info, questions, sample, seconds: partSeconds(count, mode, profile.grade) }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, profile?.id])

  const [blockIdx, setBlockIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'sample' | 'question' | 'complete'>('intro')
  const [sampleChoice, setSampleChoice] = useState<Choice | null>(null)
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  // First answer per question in the current part; Previous shows it again.
  const [blockAnswers, setBlockAnswers] = useState<Record<number, Choice>>({})
  const resultsRef = useRef<Partial<Record<SubType, BlockResult>>>({})
  const finishedBlocksRef = useRef(new Set<number>())

  const block = blocks[blockIdx]
  const current = block?.questions[qIdx]
  const currentAnswer = blockAnswers[qIdx] ?? null

  function finishBlock() {
    if (!profile || finishedBlocksRef.current.has(blockIdx)) return
    finishedBlocksRef.current.add(blockIdx)
    const given = Object.values(blockAnswers)
    const r: BlockResult = {
      correct: given.filter((c) => c.isCorrect).length,
      answered: given.length,
      total: block.questions.length,
    }
    resultsRef.current[block.info.subType] = r
    recordSession(profile.id, {
      subType: block.info.subType,
      correct: r.correct,
      total: r.total,
      completedAt: new Date().toISOString(),
      kind: 'mock',
      mockRunId: runId,
      mockMode: mode,
    })
    if (blockIdx === blocks.length - 1) {
      setPhase('complete')
    } else {
      setBlockIdx((i) => i + 1)
      setQIdx(0)
      setBlockAnswers({})
      setPhase('intro')
    }
  }

  // Read aloud only on request; stop any reading when the screen changes.
  useEffect(() => stop, [phase, blockIdx, qIdx, stop])

  useEffect(() => {
    if (phase !== 'question' || !timed) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [phase, timed])

  useEffect(() => {
    if (phase === 'question' && now >= deadline) finishBlock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])

  if (!profile) return <Navigate to="/who" replace />
  if (!block) return <Navigate to="/mock-test" replace />

  const speechFor = (q: Question) =>
    isSupported ? { speak: () => speak(q.promptAudioText), stop, speaking, problem } : undefined

  function startPart() {
    setDeadline(timed ? Date.now() + block.seconds * 1000 : Infinity)
    setNow(Date.now())
    setPhase('question')
  }

  if (phase === 'complete') {
    const rows = blocks.map((b) => ({ info: b.info, r: resultsRef.current[b.info.subType]! }))
    const totals = rows.reduce((acc, { r }) => ({ correct: acc.correct + r.correct, total: acc.total + r.total }), {
      correct: 0,
      total: 0,
    })
    const pct = Math.round((totals.correct / totals.total) * 100)
    return (
      <div className="min-h-screen bg-cream p-6">
        {pct >= 60 && <Confetti />}
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <Mascot mood="cheer" size={120} float />
          <h2 className="font-display text-3xl font-semibold text-ink">Test complete!</h2>
          <p className="font-display text-xl text-slate-600">
            {totals.correct} out of {totals.total} right ({pct}%)
          </p>
          <div className="w-full rounded-3xl bg-white p-4 text-left shadow-sm">
            {rows.map(({ info, r }) => (
              <div key={info.subType} className="flex items-center justify-between border-b border-sprout-50 py-2 last:border-0">
                <span className="font-display text-base text-ink">
                  {info.icon} {info.label}
                </span>
                <span className="text-sm text-slate-500">
                  {r.correct}/{r.total}
                  {r.answered < r.total && <span className="ml-1 text-sun-600">({r.total - r.answered} not answered)</span>}
                </span>
              </div>
            ))}
          </div>
          <KidButton onClick={() => navigate('/')}>Back Home</KidButton>
        </div>
      </div>
    )
  }

  if (phase === 'intro') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-cream p-6 text-center">
        <p className="font-display text-base font-medium uppercase tracking-wide text-sprout-600">
          Part {blockIdx + 1} of {blocks.length}
        </p>
        <span className="text-6xl">{block.info.icon}</span>
        <h2 className="font-display text-3xl font-semibold text-ink">{block.info.label}</h2>
        <p className="text-slate-600">{block.info.shortDescription}</p>
        <p className="text-sm text-slate-500">
          {block.questions.length} questions{timed ? ` · ${minutes(block.seconds)}` : ''}
        </p>
        <KidButton
          variant="sun"
          onClick={() => {
            setSampleChoice(null)
            setPhase('sample')
          }}
        >
          Try an example first
        </KidButton>
        <button className="font-display text-base text-slate-500 underline" onClick={startPart}>
          Skip the example and start
        </button>
      </div>
    )
  }

  if (phase === 'sample') {
    return (
      <div className="min-h-screen bg-cream p-4">
        <header className="mx-auto mb-4 flex w-full max-w-md items-center justify-between">
          <span className="rounded-full bg-sun-300 px-3 py-1 font-display text-sm font-semibold text-ink">Example · just practice</span>
          <span className="font-display text-base text-slate-600">{block.info.label}</span>
        </header>
        <QuestionView
          question={block.sample}
          selectedId={sampleChoice?.id ?? null}
          showFeedback={sampleChoice !== null}
          onSelect={(choice) => {
            if (!sampleChoice) setSampleChoice(choice)
          }}
          speech={speechFor(block.sample)}
        />
        {sampleChoice && (
          <>
            <AnswerFeedback isCorrect={sampleChoice.isCorrect} explanation={block.info.tip} />
            <div className="mx-auto mt-5 flex w-full max-w-md justify-center">
              <KidButton onClick={startPart}>{timed ? 'Start the timed part' : 'Start'}</KidButton>
            </div>
          </>
        )}
      </div>
    )
  }

  const remaining = Math.max(0, deadline - now)
  const pct = Math.round((remaining / (block.seconds * 1000)) * 100)

  return (
    <div className="min-h-screen bg-cream p-4">
      <QuizHeader title={block.info.label} index={qIdx} total={block.questions.length} onExit={() => navigate('/')} />
      {timed && (
        <div className="mx-auto -mt-2 mb-4 flex w-full max-w-md items-center gap-2" aria-label="Time left">
          <span className="text-sm">⏱️</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div className={`h-full rounded-full transition-all ${pct < 15 ? 'bg-sun-400' : 'bg-sky-400'}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
      <QuestionView
        key={current.id}
        question={current}
        selectedId={currentAnswer?.id ?? null}
        showFeedback={currentAnswer !== null}
        onSelect={(choice) => {
          if (!currentAnswer) setBlockAnswers((a) => ({ ...a, [qIdx]: choice }))
        }}
        speech={speechFor(current)}
      />
      {currentAnswer && (
        <AnswerFeedback isCorrect={currentAnswer.isCorrect} explanation={current.explanationAudioText ?? block.info.tip} />
      )}
      <QuestionNav
        canGoBack={qIdx > 0}
        onPrevious={() => setQIdx((i) => i - 1)}
        onNext={() => (qIdx === block.questions.length - 1 ? finishBlock() : setQIdx((i) => i + 1))}
        nextLabel={
          qIdx === block.questions.length - 1
            ? blockIdx === blocks.length - 1
              ? 'Finish test ✓'
              : 'Finish part ✓'
            : currentAnswer
              ? 'Next →'
              : 'Skip →'
        }
        nextEmphasis={currentAnswer !== null}
      />
    </div>
  )
}
