import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { clipUrl, useEnglishVoices, useSpeech } from '../hooks/useSpeech'
import { SOUND_CHECK_TEXT } from '../audio/promptCatalog'
import { useProgressStore } from '../state/progressStore'
import { daysUntil, useSettingsStore, type SpeechRate } from '../state/settingsStore'

const RATES: { value: SpeechRate; label: string }[] = [
  { value: 0.75, label: 'Slow' },
  { value: 0.9, label: 'Normal' },
  { value: 1.05, label: 'Fast' },
]

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  )
}

type CheckResult = { ok: boolean; lines: string[]; verdict: string }

// Plays one recorded question and reports what happened, so a "no sound"
// problem can be pinned to the app vs. the device's audio.
function runSoundCheck(): Promise<CheckResult> {
  return new Promise((resolve) => {
    const lines: string[] = []
    const url = clipUrl(SOUND_CHECK_TEXT)
    if (!url) {
      resolve({ ok: false, lines, verdict: 'The sound-check recording is missing from this version of the app.' })
      return
    }
    const audio = new Audio(url)
    const t0 = performance.now()
    const ms = () => `${Math.round(performance.now() - t0)} ms`
    let done = false
    const finish = (r: Omit<CheckResult, 'lines'>) => {
      if (done) return
      done = true
      resolve({ ...r, lines })
    }
    audio.onplaying = () => lines.push(`Recording started at ${ms()}`)
    audio.onended = () => {
      lines.push(`Recording finished at ${ms()}`)
      finish({
        ok: true,
        verdict:
          "The app played the recording. If you didn't hear it: turn the volume up, check headphones/Bluetooth, and on iPhone make sure the Silent switch is off.",
      })
    }
    audio.onerror = () => finish({ ok: false, verdict: 'The recording could not be loaded. Connect to the internet once, then try again.' })
    audio.play().catch((e: DOMException) => finish({ ok: false, verdict: `The browser blocked playback (${e.name}). Tap the button again.` }))
    window.setTimeout(() => finish({ ok: false, verdict: 'The recording did not finish playing. Check your connection and try again.' }), 12000)
  })
}

export function Settings() {
  const settings = useSettingsStore()
  const resetProgress = useProgressStore((s) => s.resetProgress)
  const sessionCount = useProgressStore((s) => s.sessions.length)
  const voices = useEnglishVoices()
  const { speak, isSupported } = useSpeech()
  const [confirmReset, setConfirmReset] = useState(false)
  const [check, setCheck] = useState<CheckResult | 'running' | null>(null)
  const days = daysUntil(settings.testDate)

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <header className="mb-6 flex items-center gap-3">
        <Link to="/" className="text-sm text-slate-500">
          ← Home
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Settings</h1>
      </header>

      <div className="mx-auto flex max-w-md flex-col gap-4">
        <Section title="Test date">
          <input
            type="date"
            value={settings.testDate ?? ''}
            onChange={(e) => settings.setTestDate(e.target.value || null)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
          />
          {days !== null && (
            <p className="mt-2 text-sm text-slate-500">
              {days > 0 ? `${days} days to go` : days === 0 ? 'Test day! Good luck!' : 'This date has passed.'}
            </p>
          )}
        </Section>

        <Section title="Read-aloud">
          {!isSupported && <p className="text-sm text-amber-600">This browser can't read questions aloud.</p>}
          <p className="mb-2 text-xs text-slate-500">Speed</p>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {RATES.map((r) => (
              <button
                key={r.value}
                onClick={() => settings.setSpeechRate(r.value)}
                className={`rounded-lg border-2 py-2 text-sm font-medium ${
                  settings.speechRate === r.value ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 text-slate-600'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {voices.length > 0 && (
            <>
              <p className="mb-1 text-xs text-slate-500">Backup voice</p>
              <p className="mb-2 text-xs text-slate-400">Questions use a recorded voice. This is only used if a recording is missing.</p>
              <select
                value={settings.voiceName ?? ''}
                onChange={(e) => settings.setVoiceName(e.target.value || null)}
                className="mb-3 w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-800"
              >
                <option value="">Default voice</option>
                {voices.map((v) => (
                  <option key={v.name} value={v.name}>
                    {v.name} ({v.lang})
                  </option>
                ))}
              </select>
            </>
          )}
          {isSupported && (
            <button
              onClick={() => speak('Which one can fly, but is not a bird?')}
              className="w-full rounded-lg bg-indigo-100 py-2 text-sm font-medium text-indigo-700"
            >
              🔊 Test the voice
            </button>
          )}
        </Section>

        <Section title="Speech check">
          <p className="mb-2 text-xs text-slate-500">
            If Listen makes no sound, run this. It plays one recorded sentence and shows what happened.
          </p>
          <button
            onClick={async () => {
              setCheck('running')
              setCheck(await runSoundCheck())
            }}
            disabled={check === 'running'}
            className="w-full rounded-lg bg-indigo-600 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {check === 'running' ? 'Checking… (listen now)' : 'Run speech check'}
          </button>
          {check && check !== 'running' && (
            <div className={`mt-3 rounded-lg p-3 text-xs ${check.ok ? 'bg-green-50 text-green-900' : 'bg-amber-50 text-amber-900'}`}>
              {check.lines.map((l) => (
                <p key={l}>{l}</p>
              ))}
              <p className="mt-2 font-semibold">{check.verdict}</p>
            </div>
          )}
        </Section>

        <Section title="Mock test timer">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600">
              Time each part like the real test. Turn off for a relaxed run on a nervous day.
            </span>
            <input
              type="checkbox"
              checked={settings.timerEnabled}
              onChange={(e) => settings.setTimerEnabled(e.target.checked)}
              className="h-6 w-6 shrink-0 accent-indigo-600"
            />
          </label>
        </Section>

        <Section title="Progress">
          {!confirmReset ? (
            <button
              onClick={() => setConfirmReset(true)}
              disabled={sessionCount === 0}
              className="w-full rounded-lg border-2 border-red-200 py-2 text-sm font-medium text-red-600 disabled:opacity-40"
            >
              Reset all progress
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <p className="text-sm text-slate-600">
                This deletes all {sessionCount} saved sessions, the streak, and the question history. It can't be undone.
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => setConfirmReset(false)} className="rounded-lg border border-slate-300 py-2 text-sm">
                  Cancel
                </button>
                <button
                  onClick={() => {
                    resetProgress()
                    setConfirmReset(false)
                  }}
                  className="rounded-lg bg-red-600 py-2 text-sm font-medium text-white"
                >
                  Yes, reset
                </button>
              </div>
            </div>
          )}
        </Section>

        <p className="text-center text-xs text-slate-400">App version: {__BUILD_ID__}</p>
      </div>
    </div>
  )
}
