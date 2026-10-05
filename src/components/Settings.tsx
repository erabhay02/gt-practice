import { useState, type ReactNode } from 'react'
import { clipUrl, useEnglishVoices, useSpeech } from '../hooks/useSpeech'
import { SOUND_CHECK_TEXT } from '../audio/promptCatalog'
import { useSettingsStore, type SpeechRate } from '../state/settingsStore'

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
  const voices = useEnglishVoices()
  const { speak, isSupported } = useSpeech()
  const [check, setCheck] = useState<CheckResult | 'running' | null>(null)

  return (
    <div>
      <div className="flex flex-col gap-4">

        <Section title="Read-aloud">
          {!isSupported && <p className="text-sm text-amber-600">This browser can't read questions aloud.</p>}
          <p className="mb-2 text-xs text-slate-500">Speed</p>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {RATES.map((r) => (
              <button
                key={r.value}
                onClick={() => settings.setSpeechRate(r.value)}
                className={`rounded-lg border-2 py-2 text-sm font-medium ${
                  settings.speechRate === r.value ? 'border-sprout-500 bg-sprout-50 text-sprout-800' : 'border-slate-200 text-slate-600'
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
              className="w-full rounded-lg bg-sprout-100 py-2 text-sm font-medium text-sprout-800"
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
            className="w-full rounded-lg bg-slate-800 py-2 text-sm font-semibold text-white disabled:opacity-50"
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

        <Section title="Practice test timer">
          <label className="flex items-center justify-between gap-3">
            <span className="text-sm text-slate-600">
              Time each practice-test part. Kindergarten–2nd grade: the real test is untimed, so keep this off unless you want pace
              practice. 3rd–4th grade: the real test gives each part 10 minutes, and the timer uses that.
            </span>
            <input
              type="checkbox"
              checked={settings.timerEnabled}
              onChange={(e) => settings.setTimerEnabled(e.target.checked)}
              className="h-6 w-6 shrink-0 accent-sprout-600"
            />
          </label>
        </Section>

        <Section title="About">
          <p className="text-xs text-slate-500">
            ThinkSprout gives original practice questions in the style of cognitive abilities tests for young children. It is not
            affiliated with, endorsed by, or sponsored by Riverside Insights. CogAT® is a registered trademark of Riverside
            Assessments, LLC.
          </p>
          <p className="mt-2 text-xs text-slate-400">App version: {__BUILD_ID__}</p>
        </Section>
      </div>
    </div>
  )
}
