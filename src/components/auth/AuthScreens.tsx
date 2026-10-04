import { useState, type FormEvent, type ReactNode } from 'react'
import { friendlyError, useAuthStore } from '../../cloud/authStore'
import { supabase } from '../../cloud/supabase'
import { Mascot } from '../../ui/Mascot'

export const PRIVACY_URL = `${import.meta.env.BASE_URL}privacy.html`
export const TERMS_URL = `${import.meta.env.BASE_URL}terms.html`

type Step = 'signIn' | 'signUp' | 'verify' | 'forgot' | 'reset'

// Supabase email codes are 6–10 digits depending on the project's setting.
const MIN_CODE = 6
const MAX_CODE = 10
const codeLooksRight = (code: string) => code.length >= MIN_CODE && code.length <= MAX_CODE

const input = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-base outline-none focus:border-sprout-500'
const primary = 'w-full rounded-xl bg-sprout-500 py-3 font-semibold text-white disabled:opacity-50'
const linkBtn = 'text-sm font-semibold text-sprout-700 underline'

function Shell({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-cream px-5 py-8">
      <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
        <Mascot size={96} float />
        <p className="font-display text-2xl font-semibold text-ink">ThinkSprout</p>
        <div className="w-full rounded-2xl bg-white p-5 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-slate-600">{subtitle}</p>}
          <div className="mt-4">{children}</div>
        </div>
        <p className="text-center text-xs text-slate-400">
          For parents and guardians ·{' '}
          <a href={PRIVACY_URL} className="underline">
            Privacy
          </a>{' '}
          ·{' '}
          <a href={TERMS_URL} className="underline">
            Terms
          </a>
        </p>
      </div>
    </div>
  )
}

/** Runs an async action with a busy flag and a readable error. */
function useAction() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = async (fn: () => Promise<void>) => {
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
  return { busy, error, setError, run }
}

const ErrorText = ({ error }: { error: string | null }) =>
  error ? <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">{error}</p> : null

