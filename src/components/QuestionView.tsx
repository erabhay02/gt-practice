import type { Choice, ContentSpec, Question } from '../content/types'
import { ContentTile } from '../content/shapes/ContentTile'
import { Mascot } from '../ui/Mascot'
import { KidButton } from '../ui/KidButton'

function isBare(cell: ContentSpec): boolean {
  return cell.kind === 'text' || cell.kind === 'blank'
}

function isMatrix(rows: ContentSpec[][]): boolean {
  return rows.length === 2 && rows.every((r) => r.length === 2)
}

// A long row of numbers (grades 3–4 Number Series) must fit one phone-width line.
const LONG_ROW = 8

function PromptCell({ cell, compact = false }: { cell: ContentSpec; compact?: boolean }) {
  if (cell.kind === 'sentence') {
    return (
      <div className="w-full rounded-2xl border-2 border-sprout-100 bg-white px-4 py-3">
        <ContentTile content={cell} size="large" />
      </div>
    )
  }
  if (isBare(cell)) {
    return (
      <div className={`flex items-center justify-center px-0.5 ${compact ? 'min-h-14' : 'min-h-20'}`}>
        <ContentTile content={cell} size={compact ? 'small' : 'large'} />
      </div>
    )
  }
  return (
    <div className={`flex min-h-20 min-w-20 items-center justify-center rounded-2xl border-2 border-sprout-100 bg-white ${cell.kind === 'word' ? 'px-3 py-1.5' : 'p-1.5'}`}>
      <ContentTile content={cell} size="large" />
    </div>
  )
}

function Prompt({ rows }: { rows: ContentSpec[][] }) {
  if (isMatrix(rows)) {
    return (
      <div className="grid grid-cols-2 gap-2.5">
        {rows.flat().map((cell, i) => (
          <div key={i} className="flex h-24 w-24 items-center justify-center rounded-2xl border-2 border-sprout-100 bg-white">
            <ContentTile content={cell} size="large" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3">
      {rows.map((row, r) => (
        <div key={r} className={`flex flex-wrap items-center justify-center ${row.length >= LONG_ROW ? 'gap-1.5' : 'gap-2'}`}>
          {row.map((cell, c) => (
            <PromptCell key={c} cell={cell} compact={row.length >= LONG_ROW} />
          ))}
        </div>
      ))}
    </div>
  )
}

interface Props {
  question: Question
  selectedId: string | null
  showFeedback: boolean
  onSelect: (choice: Choice) => void
  speech?: SpeechControls
}

export interface SpeechControls {
  speak: () => void
  stop: () => void
  speaking: boolean
  problem: string | null
}

export function SpeakerIcon({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M11 5 6 9H3v6h3l5 4V5z" fill="currentColor" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}

function SpeakButton({ speech }: { speech: SpeechControls }) {
  return (
    <button
      aria-label={speech.speaking ? 'Stop reading' : 'Read the question aloud'}
      onClick={speech.speaking ? speech.stop : speech.speak}
      className={`flex shrink-0 items-center gap-1.5 rounded-2xl px-4 py-2.5 font-display text-base font-semibold transition-transform active:translate-y-0.5 ${
        speech.speaking
          ? 'animate-pulse bg-sky-600 text-white'
          : 'bg-sky-400 text-white shadow-[0_4px_0_var(--color-sky-600)] active:shadow-none'
      }`}
    >
      {speech.speaking ? (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
        </svg>
      ) : (
        <SpeakerIcon />
      )}
      {speech.speaking ? 'Stop' : 'Listen'}
    </button>
  )
}

export function QuestionView({ question, selectedId, showFeedback, onSelect, speech }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="rounded-3xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <p className="font-display text-lg leading-snug text-ink">{question.promptAudioText}</p>
          {speech && <SpeakButton speech={speech} />}
        </div>
        {speech?.problem && <p className="mt-2 rounded-xl bg-sun-100 p-2 text-xs text-ink">{speech.problem}</p>}
      </div>

      {question.promptVisual && (
        <div className="flex justify-center rounded-3xl bg-sprout-50 p-4">
          <Prompt rows={question.promptVisual} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice) => {
          const isSelected = choice.id === selectedId
          const stateClasses = showFeedback
            ? choice.isCorrect
              ? 'border-sprout-500 bg-sprout-50'
              : isSelected
                ? 'border-red-400 bg-red-50'
                : 'border-slate-200 bg-white opacity-45'
            : isSelected
              ? 'border-sky-400 bg-sky-100'
              : 'border-sprout-100 bg-white shadow-[0_4px_0_var(--color-sprout-100)] active:translate-y-1 active:shadow-none'
          // The picked answer always gets a label; the right answer is pointed out when he missed it.
          const label = !showFeedback
            ? null
            : isSelected
              ? choice.isCorrect
                ? { text: '✓ Correct', cls: 'bg-sprout-500 text-white' }
                : { text: '✗ Incorrect', cls: 'bg-red-500 text-white' }
              : choice.isCorrect
                ? { text: '✓ Correct answer', cls: 'bg-sprout-100 text-sprout-800' }
                : null
          return (
            <button
              key={choice.id}
              disabled={showFeedback}
              onClick={() => onSelect(choice)}
              className={`relative flex min-h-24 flex-col items-center justify-center gap-1 rounded-3xl border-2 p-2 transition ${stateClasses}`}
            >
              <ContentTile content={choice.content} size="large" />
              {label && <span className={`rounded-full px-2.5 py-0.5 font-display text-xs font-semibold ${label.cls}`}>{label.text}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Correct / Incorrect banner with Sprout's reaction, shown under an answered question. */
export function AnswerFeedback({ isCorrect, explanation }: { isCorrect: boolean; explanation?: string }) {
  return (
    <div
      className={`mx-auto mt-4 flex w-full max-w-md animate-pop items-center gap-3 rounded-3xl border-2 p-3 ${
        isCorrect ? 'border-sprout-300 bg-sprout-50' : 'border-red-200 bg-red-50'
      }`}
    >
      <div className="shrink-0">
        <Mascot mood={isCorrect ? 'cheer' : 'oops'} size={64} />
      </div>
      <div>
        <p className={`font-display text-2xl font-semibold ${isCorrect ? 'text-sprout-700' : 'text-red-600'}`}>
          {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
        </p>
        {!isCorrect && <p className="text-sm font-semibold text-ink">The right answer is marked in green.</p>}
        {explanation && <p className="text-sm text-slate-600">{explanation}</p>}
      </div>
    </div>
  )
}

/** Previous / Next bar shown on every question. */
export function QuestionNav({
  canGoBack,
  onPrevious,
  onNext,
  nextLabel = 'Next →',
  nextEmphasis = false,
}: {
  canGoBack: boolean
  onPrevious: () => void
  onNext: () => void
  nextLabel?: string
  nextEmphasis?: boolean
}) {
  return (
    <div className="mx-auto mt-5 grid w-full max-w-md grid-cols-2 gap-3">
      <KidButton variant="white" onClick={onPrevious} disabled={!canGoBack}>
        ← Previous
      </KidButton>
      <KidButton variant={nextEmphasis ? 'primary' : 'sun'} onClick={onNext}>
        {nextLabel}
      </KidButton>
    </div>
  )
}
