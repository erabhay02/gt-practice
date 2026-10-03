import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  AVAILABLE_SUBTYPES,
  BATTERIES,
  getQuestionPool,
  getRampedQuestions,
  type SubtestInfo,
} from '../content/contentLoader'
import type { Choice, Question, SubType } from '../content/types'
import { useSpeech } from '../hooks/useSpeech'
import { useProgressStore } from '../state/progressStore'
import { useSettingsStore } from '../state/settingsStore'
import { QuestionView } from './QuestionView'

// Not an official figure: a generous per-item budget for the subtest timer.
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

function minutes(seconds: number): string {
  return `${Math.round(seconds / 60)} min`
}

export function MockTestChooser() {
  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 flex items-center gap-3">
        <Link to="/" className="text-sm text-slate-500">
          ← Home
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Mock Test</h1>
      </header>
      <div className="mx-auto flex max-w-md flex-col gap-3">
        <p className="text-sm text-slate-500">
          Like the real CogAT, each part is timed, questions get harder as you go, and there are no hints until the end.
          The real test gives each battery on a separate sitting, so one battery at a time is the most realistic practice.
        </p>
        {BATTERIES.map(({ domain, label }) => {
          const subtests = AVAILABLE_SUBTYPES.filter((s) => s.domain === domain)
          const items = subtests.reduce((n, s) => n + s.realLength, 0)
          return (
            <Link
              key={domain}
              to={`/mock-test/${domain}`}
              className="rounded-2xl bg-white p-5 shadow-sm active:bg-indigo-50"
            >
              <p className="text-lg font-semibold text-slate-800">{label} battery</p>
              <p className="text-sm text-slate-500">
                {subtests.map((s) => s.label).join(' · ')}
              </p>
              <p className="mt-1 text-xs font-medium text-indigo-600">
                {items} questions · about {minutes(items * SECONDS_PER_ITEM)}
              </p>
            </Link>
          )
        })}
        <Link to="/mock-test/quick" className="rounded-2xl bg-indigo-600 p-5 text-white shadow-sm active:bg-indigo-700">
          <p className="text-lg font-semibold">Quick mixed test</p>
          <p className="text-sm text-indigo-100">
            All 9 parts, {QUICK_ITEMS_PER_SUBTEST} questions each · about{' '}
            {minutes(AVAILABLE_SUBTYPES.length * QUICK_ITEMS_PER_SUBTEST * SECONDS_PER_ITEM)}
          </p>
        </Link>
      </div>
    </div>
  )
}

