import { useCallback, useEffect, useRef, useState } from 'react'
import { useSettingsStore } from '../state/settingsStore'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

// Chrome can garbage-collect an utterance mid-sentence (it goes silent and
// never fires `end`) unless something keeps a reference to it.
let activeUtterance: SpeechSynthesisUtterance | null = null

/**
 * The user's chosen voice, else a voice built into the device: Chrome's online
 * "Google" voices are known to start and then go silent on Macs.
 */
export function pickVoice(voiceName: string | null): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  const chosen = voiceName ? voices.find((v) => v.name === voiceName) : undefined
  return (
    chosen ??
    voices.find((v) => v.localService && v.lang === 'en-US' && v.default) ??
    voices.find((v) => v.localService && v.lang === 'en-US') ??
    voices.find((v) => v.localService && v.lang.startsWith('en'))
  )
}

/** English voices; the list loads asynchronously on some browsers. */
export function useEnglishVoices(): SpeechSynthesisVoice[] {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  useEffect(() => {
    if (!supported) return
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en')))
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])
  return voices
}

export function useSpeech() {
  const rate = useSettingsStore((s) => s.speechRate)
  const voiceName = useSettingsStore((s) => s.voiceName)
  const [speaking, setSpeaking] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const watchdog = useRef<number | undefined>(undefined)

  const stop = useCallback(() => {
    if (!supported) return
    window.clearTimeout(watchdog.current)
    activeUtterance = null
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const speak = useCallback(
    (text: string) => {
      if (!supported) return
      const synth = window.speechSynthesis
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.rate = rate
      utterance.pitch = 1.05
      const voice = pickVoice(voiceName)
      if (voice) utterance.voice = voice
      utterance.onstart = () => {
        window.clearTimeout(watchdog.current)
        setProblem(null)
        setSpeaking(true)
      }
      utterance.onend = () => {
        if (activeUtterance === utterance) activeUtterance = null
        setSpeaking(false)
      }
      utterance.onerror = (e) => {
        window.clearTimeout(watchdog.current)
        setSpeaking(false)
        // Interruptions are just us stopping/replacing the reading.
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          setProblem(`Couldn't play the voice (${e.error}). Check the volume, or pick another voice in Settings.`)
        }
      }
      activeUtterance = utterance
      setProblem(null)

      // If the browser never starts speaking, say so instead of failing silently.
      window.clearTimeout(watchdog.current)
      watchdog.current = window.setTimeout(() => {
        if (activeUtterance === utterance && !synth.speaking) {
          setProblem('No sound came out. Check the volume, or try another voice in Settings → Test the voice.')
        }
      }, 2500)

      if (synth.speaking || synth.pending) {
        synth.cancel()
        // Safari drops an utterance queued in the same tick as cancel().
        window.setTimeout(() => {
          if (activeUtterance === utterance) synth.speak(utterance)
        }, 150)
      } else {
        // Chrome can be left paused (e.g. after the tab was hidden); this un-sticks it.
        synth.resume()
        synth.speak(utterance)
      }
    },
    [rate, voiceName],
  )

  useEffect(() => stop, [stop])

  return { speak, stop, speaking, problem, isSupported: supported }
}
