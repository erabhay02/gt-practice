import { Link } from 'react-router-dom'
import { AVAILABLE_SUBTYPES, BATTERIES } from '../content/contentLoader'
import type { SubType } from '../content/types'
import { FOCUS_THRESHOLD, focusAreas, mockRuns, statsBySubtype, summary } from '../state/progressStats'
import { useProgressStore } from '../state/progressStore'
import { daysUntil, useSettingsStore } from '../state/settingsStore'

const LEVEL_LABEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const
const MODE_LABEL: Record<string, string> = {
  verbal: 'Verbal battery',
  quantitative: 'Quantitative battery',
  nonverbal: 'Nonverbal battery',
  quick: 'Quick mixed test',
}

const labelOf = (subType: SubType) => AVAILABLE_SUBTYPES.find((s) => s.subType === subType)?.label ?? subType
const scoreColor = (p: number) => (p >= FOCUS_THRESHOLD ? 'text-green-600' : p >= 60 ? 'text-amber-600' : 'text-red-600')
const barColor = (p: number) => (p >= FOCUS_THRESHOLD ? 'bg-green-500' : p >= 60 ? 'bg-amber-500' : 'bg-red-400')

function Trend({ points }: { points: number[] }) {
  return (
    <div className="flex h-8 items-end gap-0.5" aria-label={`Last ${points.length} sessions: ${points.join('%, ')}%`}>
      {points.map((p, i) => (
        <div key={i} className={`w-2 rounded-sm ${barColor(p)}`} style={{ height: `${Math.max(8, p)}%` }} />
      ))}
    </div>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl bg-white p-3 text-center shadow-sm">
      <p className="text-xl font-bold text-slate-800">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  )
}

export function ProgressDashboard() {
  const sessions = useProgressStore((s) => s.sessions)
  const streak = useProgressStore((s) => s.streak)
  const difficultyForSubType = useProgressStore((s) => s.difficultyForSubType)
  const days = daysUntil(useSettingsStore((s) => s.testDate))

  const stats = statsBySubtype(sessions)
  const focus = focusAreas(
    stats,
    AVAILABLE_SUBTYPES.map((s) => s.subType),
  )
  const runs = mockRuns(sessions)
  const totals = summary(sessions)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 flex items-center gap-3">
        <Link to="/" className="text-sm text-slate-500">
          ← Home
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Progress</h1>
      </header>

      <div className="mx-auto flex max-w-md flex-col gap-5">
        <div className="grid grid-cols-3 gap-2">
          <Stat value={days !== null && days >= 0 ? days : '—'} label="days to test" />
          <Stat value={totals.daysPracticed} label="days practiced" />
          <Stat value={totals.questionsAnswered} label="questions" />
        </div>
        {days === null && (
          <Link to="/settings" className="-mt-3 text-center text-xs text-indigo-600 underline">
            Set the test date in Settings for a countdown
          </Link>
        )}
        {streak > 1 && <p className="-mt-2 text-center text-sm font-medium text-amber-600">🔥 {streak} day streak</p>}

        {focus.length > 0 && (
          <section className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-indigo-800">Focus next</h2>
            <div className="flex flex-col gap-2">
              {focus.map((f) => {
                const info = AVAILABLE_SUBTYPES.find((s) => s.subType === f.subType)!
                return (
                  <Link
                    key={f.subType}
                    to={`/practice/${info.domain}/${f.subType}`}
                    className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm"
                  >
                    <span className="text-sm font-medium text-slate-800">{info.label}</span>
                    <span className="text-xs text-slate-500">
                      {f.reason === 'low' ? `recent ${f.pct}% · practice →` : 'not tried yet · start →'}
                    </span>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {BATTERIES.map(({ domain, label }) => (
          <section key={domain}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">{label}</h2>
            <div className="flex flex-col gap-2">
              {AVAILABLE_SUBTYPES.filter((s) => s.domain === domain).map(({ subType, label: subLabel }) => {
                const st = stats[subType]
                return (
                  <div key={subType} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">{subLabel}</p>
                      {st ? (
                        <p className="text-xs text-slate-500">
                          {st.sessions} session{st.sessions === 1 ? '' : 's'} · all-time {Math.round((st.correct / st.total) * 100)}% ·
                          level {LEVEL_LABEL[difficultyForSubType(subType)]}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-400">Not tried yet</p>
                      )}
                    </div>
                    {st && st.recentPct !== null && (
                      <div className="flex shrink-0 items-center gap-3">
                        <Trend points={st.trend} />
                        <span className={`w-11 text-right text-lg font-bold ${scoreColor(st.recentPct)}`}>{st.recentPct}%</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">Mock tests</h2>
          {runs.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
              No mock tests yet.{' '}
              <Link to="/mock-test" className="text-indigo-600 underline">
                Try one
              </Link>{' '}
              once he's comfortable with practice.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {runs.map((run) => (
                <details key={run.id} className="rounded-2xl bg-white p-4 shadow-sm">
                  <summary className="flex cursor-pointer list-none items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-800">{MODE_LABEL[run.mode] ?? run.mode}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(run.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <span className={`text-lg font-bold ${scoreColor(Math.round((run.correct / run.total) * 100))}`}>
                      {run.correct}/{run.total}
                    </span>
                  </summary>
                  <div className="mt-3 border-t border-slate-100 pt-2">
                    {run.parts.map((p) => (
                      <div key={p.subType} className="flex justify-between py-1 text-sm">
                        <span className="text-slate-600">{labelOf(p.subType)}</span>
                        <span className="text-slate-500">
                          {p.correct}/{p.total}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        <p className="text-center text-xs text-slate-400">
          Recent % = last 3 sessions. Green is {FOCUS_THRESHOLD}%+. Difficulty adjusts automatically as scores improve.
        </p>
      </div>
    </div>
  )
}
