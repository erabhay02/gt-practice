import type { ReactNode } from 'react'
import { ALL_SUBTYPES, subtypeInfo } from '../content/contentLoader'
import { FAMILIES, TEST_FAMILIES } from '../content/families'
import { ContentTile } from '../content/shapes/ContentTile'
import type { ContentSpec, ShapeSpec, TestFamily } from '../content/types'
import { KidButton } from '../ui/KidButton'
import { Mascot } from '../ui/Mascot'
import { PRIVACY_URL, TERMS_URL } from '../ui/legalLinks'

// The public welcome page parents see before signing in (web only; the
// iPhone/Android apps open straight to sign-in). Everything here is a real
// feature of the app: no invented stats, reviews or awards.

const shape = (s: Partial<ShapeSpec> & Pick<ShapeSpec, 'type' | 'color'>): ContentSpec => ({
  kind: 'shape',
  spec: { size: 'medium', rotation: 0, fill: 'solid', count: 1, inner: 'none', nested: null, ...s },
})
const BLUE = '#4C6FEB'
const GOLD = '#D97706'
const MAGENTA = '#DC267F'

// "Shape gets bigger" — the kind of figure matrix the app asks.
const SAMPLE_GRID: ContentSpec[] = [
  shape({ type: 'triangle', color: BLUE, size: 'small' }),
  shape({ type: 'triangle', color: BLUE, size: 'large' }),
  shape({ type: 'star', color: GOLD, size: 'small' }),
  { kind: 'blank' },
]
const SAMPLE_CHOICES: { content: ContentSpec; correct?: boolean }[] = [
  { content: shape({ type: 'star', color: GOLD, size: 'large' }), correct: true },
  { content: shape({ type: 'star', color: MAGENTA, size: 'large' }) },
  { content: shape({ type: 'star', color: GOLD, size: 'small' }) },
  { content: shape({ type: 'triangle', color: GOLD, size: 'large' }) },
]

const TEST_SAMPLE: Record<TestFamily, ContentSpec> = {
  cogat: { kind: 'paper', region: { x: 0, y: 0, w: 32, h: 64 }, holes: [{ x: 16, y: 20 }], foldLines: ['vertical'] },
  nnat3: {
    kind: 'pattern',
    cells: [
      ['#2563eb', '#facc15'],
      ['#facc15', '#2563eb'],
    ],
  },
  olsat: { kind: 'scene', rows: [['⭐'], ['🌙']] },
}

const STEPS = [
  { icon: '🧒', title: 'Add your child', body: 'Pick their grade and the test their school uses: CogAT, NNAT3 or OLSAT.' },
  { icon: '⏱️', title: 'Practice a little each day', body: "Today's practice is 12 questions, about 10 minutes, picked from the parts that need it most." },
  { icon: '🌱', title: 'Watch them grow', body: 'Stars, streaks and a calm progress view for grown-ups show what to focus on next.' },
]

const FOR_KIDS = [
  'Every question can be read aloud, so pre-readers practice on their own',
  'Instant, friendly feedback that explains the right answer',
  'Stars, streaks and Sprout the mascot keep practice fun',
]
const FOR_PARENTS = [
  'Progress for every part of the test, with suggestions for what to practice next',
  'Full practice tests with the same number of questions as the real test, and its time limits where it has them',
  'Printable worksheets for screen-free practice',
]
const TRUST = [
  { icon: '🚫', text: 'No ads' },
  { icon: '🙈', text: 'No third-party trackers' },
  { icon: '✏️', text: 'First names only' },
  { icon: '🔒', text: 'Grown-ups area behind a parent check' },
  { icon: '📶', text: 'Works offline' },
]