export function AuthScreens() {
  const auth = useAuthStore()
  const [step, setStep] = useState<Step>('signIn')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [invite, setInvite] = useState('')
  const [consent, setConsent] = useState(false)
  const [code, setCode] = useState('')
  const [info, setInfo] = useState<string | null>(null)
  const { busy, error, setError, run } = useAction()

  const go = (s: Step) => {
    setStep(s)
    setError(null)
    setInfo(null)
    setCode('')
  }
  const submit = (fn: () => Promise<void>) => (e: FormEvent) => {
    e.preventDefault()
    void run(fn)
  }

  if (step === 'signIn') {
    return (
      <Shell title="Sign in" subtitle="Welcome back! Sign in to practice and keep progress in sync.">
        <form
          className="flex flex-col gap-3"
          onSubmit={submit(async () => {
            try {
              await auth.signIn(email.trim(), password)
            } catch (e) {
              // Signed up earlier but never entered the emailed code: go finish that.
              if (e instanceof Error && /email not confirmed/i.test(e.message)) {
                go('verify')
                setInfo(`Your email isn't confirmed yet. Enter the code we emailed to ${email.trim()}, or send a new one.`)
                return
              }
              throw e
            }
          })}
        >
          <input className={input} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button className={primary} disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <ErrorText error={error} />
        <div className="mt-4 flex justify-between">
          <button className={linkBtn} onClick={() => go('forgot')}>
            Forgot password?
          </button>
          <button className={linkBtn} onClick={() => go('signUp')}>
            Create account
          </button>
        </div>
      </Shell>
    )
  }

  if (step === 'signUp') {
    return (
      <Shell title="Create a parent account" subtitle="ThinkSprout is invite-only for now. Enter the invite code you received.">
        <form
          className="flex flex-col gap-3"
          onSubmit={submit(async () => {
            const { data: ok, error: e } = await supabase().rpc('check_invite', { p_code: invite })
            if (e) throw e
            if (!ok) throw new Error('That invite code isn\'t valid or has been used up. Check the code and try again.')
            await auth.signUp(email.trim(), password, invite)
            go('verify')
            setInfo(`We sent a code to ${email.trim()}.`)
          })}
        >
          <input className={`${input} uppercase tracking-widest`} placeholder="Invite code" value={invite} onChange={(e) => setInvite(e.target.value)} required />
          <input className={input} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <input className={input} type="password" autoComplete="new-password" minLength={8} placeholder="Password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <label className="flex items-start gap-2 text-sm text-slate-600">
            <input type="checkbox" className="mt-1 h-4 w-4 accent-sprout-600" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              I'm a parent or legal guardian (18+), and I agree to the{' '}
              <a href={PRIVACY_URL} target="_blank" className="underline">
                Privacy Policy
              </a>{' '}
              and{' '}
              <a href={TERMS_URL} target="_blank" className="underline">
                Terms
              </a>
              .
            </span>
          </label>
          <button className={primary} disabled={busy || !consent}>
            {busy ? 'Creating account…' : 'Create account'}
          </button>
        </form>
        <ErrorText error={error} />
        <button className={`${linkBtn} mt-4`} onClick={() => go('signIn')}>
          I already have an account
        </button>
      </Shell>
    )
  }

  if (step === 'verify') {
    return (
      <Shell title="Check your email" subtitle={info ?? `Enter the code we sent to ${email}.`}>
        <form className="flex flex-col gap-3" onSubmit={submit(() => auth.verifySignUpCode(email.trim(), code))}>
          <input className={`${input} text-center text-2xl tracking-[0.3em]`} inputMode="numeric" autoComplete="one-time-code" maxLength={MAX_CODE} placeholder="Code from the email" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required />
          <button className={primary} disabled={busy || !codeLooksRight(code)}>
            {busy ? 'Checking…' : 'Confirm email'}
          </button>
        </form>
        <ErrorText error={error} />
        <div className="mt-4 flex justify-between">
          <button className={linkBtn} onClick={() => void run(async () => {
            await auth.resendSignUpCode(email.trim())
            setInfo('We sent a new code.')
          })}>
            Send a new code
          </button>
          <button className={linkBtn} onClick={() => go('signIn')}>
            Back to sign in
          </button>
        </div>
      </Shell>
    )
  }

  if (step === 'forgot') {
    return (
      <Shell title="Reset your password" subtitle="We'll email you a code.">
        <form className="flex flex-col gap-3" onSubmit={submit(async () => {
          await auth.sendResetCode(email.trim())
          go('reset')
          setInfo(`If an account exists for ${email.trim()}, we sent it a code.`)
        })}>
          <input className={input} type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className={primary} disabled={busy}>
            {busy ? 'Sending…' : 'Send code'}
          </button>
        </form>
        <ErrorText error={error} />
        <button className={`${linkBtn} mt-4`} onClick={() => go('signIn')}>
          Back to sign in
        </button>
      </Shell>
    )
  }

  return (
    <Shell title="Choose a new password" subtitle={info ?? undefined}>
      <form className="flex flex-col gap-3" onSubmit={submit(() => auth.resetPassword(email.trim(), code, password))}>
        <input className={`${input} text-center text-2xl tracking-[0.3em]`} inputMode="numeric" autoComplete="one-time-code" maxLength={MAX_CODE} placeholder="Code from the email" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))} required />
        <input className={input} type="password" autoComplete="new-password" minLength={8} placeholder="New password (8+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button className={primary} disabled={busy || !codeLooksRight(code)}>
          {busy ? 'Saving…' : 'Save and sign in'}
        </button>
      </form>
      <ErrorText error={error} />
      <button className={`${linkBtn} mt-4`} onClick={() => go('signIn')}>
        Back to sign in
      </button>
    </Shell>
  )
}

export function WaitingForInvite() {
  const auth = useAuthStore()
  const [code, setCode] = useState('')
  const { busy, error, setError, run } = useAction()
  return (
    <Shell title="You're almost in" subtitle={`Signed in as ${auth.email}. ThinkSprout is invite-only right now; enter your invite code to start.`}>
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault()
          void run(async () => {
            if (!(await auth.redeemInvite(code))) setError('That invite code isn\'t valid or has been used up.')
          })
        }}
      >
        <input className={`${input} uppercase tracking-widest`} placeholder="Invite code" value={code} onChange={(e) => setCode(e.target.value)} required />
        <button className={primary} disabled={busy}>
          {busy ? 'Checking…' : 'Use invite code'}
        </button>
      </form>
      <ErrorText error={error} />
      <button className={`${linkBtn} mt-4`} onClick={() => void auth.signOut()}>
        Sign out
      </button>
    </Shell>
  )
}

/** Shows sign-in until the parent is signed in with access (only in cloud builds). */
export function AuthGate({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status)
  const hasAccess = useAuthStore((s) => s.hasAccess)
  if (status === 'disabled') return <>{children}</>
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-cream">
        <Mascot size={110} float />
      </div>
    )
  }
  if (status === 'signedOut') return <AuthScreens />
  if (!hasAccess) return <WaitingForInvite />
  return <>{children}</>
}
