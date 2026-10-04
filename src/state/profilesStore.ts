import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Grade } from '../content/types'

export interface ChildProfile {
  id: string
  name: string
  grade: Grade
  avatar: string
  testDate: string | null // YYYY-MM-DD
  // Last local edit; cloud sync keeps the newer copy of each child.
  updatedAt: string
}

// Progress saved before profiles existed is moved under this id (see progressStore).
export const LEGACY_PROFILE_ID = 'child-1'

export const AVATARS = ['🌱', '🦊', '🐼', '🦁', '🐸', '🦉', '🐙', '🦄', '🐢', '🐝']

type NewChild = Omit<ChildProfile, 'id' | 'testDate' | 'updatedAt'> & { id?: string; testDate?: string | null }

interface ProfilesState {
  profiles: ChildProfile[]
  activeId: string | null
  // Children removed on this device, so sync can remove them everywhere.
  deletedIds: string[]
  addProfile: (p: NewChild) => string
  updateProfile: (id: string, patch: Partial<Omit<ChildProfile, 'id' | 'updatedAt'>>) => void
  removeProfile: (id: string) => void
  setActive: (id: string | null) => void
  // Used by cloud sync after merging with the server.
  replaceProfiles: (profiles: ChildProfile[], deletedIds: string[]) => void
}

const newId = () => `child-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`
const now = () => new Date().toISOString()

export const useProfilesStore = create<ProfilesState>()(
  persist(
    (set) => ({
      profiles: [],
      activeId: null,
      deletedIds: [],
      addProfile: (p) => {
        const id = p.id ?? newId()
        set((s) => ({
          profiles: [
            ...s.profiles,
            { id, name: p.name, grade: p.grade, avatar: p.avatar, testDate: p.testDate ?? null, updatedAt: now() },
          ],
          activeId: id,
        }))
        return id
      },
      updateProfile: (id, patch) =>
        set((s) => ({ profiles: s.profiles.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: now() } : p)) })),
      removeProfile: (id) =>
        set((s) => ({
          profiles: s.profiles.filter((p) => p.id !== id),
          activeId: s.activeId === id ? null : s.activeId,
          deletedIds: s.deletedIds.includes(id) ? s.deletedIds : [...s.deletedIds, id],
        })),
      setActive: (activeId) => set({ activeId }),
      replaceProfiles: (profiles, deletedIds) =>
        set((s) => ({
          profiles,
          deletedIds,
          // Keep the current child; with exactly one child (e.g. a new device after
          // sign-in) pick them so the app opens straight to their home screen.
          activeId: profiles.some((p) => p.id === s.activeId)
            ? s.activeId
            : profiles.length === 1
              ? profiles[0].id
              : null,
        })),
    }),
    {
      name: 'thinksprout-profiles',
      version: 1,
      migrate: (persisted) => {
        const old = (persisted ?? {}) as Partial<ProfilesState>
        return {
          ...old,
          deletedIds: old.deletedIds ?? [],
          profiles: (old.profiles ?? []).map((p) => ({ ...p, updatedAt: p.updatedAt ?? new Date(0).toISOString() })),
        } as ProfilesState
      },
    },
  ),
)

export function useActiveProfile(): ChildProfile | null {
  return useProfilesStore((s) => s.profiles.find((p) => p.id === s.activeId) ?? null)
}
