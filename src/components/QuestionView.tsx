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
  onReplay?: () => void
}

export function QuestionView({ question, selectedId, showFeedback, onSelect, onReplay }: Props) {
  return (
    <div className="mx-auto flex w-full max-w-md flex-col gap-4">
      <div className="flex items-start justify-between gap-2 rounded-2xl bg-white p-4 shadow-sm">
        <p className="text-base text-slate-700">{question.promptAudioText}</p>
        {onReplay && (
          <button
            aria-label="Hear the question again"
            className="shrink-0 rounded-full bg-indigo-100 p-2 text-xl"
            onClick={onReplay}
          >
            🔊
          </button>
        )}
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
                ? 'border-red-400 bg-red-50'
                : 'border-slate-200 bg-white opacity-50'
            : isSelected
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-slate-200 bg-white active:bg-indigo-50'
          return (
            <button
              key={choice.id}
              disabled={showFeedback}
              onClick={() => onSelect(choice)}
              className={`flex min-h-24 items-center justify-center rounded-2xl border-2 p-2 shadow-sm transition-colors ${stateClasses}`}
            >
              <ContentTile content={choice.content} size="large" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
