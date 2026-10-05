import { useMemo, useState } from 'react'
import { GRADES, LEVELS } from '../content/levels'
import { useActiveProfile } from '../state/profilesStore'
import { AVAILABLE_SUBTYPES, BATTERIES, READING_LEVEL_SUBTYPES, getRampedQuestions, subtypesForGrade } from '../content/contentLoader'
import type { ContentSpec, Grade, Question, SubType } from '../content/types'
import { ContentTile } from '../content/shapes/ContentTile'

const LETTERS = ['A', 'B', 'C', 'D']
const PER_PART_OPTIONS = [3, 5, 8]

function isMatrix(rows: ContentSpec[][]): boolean {
  return rows.length === 2 && rows.every((r) => r.length === 2)
}

function PrintPrompt({ rows }: { rows: ContentSpec[][] }) {
  if (isMatrix(rows)) {
    return (
      <div className="grid w-fit grid-cols-2 gap-1.5">
        {rows.flat().map((cell, i) => (
          <div key={i} className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-300">
            <ContentTile content={cell} size="medium" />
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      {rows.map((row, r) => (
        <div key={r} className="flex flex-wrap items-center gap-2">
          {row.map((cell, c) =>
            cell.kind === 'text' || cell.kind === 'blank' ? (
              <ContentTile key={c} content={cell} size="medium" />
            ) : (
              <div key={c} className="flex min-h-16 min-w-16 items-center justify-center rounded-lg border border-slate-300 p-1">
                <ContentTile content={cell} size="medium" />
              </div>
            ),
          )}
        </div>
      ))}
    </div>
  )
}

function PrintQuestion({ q, number }: { q: Question; number: number }) {
  return (
    <div className="break-inside-avoid border-b border-slate-200 py-4">
      <div className="mb-2 flex gap-2">
        <span className="font-bold text-slate-800">{number}.</span>
        <span className="text-sm text-slate-600">
          {q.subType === 'sentence-completion' && q.promptVisual === undefined ? <strong>Read aloud: “{q.promptAudioText}”</strong> : q.promptAudioText}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-6 pl-6">
        {q.promptVisual && <PrintPrompt rows={q.promptVisual} />}
        <div className="flex flex-wrap gap-3">
          {q.choices.map((c, i) => (
            <div key={c.id} className="flex flex-col items-center gap-1">
              <div className="flex min-h-16 min-w-16 items-center justify-center rounded-lg border border-slate-300 p-1">
                <ContentTile content={c.content} size="medium" />
              </div>
              <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-slate-400 text-xs font-semibold text-slate-500">
                {LETTERS[i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function Worksheet() {
  const profile = useActiveProfile()
  const [grade, setGrade] = useState<Grade>(profile?.grade ?? 2)
  const [selected, setSelected] = useState<Set<SubType>>(
    () => new Set([...AVAILABLE_SUBTYPES, ...READING_LEVEL_SUBTYPES].map((s) => s.subType)),
  )
  const [perPart, setPerPart] = useState(3)
  const [version, setVersion] = useState(0)

  const parts = useMemo(
    () =>
      subtypesForGrade(grade).filter((s) => selected.has(s.subType)).map((info) => ({
        info,
        questions: getRampedQuestions(info.subType, perPart, [], grade),
      })),
    // `version` forces a fresh set of questions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, perPart, version, grade],
  )

  let n = 0
  const numbered = parts.map((p) => ({ ...p, items: p.questions.map((q) => ({ q, number: ++n })) }))

  const toggle = (s: SubType) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(s)) next.delete(s)
      else next.add(s)
      return next
    })

  return (
    <div className="print:bg-white">
      <div className="print:hidden">
        <div className="mb-6 flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-slate-600">Grade:</span>
            {GRADES.map((g) => (
              <button
                key={g}
                onClick={() => setGrade(g)}
                className={`rounded-full border-2 px-3 py-1 text-sm ${
                  grade === g ? 'border-sprout-500 bg-sprout-50 text-sprout-800' : 'border-slate-200 text-slate-500'
                }`}
              >
                {LEVELS[g].shortLabel}
              </button>
            ))}
          </div>
          {BATTERIES.map(({ domain, label }) => (
            <div key={domain}>
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
              <div className="flex flex-wrap gap-2">
                {subtypesForGrade(grade).filter((s) => s.domain === domain).map((s) => (
                  <button
                    key={s.subType}
                    onClick={() => toggle(s.subType)}
                    className={`rounded-full border-2 px-3 py-1 text-sm ${
                      selected.has(s.subType) ? 'border-sprout-500 bg-sprout-50 text-sprout-800' : 'border-slate-200 text-slate-500'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-600">Questions per part:</span>
            {PER_PART_OPTIONS.map((v) => (
              <button
                key={v}
                onClick={() => setPerPart(v)}
                className={`h-9 w-9 rounded-full border-2 text-sm font-medium ${
                  perPart === v ? 'border-sprout-500 bg-sprout-50 text-sprout-800' : 'border-slate-200 text-slate-500'
                }`}
              >
                {v}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => setVersion((v) => v + 1)} className="rounded-full border-2 border-slate-800 py-2 font-semibold text-slate-800">
              New questions
            </button>
            <button
              onClick={() => window.print()}
              disabled={n === 0}
              className="rounded-full bg-slate-800 py-2 font-semibold text-white disabled:opacity-40"
            >
              🖨️ Print
            </button>
          </div>
          <p className="text-xs text-slate-500">
            Tip: on a phone, Print lets you save as PDF. The answer key prints on the last page.
          </p>
        </div>
      </div>

      <article className="mx-auto max-w-2xl rounded-2xl bg-white p-6 shadow-sm print:max-w-none print:rounded-none print:shadow-none">
        <div className="mb-2 flex justify-between border-b-2 border-slate-800 pb-2">
          <h2 className="text-lg font-bold text-slate-800">ThinkSprout Worksheet · {LEVELS[grade].label}</h2>
          <span className="text-sm text-slate-500">Name: ____________ Date: ________</span>
        </div>
        {numbered.map(({ info, items }) => (
          <section key={info.subType}>
            <h3 className="mt-4 break-after-avoid text-sm font-bold uppercase tracking-wide text-sprout-700">{info.label}</h3>
            {items.map(({ q, number }) => (
              <PrintQuestion key={q.id + number} q={q} number={number} />
            ))}
          </section>
        ))}

        {n > 0 && (
          <section className="mt-8 break-before-page">
            <h2 className="mb-3 border-b-2 border-slate-800 pb-2 text-lg font-bold text-slate-800">Answer key</h2>
            <div className="grid grid-cols-4 gap-x-6 gap-y-1 text-sm sm:grid-cols-6">
              {numbered.flatMap(({ items }) =>
                items.map(({ q, number }) => (
                  <span key={number}>
                    {number}. <strong>{LETTERS[q.choices.findIndex((c) => c.isCorrect)]}</strong>
                  </span>
                )),
              )}
            </div>
          </section>
        )}
      </article>
    </div>
  )
}
