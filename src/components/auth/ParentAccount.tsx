import { useState, type ReactNode } from 'react'
import { friendlyError, useAuthStore } from '../../cloud/authStore'
import { cloudEnabled } from '../../cloud/supabase'
import { PRIVACY_URL, TERMS_URL } from './AuthScreens'

function Card({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 text-sm font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  )
}

export function ParentAccount() {
  const auth = useAuthStore()
  const [confirmSignOut, setConfirmSignOut] = useState(false)
  const [deleteText, setDeleteText] = useState('')
  const [showDelete, setShowDelete] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!cloudEnabled) {
    return (
      <Card title="Account">
        <p className="text-sm text-slate-600">This version keeps progress on this device only.</p>
      </Card>
    )
  }

  const act = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
    } catch (e) {
      setError(friendlyError(e))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-xl font-bold text-slate-800">Account</h1>

      <Card title="Signed in">
        <p className="text-sm text-slate-700">{auth.email}</p>
        <p className="mt-1 text-xs text-slate-500">
          {auth.lastSyncAt ? `Progress last synced ${new Date(auth.lastSyncAt).toLocaleString()}` : 'Not synced yet on this device'}
        </p>
        {auth.syncError && <p className="mt-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">{auth.syncError}</p>}
        <button
          onClick={() => void act(auth.sync)}
          disabled={busy}
          className="mt-3 rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium disabled:opacity-50"
        >
          {busy ? 'Syncing…' : 'Sync now'}
        </button>
      </Card>

      <Card title="Sign out">
        {confirmSignOut ? (
          <div className="text-sm text-slate-700">
            Signing out removes your children and their progress from <strong>this device</strong>. Everything stays saved in your
            account; sign in again to get it back.
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setConfirmSignOut(false)} className="rounded-lg border border-slate-300 py-2">
                Cancel
              </button>
              <button onClick={() => void act(auth.signOut)} className="rounded-lg bg-slate-800 py-2 font-semibold text-white">
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setConfirmSignOut(true)} className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium">
            Sign out of this device
          </button>
        )}
      </Card>

      <Card title="Delete account">
        {showDelete ? (
          <div className="text-sm text-slate-700">
            This permanently deletes your account, all children, and all practice history on every device. It can't be undone.
            <label className="mt-3 block text-xs text-slate-500">
              Type DELETE to confirm
              <input
                value={deleteText}
                onChange={(e) => setDeleteText(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2"
              />
            </label>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button onClick={() => setShowDelete(false)} className="rounded-lg border border-slate-300 py-2">
                Cancel
              </button>
              <button
                disabled={deleteText !== 'DELETE' || busy}
                onClick={() => void act(auth.deleteAccount)}
                className="rounded-lg bg-red-600 py-2 font-semibold text-white disabled:opacity-40"
              >
                Delete forever
              </button>
            </div>
          </div>
        ) : (
          <button onClick={() => setShowDelete(true)} className="text-sm font-medium text-red-600 underline">
            Delete my account and all data
          </button>
        )}
      </Card>

      {error && <p className="rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p>}

      <p className="text-center text-xs text-slate-500">
        <a href={PRIVACY_URL} className="underline">
          Privacy Policy
        </a>{' '}
        ·{' '}
        <a href={TERMS_URL} className="underline">
          Terms
        </a>
      </p>
    </div>
  )
}
