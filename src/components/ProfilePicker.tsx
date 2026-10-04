import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LEVELS } from '../content/levels'
import { useProfilesStore } from '../state/profilesStore'
import { Mascot } from '../ui/Mascot'
import { ChildForm } from './ChildForm'

/** "Who's practicing?" — also the first-run screen for adding the first child. */
export function ProfilePicker() {
  const navigate = useNavigate()
  const profiles = useProfilesStore((s) => s.profiles)
  const setActive = useProfilesStore((s) => s.setActive)
  const addProfile = useProfilesStore((s) => s.addProfile)
  const [adding, setAdding] = useState(profiles.length === 0)

  return (
    <div className="min-h-screen bg-cream p-6">
      <div className="mx-auto flex max-w-md flex-col items-center gap-5">
        <Mascot mood={adding ? 'think' : 'happy'} size={120} float />
        {adding ? (
          <>
            <h1 className="text-center font-display text-3xl font-semibold text-ink">
              {profiles.length === 0 ? 'Welcome to ThinkSprout!' : 'Add a child'}
            </h1>
            <p className="-mt-3 text-center text-slate-600">Who will be practicing?</p>
            <div className="w-full">
              <ChildForm
                submitLabel="Start practicing"
                onSubmit={(v) => {
                  addProfile(v)
                  navigate('/')
                }}
                onCancel={profiles.length > 0 ? () => setAdding(false) : undefined}
              />
            </div>
          </>
        ) : (
          <>
            <h1 className="font-display text-3xl font-semibold text-ink">Who's practicing?</h1>
            <div className="grid w-full grid-cols-2 gap-4">
              {profiles.map((p) => (
                <button
                  key={p.id}
                  onClick={() => {
                    setActive(p.id)
                    navigate('/')
                  }}
                  className="flex flex-col items-center gap-2 rounded-3xl bg-white p-5 shadow-[0_5px_0_var(--color-sprout-100)] transition-transform active:translate-y-1 active:shadow-none"
                >
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-sprout-100 text-5xl">{p.avatar}</span>
                  <span className="font-display text-xl font-semibold text-ink">{p.name}</span>
                  <span className="text-sm text-slate-500">{LEVELS[p.grade].label}</span>
                </button>
              ))}
              <button
                onClick={() => setAdding(true)}
                className="flex flex-col items-center justify-center gap-2 rounded-3xl border-2 border-dashed border-sprout-300 p-5 text-sprout-700"
              >
                <span className="text-4xl">＋</span>
                <span className="font-display text-lg font-medium">Add a child</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
