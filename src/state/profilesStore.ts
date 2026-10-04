import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Grade } from '../content/types'

export interface ChildProfile {
  id: string
  name: string
  grade: Grade
  avatar: string
  testDate: string | null // YYYY-MM-DD
}

// Progress saved before profiles existed is moved under this id (see progressStore).
export const LEGACY_PROFILE_ID = 'child-1'

export const AVATARS = ['🌱', '🦊', '🐼', '🦁', '🐸', '🦉', '🐙', '🦄', '🐢', '🐝']

interface ProfilesState {
  profiles: ChildProfile[]
  activeId: string | null
  addProfile: (p: Omit<ChildProfile, 'id' | 'testDate'> & { id?: string; testDate?: string | null }) => string
  updateProfile: (id: string, patch: Partial<Omit<ChildProfile, 'id'>>) => void
  removeProfile: (id: string) => void
  setActive: (id: string | null) => void
}

const newId = () => `child-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`

export const useProfilesStore = create<ProfilesState>()(
  persist(
    (set) => ({
      profiles: [],
      activeId: null,
      addProfile: (p) => {
        const id = p.id ?? newId()
        set((s) => ({
          profiles: [...s.profiles, { id, name: p.name, grade: p.grade, avatar: p.avatar, testDate: p.testDate ?? null }],
          activeId: id,
        }))
        return id
      },
      updateProfile: (id, patch) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      removeProfile: (id) =>
        set((s) => ({ profiles: s.profiles.filter((p) => p.id !== id), activeId: s.activeId === id ? null : s.activeId })),
      setActive: (activeId) => set({ activeId }),
    }),
    { name: 'thinksprout-profiles' },
  ),
)

export function useActiveProfile(): ChildProfile | null {
  return useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeId) ?? null)
}