const FAQ: { q: string; a: ReactNode }[] = [
  {
    q: 'Which test will my child take?',
    a: "Schools choose different tests. Ask your child's school which test and level they use. You can pick CogAT, NNAT3 or OLSAT for each child, and change it any time.",
  },
  {
    q: 'How do I get an account?',
    a: 'ThinkSprout is in an invite-only beta right now. If you have an invite code, tap Get started to create a parent account.',
  },
  { q: 'Does it cost anything?', a: 'There is no charge during the beta.' },
  {
    q: "Will practice raise my child's score?",
    a: 'Practice helps children get comfortable with the kinds of questions and the format of test day. Practice scores here are not real test scores, and no practice can promise a result.',
  },
  {
    q: 'What devices does it work on?',
    a: 'Any modern web browser on a tablet, phone or computer. iPhone, iPad and Android apps are in testing.',
  },
  {
    q: "Is my child's information safe?",
    a: (
      <>
        We collect as little as possible: a parent's email, and each child's first name, grade and practice results so
        progress syncs between devices. Read the{' '}
        <a href={PRIVACY_URL} className="font-semibold text-sprout-700 underline">
          privacy policy
        </a>
        .
      </>
    ),
  },
]

/** In-page links scroll instead of using #anchors, which the app's hash router would treat as pages. */
const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      <p className="font-display text-sm font-semibold uppercase tracking-widest text-sprout-600">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">{title}</h2>
      {children && <p className="mt-3 text-slate-600">{children}</p>}
    </div>
  )
}

function Check({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sprout-500 text-sm font-bold text-white">✓</span>
      <span className="text-slate-700">{children}</span>
    </li>
  )
}

