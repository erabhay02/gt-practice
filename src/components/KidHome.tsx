import { Link, Navigate } from 'react-router-dom'
import { BATTERIES, subtypesForGrade } from '../content/contentLoader'
import { LEVELS } from '../content/levels'
import type { Domain } from '../content/types'
import { DAILY_PARTS, DAILY_QUESTIONS_PER_PART } from '../state/dailyPlan'
import { LEGACY_PROFILE_ID, useActiveProfile, useProfilesStore } from '../state/profilesStore'
import { currentStreak, todayStr, useProfileProgress } from '../state/progressStore'
import { daysUntil } from '../state/settingsStore'
import { kidLinkClass } from '../ui/KidButton'
import { MascotSays } from '../ui/Mascot'

const BATTERY_STYLE: Record<Domain, { tile: string; title: string }> = {
  verbal: { tile: 'bg-sky-100 shadow-[0_4px_0_var(--color-sky-400)]', title: 'text-sky-600' },
  quantitative: { tile: 'bg-sun-100 shadow-[0_4px_0_var(--color-sun-400)]', title: 'text-sun-600' },
  nonverbal: { tile: 'bg-berry-100 shadow-[0_4px_0_var(--color-berry-400)]', title: 'text-berry-600' },
}

function Stat({ icon, value, label }: { icon: string; value: string | number; label: string }) {
  return (
    <div className="flex flex-col items-center rounded-2xl bg-white px-2 py-3 shadow-sm">
      <span className="font-display text-2xl font-semibold text-ink">
        {icon} {value}
      </span>
      <span className="text-xs text-slate-500">{label}</span>
    </div>
  )
}

export function KidHome() {
  const profile = useActiveProfile()
  const profileCount = useProfilesStore((s) => s.profiles.length)
  const progress = useProfileProgress(profile?.id)

  if (!profile) return <Navigate to="/who" replace />

  const doneToday = progress.dailyPlanDates.includes(todayStr())
  const days = daysUntil(profile.testDate)
  const stars = progress.sessions.reduce((n, s) => n + s.correct, 0)
  const greeting = doneToday
    ? `You finished today's practice, ${profile.name}! Want to play more?`
    : `Hi ${profile.name}! Ready to grow your brain today?`

  return (
    <div className="min-h-screen bg-cream px-5 pb-10 pt-5">
      <div className="mx-auto flex max-w-md flex-col gap-5">
        <header className="flex items-center justify-between">
          <Link
            to="/who"
            className="flex items-center gap-2 rounded-full bg-white py-1.5 pl-1.5 pr-4 shadow-sm"
            aria-label={profileCount > 1 ? 'Switch child' : 'Children'}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sprout-100 text-2xl">{profile.avatar}</span>
            <span className="text-left leading-tight">
              <span className="block font-display text-base font-semibold">{profile.name}</span>
              <span className="block text-xs text-slate-500">{LEVELS[profile.grade].label}{profileCount > 1 ? ' · switch' : ''}</span>
            </span>
          </Link>
          <Link to="/parent" className="rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm">
            🔒 Grown-ups
          </Link>
        </header>

        {profile.id === LEGACY_PROFILE_ID && profile.name === 'My child' && (
          <p className="rounded-2xl bg-white p-3 text-sm text-slate-600 shadow-sm">
            Grown-ups: your progress is saved here. Add your child's name in <strong>🔒 Grown-ups → Children</strong>.
          </p>
        )}

        <MascotSays mood={doneToday ? 'cheer' : 'happy'}>{greeting}</MascotSays>

        <section className="rounded-3xl bg-sun-300 p-5 shadow-[0_6px_0_var(--color-sun-600)]">
          <p className="font-display text-2xl font-semibold text-ink">Today's practice {doneToday && '✓'}</p>
          <p className="mb-4 text-sm text-ink/80">
            {DAILY_PARTS * DAILY_QUESTIONS_PER_PART} questions · about 10 minutes · picked just for you
          </p>
          <Link to="/daily" className={`${kidLinkClass(doneToday ? 'white' : 'primary')} w-full text-xl`}>
            {doneToday ? 'Play again ▶' : '▶ Start'}
          </Link>
        </section>

        <div className="grid grid-cols-3 gap-3">
          <Stat icon="🔥" value={currentStreak(progress)} label="day streak" />
          <Stat icon="⭐" value={stars} label="stars" />
          <Stat icon="📅" value={days !== null && days >= 0 ? days : '—'} label="days to test" />
        </div>

        {BATTERIES.map(({ domain, kidLabel, icon }) => (
          <section key={domain}>
            <h2 className={`mb-2 px-1 font-display text-xl font-semibold ${BATTERY_STYLE[domain].title}`}>
              {icon} {kidLabel}
            </h2>
            <div className="grid grid-cols-3 gap-3">
              {subtypesForGrade(profile.grade).filter((s) => s.domain === domain).map((s) => (
                <Link
                  key={s.subType}
                  to={`/practice/${domain}/${s.subType}`}
                  className={`flex flex-col items-center gap-1 rounded-2xl p-3 text-center transition-transform active:translate-y-1 active:shadow-none ${BATTERY_STYLE[domain].tile}`}
                >
                  <span className="text-3xl">{s.icon}</span>
                  <span className="font-display text-sm font-medium leading-tight text-ink">{s.label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <Link
          to="/mock-test"
          className="flex items-center justify-between rounded-3xl bg-sprout-500 p-5 text-white shadow-[0_6px_0_var(--color-sprout-700)] active:translate-y-1 active:shadow-none"
        >
          <span>
            <span className="block font-display text-2xl font-semibold">📝 Practice test</span>
            <span className="text-sm text-sprout-50">Like the real test day</span>
          </span>
          <span className="font-display text-3xl">→</span>
        </Link>
      </div>
    </div>
  )
}
