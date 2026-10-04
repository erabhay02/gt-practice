import { useState } from 'react'
import { LEVELS } from '../content/levels'
import type { Grade } from '../content/types'
import { AVATARS } from '../state/profilesStore'
import { KidButton } from '../ui/KidButton'

export interface ChildFormValues {
  name: string
  grade: Grade
  avatar: string
}

export function ChildForm({
  initial,
  submitLabel = 'Save',
  onSubmit,
  onCancel,
}: {
  initial?: Partial<ChildFormValues>
  submitLabel?: string
  onSubmit: (v: ChildFormValues) => void
  onCancel?: () => void
}) {
  const [name, setName] = useState(initial?.name ?? '')
  const [grade, setGrade] = useState<Grade | null>(initial?.grade ?? null)
  const [avatar, setAvatar] = useState(initial?.avatar ?? AVATARS[0])
  const valid = name.trim().length > 0 && grade !== null

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onSubmit({ name: name.trim(), grade: grade!, avatar })
      }}
    >
      <label className="flex flex-col gap-1.5">
        <span className="font-display text-lg font-medium">Name</span>
        <input
          value={name}
          maxLength={20}
          onChange={(e) => setName(e.target.value)}
          placeholder="First name or nickname"
          className="rounded-2xl border-2 border-sprout-200 bg-white px-4 py-3 text-lg outline-none focus:border-sprout-400"
        />
      </label>

      <div className="flex flex-col gap-1.5">
        <span className="font-display text-lg font-medium">Grade</span>
        <div className="grid grid-cols-2 gap-3">
          {([1, 2] as Grade[]).map((g) => (
            <button
              type="button"
              key={g}
              onClick={() => setGrade(g)}
              aria-pressed={grade === g}
              className={`rounded-2xl border-2 py-4 font-display text-xl font-semibold transition ${
                grade === g ? 'border-sprout-500 bg-sprout-100 text-sprout-800' : 'border-sprout-100 bg-white text-ink'
              }`}
            >
              {LEVELS[g].label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className="font-display text-lg font-medium">Pick a buddy</span>
        <div className="grid grid-cols-5 gap-2">
          {AVATARS.map((a) => (
            <button
              type="button"
              key={a}
              onClick={() => setAvatar(a)}
              aria-pressed={avatar === a}
              aria-label={`Avatar ${a}`}
              className={`flex aspect-square items-center justify-center rounded-2xl border-2 text-3xl transition ${
                avatar === a ? 'border-sprout-500 bg-sprout-100' : 'border-transparent bg-white'
              }`}
            >
              {a}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        {onCancel && (
          <KidButton type="button" variant="white" className="flex-1" onClick={onCancel}>
            Cancel
          </KidButton>
        )}
        <KidButton type="submit" className="flex-1" disabled={!valid}>
          {submitLabel}
        </KidButton>
      </div>
    </form>
  )
}