/** A static picture of a practice question, drawn with the app's own shapes. */
function SampleQuestion() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div className="rounded-3xl bg-white p-5 shadow-[0_10px_0_var(--color-sprout-200)]">
        <div className="mb-3 flex items-center justify-between">
          <span className="font-display text-sm font-semibold text-slate-500">Figure Matrices · 3 / 8</span>
          <span className="rounded-full bg-sky-400 px-3 py-1 font-display text-xs font-semibold text-white">🔊 Listen</span>
        </div>
        <div className="flex justify-center rounded-2xl bg-sprout-50 p-3">
          <div className="grid grid-cols-2 gap-2">
            {SAMPLE_GRID.map((c, i) => (
              <div key={i} className="flex h-20 w-20 items-center justify-center rounded-2xl border-2 border-sprout-100 bg-white">
                <ContentTile content={c} size="large" />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {SAMPLE_CHOICES.map((c, i) => (
            <div
              key={i}
              className={`flex h-16 items-center justify-center rounded-2xl border-2 ${c.correct ? 'border-sprout-500 bg-sprout-50' : 'border-slate-100 bg-white'}`}
            >
              <div className="scale-75">
                <ContentTile content={c.content} size="large" />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center font-display text-base font-semibold text-sprout-700">✓ Correct! The shape gets bigger.</p>
      </div>
      <span className="absolute -left-3 -top-4 rotate-[-6deg] rounded-full bg-sun-300 px-3 py-1.5 font-display text-sm font-semibold text-ink shadow-sm">
        🔥 5-day streak
      </span>
      <span className="absolute -bottom-4 -right-2 rotate-[5deg] rounded-full bg-white px-3 py-1.5 font-display text-sm font-semibold text-ink shadow-md">
        ⭐⭐⭐ Great job!
      </span>
    </div>
  )
}

export function Landing({ signedIn, onGetStarted, onSignIn }: { signedIn: boolean; onGetStarted: () => void; onSignIn: () => void }) {
  const kinds = ALL_SUBTYPES.map((s) => subtypeInfo(s, 1)!).filter(Boolean)
  const startLabel = signedIn ? 'Open ThinkSprout' : 'Get started'

  return (
    <div className="min-h-screen bg-cream text-ink">
      <header className="sticky top-0 z-20 border-b border-sprout-100 bg-cream/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
          <button className="flex items-center gap-2" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} aria-label="ThinkSprout, back to top">
            <Mascot size={40} />
            <span className="font-display text-xl font-semibold">ThinkSprout</span>
          </button>
          <nav className="hidden items-center gap-6 font-display text-base text-slate-600 md:flex">
            <button onClick={() => scrollTo('tests')}>Tests</button>
            <button onClick={() => scrollTo('how')}>How it works</button>
            <button onClick={() => scrollTo('parents')}>For parents</button>
            <button onClick={() => scrollTo('faq')}>FAQ</button>
          </nav>
          <div className="flex items-center gap-2">
            {!signedIn && (
              <button onClick={onSignIn} className="whitespace-nowrap rounded-xl px-3 py-2 font-display text-base font-semibold text-sprout-700">
                Sign in
              </button>
            )}
            {/* Phones: the hero right below has the big button, so the header keeps just Sign in. */}
            <KidButton className="hidden whitespace-nowrap !px-4 !py-2 !text-base sm:block" onClick={onGetStarted}>
              {startLabel}
            </KidButton>
          </div>
        </div>
      </header>

      <main>
        <section className="overflow-hidden">
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pb-16 pt-10 md:grid-cols-2 md:pt-16">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 font-display text-sm font-semibold text-sprout-700 shadow-sm">
                🌱 Kindergarten – 6th grade
              </p>
              <h1 className="mt-4 font-display text-4xl font-semibold leading-tight sm:text-5xl">
                Gifted test practice that feels like <span className="text-sprout-600">play</span>.
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Short, friendly practice for the CogAT®, NNAT3® and OLSAT®, organized by the parts of each test. A few
                minutes a day helps your child walk in on test day already knowing what to expect.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <KidButton onClick={onGetStarted}>{startLabel}</KidButton>
                <KidButton variant="white" onClick={() => scrollTo('parents')}>
                  For parents
                </KidButton>
              </div>
              {!signedIn && <p className="mt-3 text-sm text-slate-500">Invite-only beta · no charge while in beta</p>}
            </div>
            <SampleQuestion />
          </div>
        </section>

        <section className="border-y border-sprout-100 bg-white">
          <ul className="mx-auto flex max-w-6xl flex-wrap justify-center gap-x-8 gap-y-3 px-4 py-5 font-display text-base font-medium text-slate-600">
            {TRUST.map((t) => (
              <li key={t.text} className="flex items-center gap-2">
                <span aria-hidden="true">{t.icon}</span>
                {t.text}
              </li>
            ))}
          </ul>
        </section>

        <section id="tests" className="scroll-mt-20 px-4 py-16">
          <SectionTitle eyebrow="Three tests" title="Practice for the test your school uses">
            Each child gets the parts, level and practice-test length of their real test.
          </SectionTitle>
          <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {TEST_FAMILIES.map((f) => (
              <div key={f} className="rounded-3xl bg-white p-6 shadow-[0_6px_0_var(--color-sprout-100)]">
                <div className="flex h-20 items-center">
                  <ContentTile content={TEST_SAMPLE[f]} size="large" />
                </div>
                <h3 className="mt-3 font-display text-2xl font-semibold">{FAMILIES[f].name}</h3>
                <p className="text-sm text-slate-500">{FAMILIES[f].fullName}</p>
                <p className="mt-3 text-slate-700">{FAMILIES[f].description}.</p>
              </div>
            ))}
          </div>
        </section>

        <section id="how" className="scroll-mt-20 bg-sprout-50 px-4 py-16">
          <SectionTitle eyebrow="How it works" title="Ten minutes a day, three simple steps" />
          <ol className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={s.title} className="rounded-3xl bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-sun-300 font-display text-lg font-semibold">{i + 1}</span>
                  <span className="text-3xl" aria-hidden="true">
                    {s.icon}
                  </span>
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{s.title}</h3>
                <p className="mt-2 text-slate-600">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div className="flex justify-center">
              <div className="flex flex-col items-center gap-3 rounded-3xl bg-sun-100 px-10 py-8">
                <Mascot mood="cheer" size={150} float />
                <p className="rounded-2xl bg-white px-4 py-2 font-display text-lg font-semibold shadow-sm">"You got 7 out of 8 right!"</p>
              </div>
            </div>
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-sprout-600">For kids</p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Made for little hands and big thinkers</h2>
              <ul className="mt-6 flex flex-col gap-4">
                {FOR_KIDS.map((t) => (
                  <Check key={t}>{t}</Check>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section id="parents" className="scroll-mt-20 bg-white px-4 py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
            <div className="md:order-2">
              <div className="rounded-3xl bg-cream p-6 shadow-sm">
                <p className="font-display text-lg font-semibold">Mia's progress</p>
                {[
                  ['Figure Matrices', 88],
                  ['Paper Folding', 74],
                  ['Number Series', 61],
                  ['Verbal Analogies', 45],
                ].map(([label, pct]) => (
                  <div key={label} className="mt-4">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>{label}</span>
                      <span className="font-semibold">{pct}%</span>
                    </div>
                    <div className="mt-1 h-2.5 rounded-full bg-slate-200">
                      <div
                        className={`h-full rounded-full ${Number(pct) >= 80 ? 'bg-sprout-500' : Number(pct) >= 60 ? 'bg-sun-400' : 'bg-berry-400'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
                <p className="mt-5 rounded-xl bg-sprout-50 p-3 text-sm text-sprout-800">Focus next: Verbal Analogies</p>
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">Example progress view</p>
            </div>
            <div>
              <p className="font-display text-sm font-semibold uppercase tracking-widest text-sprout-600">For parents</p>
              <h2 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Know exactly where to help</h2>
              <ul className="mt-6 flex flex-col gap-4">
                {FOR_PARENTS.map((t) => (
                  <Check key={t}>{t}</Check>
                ))}
              </ul>
              <p className="mt-5 text-sm text-slate-500">
                Practice scores show how many practice questions your child got right. They are not real test scores.
              </p>
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <SectionTitle eyebrow="Question types" title={`${kinds.length} kinds of questions, one friendly app`}>
            From picture analogies for kindergarteners to number matrices for 6th graders.
          </SectionTitle>
          <ul className="mx-auto flex max-w-5xl flex-wrap justify-center gap-2.5">
            {kinds.map((k) => (
              <li key={k.subType} className="flex items-center gap-2 rounded-full bg-white px-4 py-2 font-display text-base shadow-sm">
                <span aria-hidden="true">{k.icon}</span>
                {k.label}
              </li>
            ))}
          </ul>
        </section>

        <section id="faq" className="scroll-mt-20 bg-sprout-50 px-4 py-16">
          <SectionTitle eyebrow="Questions" title="Good questions from grown-ups" />
          <div className="mx-auto flex max-w-3xl flex-col gap-3">
            {FAQ.map((f) => (
              <details key={f.q} className="group rounded-2xl bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-semibold">
                  {f.q}
                  <span className="text-sprout-600 transition-transform group-open:rotate-45" aria-hidden="true">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="px-4 py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-[2rem] bg-sprout-500 px-6 py-12 text-center text-white shadow-[0_10px_0_var(--color-sprout-700)]">
            <Mascot mood="cheer" size={110} float />
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Ready to grow some big thinking?</h2>
            <p className="max-w-md text-sprout-50">Set up your child in a minute and start today's practice.</p>
            <KidButton variant="sun" onClick={onGetStarted}>
              {startLabel}
            </KidButton>
          </div>
        </section>
      </main>

      <footer className="border-t border-sprout-100 px-4 py-8 text-center text-sm text-slate-500">
        <p>
          <a href={PRIVACY_URL} className="underline">
            Privacy
          </a>{' '}
          ·{' '}
          <a href={TERMS_URL} className="underline">
            Terms
          </a>{' '}
          · An{' '}
          <a href="https://astrala.us" className="underline">
            Astrala
          </a>{' '}
          app
        </p>
        <p className="mx-auto mt-3 max-w-2xl text-xs text-slate-400">
          ThinkSprout offers original practice questions and is not affiliated with, endorsed by, or sponsored by Riverside
          Insights or Pearson. CogAT® is a registered trademark of Riverside Assessments, LLC. NNAT® and OLSAT® are
          trademarks of Pearson Education, Inc. or its affiliates.
        </p>
      </footer>
    </div>
  )
}
