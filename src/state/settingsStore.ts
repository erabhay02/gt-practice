import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SpeechRate = 0.75 | 0.9 | 1.05

interface SettingsState {
  speechRate: SpeechRate
  // Name of the chosen SpeechSynthesis voice; null = browser default.
  voiceName: string | null
  timerEnabled: boolean
  testDate: string | null // YYYY-MM-DD
  setSpeechRate: (rate: SpeechRate) => void
  setVoiceName: (name: string | null) => void
  setTimerEnabled: (on: boolean) => void
  setTestDate: (date: string | null) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      speechRate: 0.9,
      voiceName: null,
      timerEnabled: true,
      testDate: null,
      setSpeechRate: (speechRate) => set({ speechRate }),
      setVoiceName: (voiceName) => set({ voiceName }),
      setTimerEnabled: (timerEnabled) => set({ timerEnabled }),
      setTestDate: (testDate) => set({ testDate }),
    }),
    { name: 'gt-practice-settings' },
  ),
)

export function daysUntil(date: string | null): number | null {
  if (!date) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(`${date}T00:00:00`)
  return Math.round((target.getTime() - today.getTime()) / 86_400_000)
}
