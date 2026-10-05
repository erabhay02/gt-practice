import { Link } from 'react-router-dom'
import { BATTERIES, subtypeInfo, subtypesForGrade } from '../content/contentLoader'
import type { Grade, SubType } from '../content/types'
import { FOCUS_THRESHOLD, focusAreas, mockRuns, statsBySubtype, summary } from '../state/progressStats'
import type { ChildProfile } from '../state/profilesStore'
import { currentStreak, difficultyForSubType, useProfileProgress } from '../state/progressStore'
import { daysUntil } from '../state/settingsStore'

const LEVEL_LABEL = { 1: 'Easy', 2: 'Medium', 3: 'Hard' } as const
const MODE_LABEL: Record<string, string> = {
  verbal: 'Verbal battery',
  quantitative: 'Quantitative battery',
  nonverbal: 'Nonverbal battery',
  quick: 'Quick mixed test',
}

const labelOf = (subType: SubType, grade: Grade) => subtypeInfo(subType, grade)?.label ?? subType
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

/** One child's progress, shown in the parent area. */
export function ProgressDashboard({ profile }: { profile: ChildProfile }) {
  const progress = useProfileProgress(profile.id)
  const { sessions } = progress
  const streak = currentStreak(progress)
  const days = daysUntil(profile.testDate)

  const stats = statsBySubtype(sessions)
  const parts = subtypesForGrade(profile.grade)
  const focus = focusAreas(
    stats,
    parts.map((s) => s.subType),
  )
  const runs = mockRuns(sessions)
  const totals = summary(sessions)

  return (
    <div>
      <div className="flex flex-col gap-5">
        <div className="grid grid-cols-3 gap-2">
          <Stat value={days !== null && days >= 0 ? days : '—'} label="days to test" />
          <Stat value={totals.daysPracticed} label="days practiced" />
          <Stat value={totals.questionsAnswered} label="questions" />
        </div>
        {days === null && (
          <Link to="/parent/children" className="-mt-3 text-center text-xs text-sprout-700 underline">
            Set {profile.name}'s test date for a countdown
          </Link>
        )}
        {streak > 1 && <p className="-mt-2 text-center text-sm font-medium text-amber-600">🔥 {streak} day streak</p>}

        {focus.length > 0 && (
          <section className="rounded-2xl border border-sprout-200 bg-sprout-50 p-4">
            <h2 className="mb-2 text-sm font-semibold text-sprout-800">Focus next</h2>
            <div className="flex flex-col gap-2">
              {focus.map((f) => {
                const info = subtypeInfo(f.subType, profile.grade)!
                return (
                  <div key={f.subType} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                    <span className="text-sm font-medium text-slate-800">{info.label}</span>
                    <span className="text-xs text-slate-500">{f.reason === 'low' ? `recent ${f.pct}%` : 'not tried yet'}</span>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {BATTERIES.map(({ domain, label }) => (
          <section key={domain}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</h2>
            <div className="flex flex-col gap-2">
              {parts.filter((s) => s.domain === domain).map(({ subType, label: subLabel }) => {
                const st = stats[subType]
                return (
                  <div key={subType} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800">{subLabel}</p>
                      {st ? (
                        <p className="text-xs text-slate-500">
                          {st.sessions} session{st.sessions === 1 ? '' : 's'} · all-time {Math.round((st.correct / st.total) * 100)}% ·
                          level {LEVEL_LABEL[difficultyForSubType(progress, subType)]}
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
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Mock tests</h2>
          {runs.length === 0 ? (
            <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
              No mock tests yet.{' '}
              <Link to="/mock-test" className="text-sprout-700 underline">
                Try one
              </Link>{' '}
              once {profile.name} is comfortable with practice.
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
                        <span className="text-slate-600">{labelOf(p.subType, profile.grade)}</span>
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
