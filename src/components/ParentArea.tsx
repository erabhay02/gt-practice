import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { LEVELS } from '../content/levels'
import { useProfilesStore, type ChildProfile } from '../state/profilesStore'
import { useProgressStore } from '../state/progressStore'
import { daysUntil } from '../state/settingsStore'
import { ChildForm } from './ChildForm'
import { ProgressDashboard } from './ProgressDashboard'

const TABS = [
  { to: '/parent/progress', label: 'Progress' },
  { to: '/parent/children', label: 'Children' },
  { to: '/parent/worksheet', label: 'Worksheets' },
  { to: '/parent/settings', label: 'Settings' },
]

/** Calm "grown-ups" shell around parent screens (behind the parental gate). */
export function ParentLayout() {
  return (
    <div className="min-h-screen bg-slate-50 print:bg-white">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/95 backdrop-blur print:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 pt-4">
          <p className="font-display text-lg font-semibold text-slate-800">
            🌱 ThinkSprout <span className="text-sm font-normal text-slate-500">· Parents</span>
          </p>
          <Link to="/" className="rounded-full bg-sprout-500 px-4 py-1.5 text-sm font-semibold text-white">
            Back to practice
          </Link>
        </div>
        <nav className="mx-auto flex max-w-2xl gap-1 overflow-x-auto px-3 pt-3">
          {TABS.map((t) => (
            <NavLink
              key={t.to}
              to={t.to}
              className={({ isActive }) =>
                `whitespace-nowrap border-b-2 px-3 pb-2 text-sm font-semibold ${
                  isActive ? 'border-sprout-500 text-slate-800' : 'border-transparent text-slate-500'
                }`
              }
            >
              {t.label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-2xl p-5 print:max-w-none print:p-0">
        <Outlet />
      </main>
    </div>
  )
}

function ChildChips({ value, onChange }: { value: string | null; onChange: (id: string) => void }) {
  const profiles = useProfilesStore((s) => s.profiles)
  if (profiles.length < 2) return null
  return (
    <div className="mb-4 flex flex-wrap gap-2">
      {profiles.map((p) => (
        <button
          key={p.id}
          onClick={() => onChange(p.id)}
          className={`rounded-full border-2 px-3 py-1 text-sm font-semibold ${
            value === p.id ? 'border-sprout-500 bg-sprout-50 text-sprout-800' : 'border-slate-200 bg-white text-slate-600'
          }`}
        >
          {p.avatar} {p.name}
        </button>
      ))}
    </div>
  )
}

export function ParentProgress() {
  const profiles = useProfilesStore((s) => s.profiles)
  const activeId = useProfilesStore((s) => s.activeId)
  const [chosen, setChosen] = useState<string | null>(activeId ?? profiles[0]?.id ?? null)
  const profile = profiles.find((p) => p.id === chosen) ?? profiles[0]

  if (!profile) return <p className="text-slate-600">No children yet. Add one in Children.</p>
  return (
    <>
      <ChildChips value={profile.id} onChange={setChosen} />
      <h1 className="mb-4 text-xl font-bold text-slate-800">
        {profile.name}'s progress <span className="text-sm font-normal text-slate-500">· {LEVELS[profile.grade].label}</span>
      </h1>
      <ProgressDashboard profile={profile} />
    </>
  )
}

function ChildCard({ child }: { child: ChildProfile }) {
  const updateProfile = useProfilesStore((s) => s.updateProfile)
  const removeProfile = useProfilesStore((s) => s.removeProfile)
  const resetProfile = useProgressStore((s) => s.resetProfile)
  const sessions = useProgressStore((s) => s.byProfile[child.id]?.sessions.length ?? 0)
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState<'reset' | 'remove' | null>(null)
  const days = daysUntil(child.testDate)

  if (editing) {
    return (
      <div className="rounded-2xl bg-cream p-4 shadow-sm">
        <ChildForm
          initial={child}
          onSubmit={(v) => {
            updateProfile(child.id, v)
            setEditing(false)
          }}
          onCancel={() => setEditing(false)}
        />
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sprout-100 text-3xl">{child.avatar}</span>
          <div>
            <p className="font-semibold text-slate-800">{child.name}</p>
            <p className="text-xs text-slate-500">
              {LEVELS[child.grade].label} (CogAT Level {LEVELS[child.grade].cogatLevel}) · {sessions} sessions
            </p>
          </div>
        </div>
        <button onClick={() => setEditing(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm">
          Edit
        </button>
      </div>

      <label className="mt-4 flex items-center justify-between gap-3 text-sm text-slate-600">
        <span>
          Test date
          {days !== null && (
            <span className="ml-2 text-xs text-slate-400">
              {days > 0 ? `${days} days to go` : days === 0 ? 'today!' : 'passed'}
            </span>
          )}
        </span>
        <input
          type="date"
          value={child.testDate ?? ''}
          onChange={(e) => updateProfile(child.id, { testDate: e.target.value || null })}
          className="rounded-lg border border-slate-300 px-2 py-1 text-slate-800"
        />
      </label>

      {confirm ? (
        <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-slate-700">
          {confirm === 'reset'
            ? `Delete all of ${child.name}'s saved progress (${sessions} sessions, streak, question history)? This can't be undone.`
            : `Remove ${child.name} and all of their progress? This can't be undone.`}
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => setConfirm(null)} className="rounded-lg border border-slate-300 bg-white py-1.5">
              Cancel
            </button>
            <button
              onClick={() => {
                resetProfile(child.id)
                if (confirm === 'remove') removeProfile(child.id)
                setConfirm(null)
              }}
              className="rounded-lg bg-red-600 py-1.5 font-semibold text-white"
            >
              {confirm === 'reset' ? 'Yes, reset' : 'Yes, remove'}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex gap-4 text-sm">
          <button onClick={() => setConfirm('reset')} disabled={sessions === 0} className="text-red-600 underline disabled:opacity-40">
            Reset progress
          </button>
          <button onClick={() => setConfirm('remove')} className="text-red-600 underline">
            Remove child
          </button>
        </div>
      )}
    </div>
  )
}

export function ParentChildren() {
  const profiles = useProfilesStore((s) => s.profiles)
  const addProfile = useProfilesStore((s) => s.addProfile)
  const activeId = useProfilesStore((s) => s.activeId)
  const setActive = useProfilesStore((s) => s.setActive)
  const navigate = useNavigate()
  const [adding, setAdding] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-800">Children</h1>
      {profiles.map((p) => (
        <ChildCard key={p.id} child={p} />
      ))}
      {adding ? (
        <div className="rounded-2xl bg-cream p-4 shadow-sm">
          <ChildForm
            submitLabel="Add child"
            onSubmit={(v) => {
              const prev = activeId
              addProfile(v)
              // Adding from the parent area shouldn't switch who's practicing.
              if (prev) setActive(prev)
              setAdding(false)
            }}
            onCancel={() => setAdding(false)}
          />
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="rounded-2xl border-2 border-dashed border-slate-300 py-4 font-semibold text-slate-600"
        >
          ＋ Add a child
        </button>
      )}
      {profiles.length === 0 && !adding && (
        <button onClick={() => navigate('/who')} className="text-sm text-slate-500 underline">
          Go to the child picker
        </button>
      )}
    </div>
  )
}
