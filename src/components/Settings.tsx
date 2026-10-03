import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { pickVoice, useEnglishVoices, useSpeech } from '../hooks/useSpeech'
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

// Talks once and reports exactly what the browser's speech engine did, so a
// "no sound" problem can be pinned to the browser vs. the device's audio.
function runSpeechCheck(voiceName: string | null, rate: number): Promise<CheckResult> {
  return new Promise((resolve) => {
    const lines: string[] = []
    if (!('speechSynthesis' in window)) {
      resolve({ ok: false, lines, verdict: 'This browser has no read-aloud support. Try Chrome or Safari.' })
      return
    }
    const synth = window.speechSynthesis
    const voices = synth.getVoices()
    const voice = pickVoice(voiceName)
    lines.push(`Voices available: ${voices.length} (${voices.filter((v) => v.localService).length} built-in)`)
    lines.push(`Using voice: ${voice ? `${voice.name}${voice.localService ? ' (built-in)' : ' (online)'}` : 'browser default'}`)
    const u = new SpeechSynthesisUtterance('This is a sound check. Which one can fly, but is not a bird?')
    u.lang = 'en-US'
    u.rate = rate
    if (voice) u.voice = voice
    const t0 = performance.now()
    const ms = () => `${Math.round(performance.now() - t0)} ms`
    let started = false
    const finish = (r: Omit<CheckResult, 'lines'>) => resolve({ ...r, lines })
    u.onstart = () => {
      started = true
      lines.push(`Started speaking at ${ms()}`)
    }
    u.onend = () => {
      lines.push(`Finished at ${ms()}`)
      finish({
        ok: true,
        verdict:
          "The browser spoke the sentence. If you didn't hear it, the sound is going somewhere else: check the volume, headphones/Bluetooth, and the Mac's sound output.",
      })
    }
    u.onerror = (e) => {
      lines.push(`Error: ${e.error} at ${ms()}`)
      finish({ ok: false, verdict: `The browser refused to speak (${e.error}). Pick a different voice above and run the check again.` })
    }
    window.setTimeout(() => {
      if (started) return
      synth.cancel()
      finish({
        ok: false,
        verdict:
          "The browser's speech engine never started. Quit Chrome completely (Cmd+Q) and reopen it, then try again. If it still fails, try the app in Safari.",
      })
    }, 4000)
    ;(window as unknown as { __speechCheck?: SpeechSynthesisUtterance }).__speechCheck = u
    synth.cancel()
    window.setTimeout(() => synth.speak(u), 150)
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
              <p className="mb-2 text-xs text-slate-500">Voice</p>
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
            If Listen makes no sound, run this. It speaks one sentence and shows what the browser did.
          </p>
          <button
            onClick={async () => {
              setCheck('running')
              setCheck(await runSpeechCheck(settings.voiceName, settings.speechRate))
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
