import { LEGACY_PROFILE_ID, useProfilesStore } from './profilesStore'
import { useProgressStore } from './progressStore'
import { useSettingsStore } from './settingsStore'

/**
 * One-time upgrade for devices that used the app before child profiles:
 * their progress was moved under LEGACY_PROFILE_ID (see progressStore's
 * migrate); this creates the matching 2nd-grade profile so nothing is lost.
 */
export function ensureLegacyProfile(): void {
  const profiles = useProfilesStore.getState()
  const hasLegacyProgress = Boolean(useProgressStore.getState().byProfile[LEGACY_PROFILE_ID])
  const alreadyThere = profiles.profiles.some((p) => p.id === LEGACY_PROFILE_ID)
  if (!hasLegacyProgress || alreadyThere) return
  profiles.addProfile({
    id: LEGACY_PROFILE_ID,
    name: 'My child',
    grade: 2,
    avatar: '🌱',
    testDate: useSettingsStore.getState().testDate,
  })
}
