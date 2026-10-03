import type { Choice, ContentSpec, Question } from '../content/types'
import { ContentTile } from '../content/shapes/ContentTile'

function isBare(cell: ContentSpec): boolean {
  return cell.kind === 'text' || cell.kind === 'blank'
}

function isMatrix(rows: ContentSpec[][]): boolean {
  return rows.length === 2 && rows.every((r) => r.length === 2)
}

function PromptCell({ cell }: { cell: ContentSpec }) {
  if (isBare(cell)) {
    return (
      <div className="flex min-h-20 items-center justify-center px-0.5">
        <ContentTile content={cell} size="large" />
      </div>
    )
  }
  return (
    <div className="flex min-h-20 min-w-20 items-center justify-center rounded-xl border border-slate-200 bg-white p-1.5">
      <ContentTile content={cell} size="large" />
    </div>
  )
}

function Prompt({ rows }: { rows: ContentSpec[][] }) {
  if (isMatrix(rows)) {
    return (
      <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-3">
        {rows.flat().map((cell, i) => (
          <div key={i} className="flex h-24 w-24 items-center justify-center rounded-xl border border-slate-200 bg-white">
            <ContentTile content={cell} size="large" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col items-center gap-3">
      {rows.map((row, r) => (
        <div key={r} className="flex flex-wrap items-center justify-center gap-2">
          {row.map((cell, c) => (
            <PromptCell key={c} cell={cell} />
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

function SpeakButton({ speech }: { speech: SpeechControls }) {
  return (
    <button
      aria-label={speech.speaking ? 'Stop reading' : 'Read the question aloud'}
      onClick={speech.speaking ? speech.stop : speech.speak}
      className={`flex shrink-0 items-center gap-1 rounded-full px-3 py-2 text-xl transition-colors ${
        speech.speaking ? 'animate-pulse bg-indigo-600 text-white' : 'bg-indigo-100 active:bg-indigo-200'
      }`}
    >
      {speech.speaking ? '⏹' : '🔊'}
      {speech.speaking && <span className="text-xs font-semibold">Reading…</span>}
    </button>
  )
}

export function QuestionView({ question, selectedId, showFeedback, onSelect, speech }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-start justify-between gap-2">
          <p className="text-base text-slate-700">{question.promptAudioText}</p>
          {speech && <SpeakButton speech={speech} />}
        </div>
        {speech?.problem && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800">{speech.problem}</p>}
      </div>

      {question.promptVisual && (
        <div className="flex justify-center rounded-2xl bg-white p-4 shadow-sm">
          <Prompt rows={question.promptVisual} />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        {question.choices.map((choice) => {
          const isSelected = choice.id === selectedId
          const stateClasses = showFeedback
            ? choice.isCorrect
              ? 'border-green-500 bg-green-50'
              : isSelected
                ? 'border-red-500 bg-red-50'
                : 'border-slate-200 bg-white opacity-50'
            : isSelected
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 bg-white active:bg-indigo-50'
          // The picked answer always gets a label; the right answer is pointed out when he missed it.
          const label = !showFeedback
            ? null
            : isSelected
              ? choice.isCorrect
                ? { text: '✓ Correct', cls: 'bg-green-600 text-white' }
                : { text: '✗ Incorrect', cls: 'bg-red-600 text-white' }
              : choice.isCorrect
                ? { text: '✓ Correct answer', cls: 'bg-green-100 text-green-800' }
                : null
          return (
            <button
              key={choice.id}
              disabled={showFeedback}
              onClick={() => onSelect(choice)}
              className={`relative flex min-h-24 flex-col items-center justify-center gap-1 rounded-2xl border-2 p-2 shadow-sm transition-colors ${stateClasses}`}
            >
              <ContentTile content={choice.content} size="large" />
              {label && <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${label.cls}`}>{label.text}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Big Correct / Incorrect banner shown under an answered question. */
export function AnswerFeedback({ isCorrect, explanation }: { isCorrect: boolean; explanation?: string }) {
  return (
    <div
      className={`mx-auto mt-4 flex w-full max-w-md flex-col items-center gap-1 rounded-2xl border-2 p-4 text-center ${
        isCorrect ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
      }`}
    >
      <p className={`text-2xl font-bold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
        {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
      </p>
      {!isCorrect && <p className="text-sm font-medium text-slate-700">The right answer is marked in green.</p>}
      {explanation && <p className="text-sm text-slate-600">{explanation}</p>}
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
    <div className="mx-auto mt-4 grid w-full max-w-md grid-cols-2 gap-3">
      <button
        onClick={onPrevious}
        disabled={!canGoBack}
        className="rounded-full border-2 border-slate-300 py-3 text-base font-semibold text-slate-600 disabled:opacity-30"
      >
        ← Previous
      </button>
      <button
        onClick={onNext}
        className={`rounded-full py-3 text-base font-semibold ${
          nextEmphasis ? 'bg-indigo-600 text-white shadow' : 'border-2 border-indigo-600 text-indigo-600'
        }`}
      >
        {nextLabel}
      </button>
    </div>
  )
}
