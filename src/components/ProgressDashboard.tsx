import { Link } from 'react-router-dom'
import { useProgressStore } from '../state/progressStore'
import { AVAILABLE_SUBTYPES } from '../content/contentLoader'

export function ProgressDashboard() {
  const accuracyBySubType = useProgressStore((s) => s.accuracyBySubType())
  const sessions = useProgressStore((s) => s.sessions)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 flex items-center gap-3">
        <Link to="/" className="text-sm text-slate-500">
          ← Home
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Progress</h1>
      </header>

      <div className="mx-auto flex max-w-md flex-col gap-4">
        {sessions.length === 0 && (
          <p className="rounded-2xl bg-white p-4 text-sm text-slate-500 shadow-sm">
            No practice sessions yet — once he completes a session, stats show up here.
          </p>
        )}

        {AVAILABLE_SUBTYPES.map(({ subType, label }) => {
          const stats = accuracyBySubType[subType]
          if (!stats || stats.total === 0) return null
          const pct = Math.round((stats.correct / stats.total) * 100)
          const needsFocus = pct < 70
          return (
            <div key={subType} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="mb-2 flex items-center justify-between">
                <p className="font-semibold text-slate-800">{label}</p>
                <span className={`text-sm font-medium ${needsFocus ? 'text-amber-600' : 'text-green-600'}`}>
                  {pct}% {needsFocus ? '• needs focus' : ''}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${needsFocus ? 'bg-amber-500' : 'bg-green-500'}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-slate-400">
                {stats.correct} / {stats.total} correct across all sessions
              </p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
