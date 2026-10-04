import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

const UNLOCK_KEY = 'thinksprout-parent-unlocked-at'
const UNLOCK_MINUTES = 10

function isUnlocked(): boolean {
  try {
    const at = Number(sessionStorage.getItem(UNLOCK_KEY))
    return at > 0 && Date.now() - at < UNLOCK_MINUTES * 60_000
  } catch {
    return false
  }
}

function markUnlocked() {
  try {
    sessionStorage.setItem(UNLOCK_KEY, String(Date.now()))
  } catch {
    // Storage blocked: the gate simply asks again next time.
  }
}

// Multiplication a 1st/2nd grader can't do but an adult does instantly.
function newQuestion() {
  const a = 6 + Math.floor(Math.random() * 4)
  const b = 6 + Math.floor(Math.random() * 4)
  return { a, b, answer: a * b }
}

/**
 * Grown-ups-only gate in front of parent screens (settings, progress, and later
 * purchases). App Store and Google Play kids' rules require one.
 */
export function ParentGate({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const [unlocked, setUnlocked] = useState(isUnlocked)
  const [q, setQ] = useState(newQuestion)
  const [value, setValue] = useState('')
  const [wrong, setWrong] = useState(false)

  if (unlocked) return <>{children}</>

  const submit = () => {
    if (Number(value) === q.answer) {
      markUnlocked()
      setUnlocked(true)
    } else {
      setWrong(true)
      setValue('')
      setQ(newQuestion())
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Grown-ups only</p>
        <h1 className="mt-1 text-xl font-bold text-slate-800">Parent area</h1>
        <p className="mt-3 text-sm text-slate-600">To continue, type the answer:</p>
        <p className="mt-2 text-3xl font-bold text-slate-800">
          {q.a} × {q.b} = ?
        </p>
        <form
          className="mt-4 flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            autoFocus
            aria-label="Answer"
            value={value}
            onChange={(e) => {
              setValue(e.target.value.replace(/\D/g, ''))
              setWrong(false)
            }}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-lg"
          />
          <button type="submit" className="rounded-lg bg-slate-800 px-4 py-2 font-semibold text-white">
            Go
          </button>
        </form>
        {wrong && <p className="mt-2 text-sm text-red-600">That's not it. Here's a new one.</p>}
        <button onClick={() => navigate('/')} className="mt-5 text-sm text-slate-500 underline">
          Back to practice
        </button>
      </div>
    </div>
  )
}
