import { useCallback, useEffect, useState } from 'react'
import { useSettingsStore } from '../state/settingsStore'

const supported = typeof window !== 'undefined' && 'speechSynthesis' in window

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

  const speak = useCallback(
    (text: string) => {
      if (!supported) return
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = rate
      utterance.pitch = 1.05
      if (voiceName) {
        const voice = window.speechSynthesis.getVoices().find((v) => v.name === voiceName)
        if (voice) utterance.voice = voice
      }
      window.speechSynthesis.speak(utterance)
    },
    [rate, voiceName],
  )

  const stop = useCallback(() => {
    if (supported) window.speechSynthesis.cancel()
  }, [])

  useEffect(() => stop, [stop])

  return { speak, stop, isSupported: supported }
}