export function MockTest() {
  const { mode } = useParams<{ mode: Mode }>()
  const navigate = useNavigate()
  const { speak, isSupported } = useSpeech()
  const recordSession = useProgressStore((s) => s.recordSession)
  const getRecentlyShownIds = useProgressStore((s) => s.getRecentlyShownIds)
  const recordShownQuestions = useProgressStore((s) => s.recordShownQuestions)
  // Frozen for the whole run so toggling the setting mid-test can't break timing.
  const [timed] = useState(() => useSettingsStore.getState().timerEnabled)
  const [runId] = useState(() => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`)

  const blocks = useMemo<Block[]>(() => {
    const infos = mode === 'quick' ? AVAILABLE_SUBTYPES : AVAILABLE_SUBTYPES.filter((s) => s.domain === mode)
    return infos.map((info) => {
      const count = mode === 'quick' ? QUICK_ITEMS_PER_SUBTEST : info.realLength
      const recent = getRecentlyShownIds(info.subType)
      const questions = getRampedQuestions(info.subType, count, recent)
      const [sample] = getQuestionPool(info.subType, 1, 1, [...recent, ...questions.map((q) => q.id)])
      recordShownQuestions(info.subType, [sample, ...questions].map((q) => q.id))
      return { info, questions, sample, seconds: count * SECONDS_PER_ITEM }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode])

  const [blockIdx, setBlockIdx] = useState(0)
  const [qIdx, setQIdx] = useState(0)
  const [phase, setPhase] = useState<'intro' | 'sample' | 'question' | 'complete'>('intro')
  const [sampleChoice, setSampleChoice] = useState<Choice | null>(null)
  const [deadline, setDeadline] = useState(0)
  const [now, setNow] = useState(() => Date.now())
  const resultsRef = useRef<Partial<Record<SubType, BlockResult>>>({})
  const finishedBlocksRef = useRef(new Set<number>())

  const block = blocks[blockIdx]
  const current = block?.questions[qIdx]

  function finishBlock() {
    if (finishedBlocksRef.current.has(blockIdx)) return
    finishedBlocksRef.current.add(blockIdx)
    const r = resultsRef.current[block.info.subType] ?? { correct: 0, answered: 0, total: block.questions.length }
    resultsRef.current[block.info.subType] = r
    recordSession({
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
      setPhase('intro')
    }
  }

  function handleAnswer(choice: Choice) {
    const key = block.info.subType
    const r = resultsRef.current[key] ?? { correct: 0, answered: 0, total: block.questions.length }
    r.answered += 1
    if (choice.isCorrect) r.correct += 1
    resultsRef.current[key] = r
    if (qIdx === block.questions.length - 1) finishBlock()
    else setQIdx((i) => i + 1)
  }

  useEffect(() => {
    if (phase === 'question' && current) speak(current.promptAudioText)
    if (phase === 'sample' && block) speak(block.sample.promptAudioText)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, blockIdx, qIdx])

  useEffect(() => {
    if (phase !== 'question' || !timed) return
    const t = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(t)
  }, [phase])

  useEffect(() => {
    if (phase === 'question' && now >= deadline) finishBlock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [now])

  if (!block) {
    return (
      <div className="p-6">
        <p>Unknown test.</p>
        <Link to="/mock-test" className="mt-4 inline-block text-indigo-600 underline">
          Back
        </Link>
      </div>
    )
  }

  if (phase === 'complete') {
    const rows = blocks.map((b) => ({ info: b.info, r: resultsRef.current[b.info.subType]! }))
    const totals = rows.reduce((acc, { r }) => ({ correct: acc.correct + r.correct, total: acc.total + r.total }), {
      correct: 0,
      total: 0,
    })
    return (
      <div className="min-h-screen bg-indigo-50 p-6">
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <div className="text-6xl">🏁</div>
          <h2 className="text-2xl font-bold text-slate-800">Test complete!</h2>
          <p className="text-lg text-slate-600">
            {totals.correct} out of {totals.total} correct ({Math.round((totals.correct / totals.total) * 100)}%)
          </p>
          <div className="w-full rounded-2xl bg-white p-4 text-left shadow-sm">
            {rows.map(({ info, r }) => (
              <div key={info.subType} className="flex items-center justify-between border-b border-slate-100 py-2 last:border-0">
                <span className="text-sm font-medium text-slate-700">{info.label}</span>
                <span className="text-sm text-slate-500">
                  {r.correct}/{r.total}
                  {r.answered < r.total && <span className="ml-1 text-amber-600">({r.total - r.answered} ran out of time)</span>}
                </span>
              </div>
            ))}
          </div>
          <button
            className="rounded-full bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow"
            onClick={() => navigate('/')}
          >
            Back Home
          </button>
        </div>
      </div>
    )
  }

  function startTimedPart() {
    setDeadline(timed ? Date.now() + block.seconds * 1000 : Infinity)
    setNow(Date.now())
    setPhase('question')
  }

  if (phase === 'intro') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 p-6 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-indigo-500">
          Part {blockIdx + 1} of {blocks.length}
        </p>
        <h2 className="text-2xl font-bold text-slate-800">{block.info.label}</h2>
        <p className="text-slate-600">{block.info.shortDescription}</p>
        <p className="text-sm text-slate-500">
          {block.questions.length} questions · {timed ? minutes(block.seconds) : 'untimed'}
        </p>
        <button
          className="rounded-full bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow"
          onClick={() => {
            setSampleChoice(null)
            setPhase('sample')
          }}
        >
          Try an example first
        </button>
        <button className="text-sm text-slate-500 underline" onClick={startTimedPart}>
          Skip the example and start
        </button>
      </div>
    )
  }

  if (phase === 'sample') {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 p-4">
        <header className="mb-4 flex items-center justify-between">
          <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Example · not timed
          </span>
          <span className="text-sm font-medium text-slate-500">{block.info.label}</span>
        </header>
        <QuestionView
          question={block.sample}
          selectedId={sampleChoice?.id ?? null}
          showFeedback={sampleChoice !== null}
          onSelect={(choice) => {
            if (sampleChoice) return
            setSampleChoice(choice)
            speak(`${choice.isCorrect ? 'That is right!' : 'Not quite. The green one is the answer.'} ${block.info.tip}`)
          }}
          onReplay={isSupported ? () => speak(block.sample.promptAudioText) : undefined}
        />
        {sampleChoice && (
          <div className="mx-auto mt-4 flex w-full max-w-md flex-col items-center gap-3 rounded-2xl bg-white p-4 text-center shadow-sm">
            <p className={`text-lg font-semibold ${sampleChoice.isCorrect ? 'text-green-600' : 'text-amber-600'}`}>
              {sampleChoice.isCorrect ? 'That’s right!' : 'Not quite: the green one is the answer.'}
            </p>
            <p className="text-sm text-slate-600">{block.info.tip}</p>
            <button
              className="rounded-full bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow"
              onClick={startTimedPart}
            >
              {timed ? 'Start the timed part' : 'Start'}
            </button>
          </div>
        )}
      </div>
    )
  }

  const remaining = Math.max(0, deadline - now)
  const pct = Math.round((remaining / (block.seconds * 1000)) * 100)

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 p-4">
      <header className="mb-2 flex items-center justify-between">
        <button className="text-sm text-slate-500" onClick={() => navigate('/')}>
          ← Exit
        </button>
        <span className="text-sm font-medium text-slate-500">
          {block.info.label} · {qIdx + 1} / {block.questions.length}
        </span>
      </header>
      <div className={`mb-4 h-2 w-full overflow-hidden rounded-full bg-slate-200 ${timed ? '' : 'invisible'}`}>
        <div
          className={`h-full rounded-full transition-all ${pct < 15 ? 'bg-amber-500' : 'bg-indigo-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <QuestionView
        key={current.id}
        question={current}
        selectedId={null}
        showFeedback={false}
        onSelect={handleAnswer}
        onReplay={isSupported ? () => speak(current.promptAudioText) : undefined}
      />
    </div>
  )
}
