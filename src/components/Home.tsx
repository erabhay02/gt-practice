import { Link } from 'react-router-dom'
import { AVAILABLE_SUBTYPES, BATTERIES } from '../content/contentLoader'
import { useProgressStore } from '../state/progressStore'

export function Home() {
  const streak = useProgressStore((s) => s.streak)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 text-center">
        <h1 className="text-3xl font-bold text-slate-800">GT Practice</h1>
        {streak > 0 && <p className="mt-1 text-sm font-medium text-amber-600">🔥 {streak} day streak</p>}
      </header>

      <div className="mx-auto flex max-w-md flex-col gap-6">
        <Link
          to="/mock-test"
          className="flex items-center justify-between rounded-2xl bg-indigo-600 p-5 text-white shadow-sm active:bg-indigo-700"
        >
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-indigo-200">Timed, like the real test</p>
            <p className="text-lg font-semibold">Mock Test</p>
          </div>
          <span className="text-2xl">→</span>
        </Link>

        {BATTERIES.map(({ domain, label }) => (
          <section key={domain}>
            <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-indigo-500">{label}</h2>
            <div className="flex flex-col gap-2">
              {AVAILABLE_SUBTYPES.filter((s) => s.domain === domain).map(({ subType, label: subLabel, shortDescription }) => (
                <Link
                  key={subType}
                  to={`/practice/${domain}/${subType}`}
                  className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm active:bg-indigo-50"
                >
                  <div>
                    <p className="text-base font-semibold text-slate-800">{subLabel}</p>
                    <p className="text-xs text-slate-500">{shortDescription}</p>
                  </div>
                  <span className="text-xl text-slate-400">→</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <Link
          to="/progress"
          className="rounded-2xl border-2 border-dashed border-slate-300 p-4 text-center text-sm font-medium text-slate-500"
        >
          View Progress (for parents)
        </Link>
      </div>
    </div>
  )
}
