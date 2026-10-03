import { useCallback, useEffect, useRef, useState } from 'react'
import clipIds from '../audio/clips.json'
import { clipId } from '../audio/clipId'
import { useSettingsStore } from '../state/settingsStore'

const supported = typeof window !== 'undefined' && ('Audio' in window || 'speechSynthesis' in window)
const hasBrowserVoice = typeof window !== 'undefined' && 'speechSynthesis' in window
const CLIPS = new Set<string>(clipIds)

export function clipUrl(text: string): string | null {
  const id = clipId(text)
  return CLIPS.has(id) ? `${import.meta.env.BASE_URL}audio/${id}.m4a` : null
}

// One shared element: on iPhones, an audio element that has played once from a
// tap can play again later, so reusing it avoids "not allowed" errors.
let sharedAudio: HTMLAudioElement | null = null
function audioElement(): HTMLAudioElement {
  sharedAudio ??= new Audio()
  return sharedAudio
}

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
    if (!hasBrowserVoice) return
    const load = () => setVoices(window.speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('en')))
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])
  return voices
}

// Settings speeds were tuned for the browser voice (0.9 = normal).
const playbackRateFor = (speechRate: number) => Math.min(1.3, Math.max(0.7, speechRate / 0.9))

export function useSpeech() {
  const rate = useSettingsStore((s) => s.speechRate)
  const voiceName = useSettingsStore((s) => s.voiceName)
  const [speaking, setSpeaking] = useState(false)
  const [problem, setProblem] = useState<string | null>(null)
  const watchdog = useRef<number | undefined>(undefined)

  const stop = useCallback(() => {
    window.clearTimeout(watchdog.current)
    if (sharedAudio) {
      sharedAudio.onended = sharedAudio.onerror = sharedAudio.onplaying = null
      sharedAudio.pause()
    }
    if (hasBrowserVoice) {
      activeUtterance = null
      window.speechSynthesis.cancel()
    }
    setSpeaking(false)
  }, [])

  const speakWithBrowserVoice = useCallback(
    (text: string) => {
      if (!hasBrowserVoice) {
        setProblem("This browser can't read aloud.")
        return
      }
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
        if (e.error !== 'interrupted' && e.error !== 'canceled') {
          setProblem(`Couldn't play the voice (${e.error}). Check the volume, or pick another voice in Settings.`)
        }
      }
      activeUtterance = utterance
      window.clearTimeout(watchdog.current)
      watchdog.current = window.setTimeout(() => {
        if (activeUtterance === utterance && !synth.speaking) {
          setProblem('No sound came out. Check the volume and that the iPhone is not on Silent.')
        }
      }, 2500)
      if (synth.speaking || synth.pending) {
        synth.cancel()
        // Safari drops an utterance queued in the same tick as cancel().
        window.setTimeout(() => {
          if (activeUtterance === utterance) synth.speak(utterance)
        }, 150)
      } else {
        synth.resume()
        synth.speak(utterance)
      }
    },
    [rate, voiceName],
  )

  const speak = useCallback(
    (text: string) => {
      stop()
      setProblem(null)
      const url = clipUrl(text)
      if (!url) {
        speakWithBrowserVoice(text)
        return
      }
      // Recorded clip: plays the same on every device, independent of the
      // browser's speech engine (which iPhones mute in Silent mode).
      const audio = audioElement()
      audio.onplaying = () => setSpeaking(true)
      audio.onended = () => setSpeaking(false)
      audio.onerror = () => {
        setSpeaking(false)
        speakWithBrowserVoice(text)
      }
      audio.src = url
      audio.playbackRate = playbackRateFor(rate)
      audio.play().catch((err: DOMException) => {
        setSpeaking(false)
        if (err.name === 'NotAllowedError') setProblem('The browser blocked the sound. Tap Listen again.')
        else if (err.name !== 'AbortError') speakWithBrowserVoice(text)
      })
    },
    [rate, speakWithBrowserVoice, stop],
  )

  useEffect(() => stop, [stop])

  return { speak, stop, speaking, problem, isSupported: supported, speakWithBrowserVoice }
}

/** Downloads every recording into the offline cache so Listen works without internet. */
export async function warmAudioCache(): Promise<void> {
  if (!('caches' in window)) return
  for (const id of clipIds) {
    const url = `${import.meta.env.BASE_URL}audio/${id}.m4a`
    try {
      // Goes through the service worker, which keeps a copy (see vite.config.ts).
      const cached = await caches.match(url)
      if (!cached) await fetch(url)
    } catch {
      return // offline or blocked; try again next launch
    }
  }
}
