import { create } from 'zustand'
import { useProfilesStore } from '../state/profilesStore'
import { useProgressStore } from '../state/progressStore'
import { cloudEnabled, supabase } from './supabase'
import { syncIsApplying, syncNow } from './sync'

type Status = 'disabled' | 'loading' | 'signedOut' | 'signedIn'

interface AuthState {
  status: Status
  email: string | null
  // Invite-only beta: signed-in parents without access see the invite screen.
  hasAccess: boolean
  lastSyncAt: string | null
  syncError: string | null
  init: () => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, inviteCode: string) => Promise<void>
  verifySignUpCode: (email: string, code: string) => Promise<void>
  resendSignUpCode: (email: string) => Promise<void>
  sendResetCode: (email: string) => Promise<void>
  resetPassword: (email: string, code: string, newPassword: string) => Promise<void>
  redeemInvite: (code: string) => Promise<boolean>
  sync: () => Promise<void>
  signOut: () => Promise<void>
  deleteAccount: () => Promise<void>
}

/** Turns Supabase errors into sentences a parent can act on. */
export function friendlyError(e: unknown): string {
  const msg = e instanceof Error ? e.message : String(e)
  if (/invalid login credentials/i.test(msg)) return 'That email and password don\'t match. Try again or reset your password.'
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email first. Check your inbox for the code we sent.'
  if (/token has expired|invalid.*otp|otp.*invalid/i.test(msg)) return 'That code didn\'t work or has expired. Request a new one.'
  if (/already registered|already exists/i.test(msg)) return 'There\'s already an account with that email. Try signing in.'
  if (/password should be|weak password/i.test(msg)) return 'Please choose a longer password (at least 8 characters).'
  if (/rate limit|too many/i.test(msg)) return 'Too many tries. Please wait a few minutes and try again.'
  if (/failed to fetch|network/i.test(msg)) return 'No internet connection. Practice still works; sign-in needs a connection.'
  return msg
}

async function loadAccess(): Promise<boolean> {
  const { data, error } = await supabase().from('parents').select('beta_access').maybeSingle()
  if (error) throw error
  return Boolean(data?.beta_access)
}

/** This family's data leaves the device on sign-out (it's safe in the account). */
function clearLocalFamilyData() {
  useProfilesStore.setState({ profiles: [], activeId: null, deletedIds: [] })
  useProgressStore.setState({ byProfile: {} })
}

export const useAuthStore = create<AuthState>()((set, get) => {
  const afterSignedIn = async (email: string | null) => {
    const hasAccess = await loadAccess()
    if (hasAccess) {
      // Fresh sign-in: show the loading screen until this family's children
      // arrive, so the app opens on the right child instead of an empty picker.
      set({ status: 'loading' })
      try {
        await syncNow()
        set({ lastSyncAt: new Date().toISOString(), syncError: null })
      } catch (e) {
        set({ syncError: friendlyError(e) })
      }
    }
    set({ status: 'signedIn', email, hasAccess })
  }

  return {
    status: cloudEnabled ? 'loading' : 'disabled',
    email: null,
    hasAccess: false,
    lastSyncAt: null,
    syncError: null,

    init: async () => {
      if (!cloudEnabled) return
      const { data } = await supabase().auth.getSession()
      if (!data.session) {
        set({ status: 'signedOut' })
        return
      }
      // Signed in from before: open the app right away; access/sync refresh in the background.
      set({ status: 'signedIn', email: data.session.user.email ?? null, hasAccess: true })
      loadAccess()
        .then(async (hasAccess) => {
          set({ hasAccess })
          await get().sync()
        })
        .catch((e) => set({ syncError: friendlyError(e) }))
    },

    signIn: async (email, password) => {
      const { data, error } = await supabase().auth.signInWithPassword({ email, password })
      if (error) throw error
      await afterSignedIn(data.user.email ?? email)
    },

    signUp: async (email, password, inviteCode) => {
      const { error } = await supabase().auth.signUp({
        email,
        password,
        // Read by the sign-up trigger: redeems the invite and records consent.
        options: { data: { invite_code: inviteCode.trim().toUpperCase(), consent: 'true' } },
      })
      if (error) throw error
    },

    verifySignUpCode: async (email, code) => {
      const { data, error } = await supabase().auth.verifyOtp({ email, token: code.trim(), type: 'signup' })
      if (error) throw error
      await afterSignedIn(data.user?.email ?? email)
    },

    resendSignUpCode: async (email) => {
      const { error } = await supabase().auth.resend({ type: 'signup', email })
      if (error) throw error
    },

    sendResetCode: async (email) => {
      const { error } = await supabase().auth.resetPasswordForEmail(email)
      if (error) throw error
    },

    resetPassword: async (email, code, newPassword) => {
      const { error } = await supabase().auth.verifyOtp({ email, token: code.trim(), type: 'recovery' })
      if (error) throw error
      const { data, error: e2 } = await supabase().auth.updateUser({ password: newPassword })
      if (e2) throw e2
      await afterSignedIn(data.user.email ?? email)
    },

    redeemInvite: async (code) => {
      const { data, error } = await supabase().rpc('redeem_invite', { p_code: code })
      if (error) throw error
      if (data) {
        set({ hasAccess: true })
        await get().sync()
      }
      return Boolean(data)
    },

    sync: async () => {
      if (get().status !== 'signedIn' || !get().hasAccess) return
      try {
        await syncNow()
        set({ lastSyncAt: new Date().toISOString(), syncError: null })
      } catch (e) {
        set({ syncError: friendlyError(e) })
      }
    },

    signOut: async () => {
      await supabase().auth.signOut()
      clearLocalFamilyData()
      set({ status: 'signedOut', email: null, hasAccess: false, lastSyncAt: null })
    },

    deleteAccount: async () => {
      const { error } = await supabase().rpc('delete_my_account')
      if (error) throw error
      await supabase().auth.signOut({ scope: 'local' })
      clearLocalFamilyData()
      set({ status: 'signedOut', email: null, hasAccess: false, lastSyncAt: null })
    },
  }
})

let started = false

/** Starts auth and keeps data syncing in the background. Call once at app start. */
export function startCloud() {
  if (!cloudEnabled || started) return
  started = true
  const auth = useAuthStore.getState()
  void auth.init()

  let timer: number | undefined
  const soon = () => {
    if (syncIsApplying()) return
    window.clearTimeout(timer)
    timer = window.setTimeout(() => void useAuthStore.getState().sync(), 4000)
  }
  // Practice results and child edits sync a few seconds after they happen.
  useProgressStore.subscribe(soon)
  useProfilesStore.subscribe(soon)
  window.addEventListener('online', () => void useAuthStore.getState().sync())
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void useAuthStore.getState().sync()
  })
}
