import { generatedId, mulberry32, pickOne, randomSeed, shuffle, type RngFn } from './rng'
import type { ContentSpec, Difficulty, Grade, Question } from '../types'

const OBJECTS = ['🍎', '⭐', '🐟', '🌸', '⚽', '🍪', '🐞', '🎈', '🍓', '🦆', '🍃', '🚗']

const text = (value: string | number): ContentSpec => ({ kind: 'text', value: String(value) })
const blank: ContentSpec = { kind: 'blank' }
const group = (emoji: string, count: number): ContentSpec => ({ kind: 'group', emoji, count })

function between(rng: RngFn, lo: number, hi: number): number {
  return lo + Math.floor(rng() * (hi - lo + 1))
}

/** Correct value plus up to 3 distinct wrong values, all within [min, max]. */
function pickWrongValues(rng: RngFn, correct: number, preferred: number[], min: number, max: number): number[] {
  const wrong: number[] = []
  const add = (v: number) => {
    if (Number.isInteger(v) && v >= min && v <= max && v !== correct && !wrong.includes(v)) wrong.push(v)
  }
  preferred.forEach(add)
  for (const delta of shuffle(rng, [1, -1, 2, -2, 3, -3, 4, -4])) add(correct + delta)
  return wrong.slice(0, 3)
}

function toChoices<T>(rng: RngFn, correct: T, wrong: T[], render: (v: T) => ContentSpec) {
  return shuffle(rng, [
    { v: correct, isCorrect: true },
    ...wrong.map((v) => ({ v, isCorrect: false })),
  ]).map((o, i) => ({ id: `c${i}`, content: render(o.v), isCorrect: o.isCorrect }))
}

// ---------- Number Analogies (pictures of quantities) ----------

type Rule = { apply: (n: number) => number; inverse: (n: number) => number }

// 1st grade counts stay small enough to count at a glance.
const GRADE1_MAX = 8

function analogyRule(rng: RngFn, difficulty: Difficulty, grade: Grade = 2): Rule {
  const options: Rule[] = []
  if (grade === 1) {
    // Only "add or take away 1-3"; no doubling or halving.
    for (let k = 1; k <= difficulty; k++) {
      options.push({ apply: (n) => n + k, inverse: (n) => n - k })
      options.push({ apply: (n) => n - k, inverse: (n) => n + k })
    }
    return pickOne(rng, options)
  }
  const maxK = difficulty === 1 ? 2 : difficulty === 2 ? 3 : 4
  for (let k = 1; k <= maxK; k++) {
    options.push({ apply: (n) => n + k, inverse: (n) => n - k })
    options.push({ apply: (n) => n - k, inverse: (n) => n + k })
  }
  if (difficulty >= 2) {
    options.push({ apply: (n) => n * 2, inverse: (n) => n / 2 })
  }
  if (difficulty === 3) {
    options.push({ apply: (n) => n / 2, inverse: (n) => n * 2 })
  }
  return pickOne(rng, options)
}

export function generateNumberAnalogyQuestion(
  difficulty: Difficulty,
  seed: number = randomSeed(),
  grade: Grade = 2,
): Question {
  if (grade === 0) return kindergartenAnalogy(difficulty, seed)
  if (grade >= 3) return numericAnalogy(difficulty, seed, grade)
  const rng = mulberry32(seed)
  const [objTop, objBottom] = shuffle(rng, OBJECTS).slice(0, 2)
  const max = grade === 1 ? GRADE1_MAX : 10
  const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= max

  let rule = analogyRule(rng, difficulty, grade)
  let a = 0, b = 0, c = 0, d = 0
  for (let i = 0; i < 500; i++) {
    rule = analogyRule(rng, difficulty, grade)
    a = between(rng, 1, max - 1)
    c = between(rng, 1, max - 1)
    b = rule.apply(a)
    d = rule.apply(c)
    if (ok(b) && ok(d) && a !== c && b !== d && a !== b) break
  }

  // Typical slips: no change, copying the top-right count, changing the wrong way.
  const wrong = pickWrongValues(rng, d, [c, b, rule.inverse(c)], 1, max)

  return {
    id: grade === 1 ? `number-analogy-g1-${difficulty}-${seed}` : `number-analogy-${difficulty}-${seed}`,
    domain: 'quantitative',
    subType: 'number-analogy',
    difficulty,
    promptAudioText:
      'Look at the top row. The pictures change in some way. The bottom row should change the same way. Which picture goes where the question mark is?',
    promptVisual: [
      [group(objTop, a), group(objTop, b)],
      [group(objBottom, c), blank],
    ],
    choices: toChoices(rng, d, wrong, (n) => group(objBottom, n)),
    source: 'generated',
    generatorSeed: seed,
  }
}

// ---------- Number Series (abacus) ----------

const ABACUS_MAX = 10
const SERIES_LENGTH = 7

function seriesPattern(rng: RngFn, difficulty: Difficulty): number[] {
  const kinds =
    difficulty === 1
      ? ['step', 'repeat2']
      : difficulty === 2
        ? ['step', 'repeat3', 'alternate']
        : ['upUp', 'alternate', 'doubles', 'repeat3']
  const kind = pickOne(rng, kinds)

  switch (kind) {
    case 'step': {
      const step = pickOne(rng, difficulty === 1 ? [1, -1, 2] : [2, -2, 3, -1])
      const start = between(rng, 0, ABACUS_MAX)
      return Array.from({ length: SERIES_LENGTH }, (_, i) => start + step * i)
    }
    case 'repeat2': {
      const [x, y] = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 2)
      return Array.from({ length: SERIES_LENGTH }, (_, i) => (i % 2 === 0 ? x : y))
    }
    case 'repeat3': {
      const vals = shuffle(rng, [1, 2, 3, 4, 5, 6, 7, 8]).slice(0, 3)
      return Array.from({ length: SERIES_LENGTH }, (_, i) => vals[i % 3])
    }
    case 'alternate': {
      // e.g. +2, -1, +2, -1 ...
      const up = pickOne(rng, [2, 3])
      const down = pickOne(rng, [1, 2].filter((v) => v < up))
      const start = between(rng, 0, 3)
      const out = [start]
      for (let i = 1; i < SERIES_LENGTH; i++) out.push(out[i - 1] + (i % 2 === 1 ? up : -down))
      return out
    }
    case 'upUp': {
      // e.g. 0, 1, 3, 4, 6, 7, 9 (adds 1, then 2, then 1, then 2 ...)
      const [first, second] = shuffle(rng, [1, 2])
      const start = between(rng, 0, 1)
      const out = [start]
      for (let i = 1; i < SERIES_LENGTH; i++) out.push(out[i - 1] + (i % 2 === 1 ? first : second))
      return out
    }
    case 'doubles': {
      // e.g. 1, 1, 2, 2, 3, 3, 4
      const start = between(rng, 1, 4)
      return Array.from({ length: SERIES_LENGTH }, (_, i) => start + Math.floor(i / 2))
    }
  }
  return []
}

// 1st grade: count up/down by 1 (or 2 on harder items), simple repeats.
function seriesPatternGrade1(rng: RngFn, difficulty: Difficulty): number[] {
  const kind = pickOne(rng, difficulty === 1 ? ['step', 'repeat2'] : difficulty === 2 ? ['step', 'repeat2', 'repeat3'] : ['step', 'repeat3', 'doubles'])
  switch (kind) {
    case 'step': {
      const step = pickOne(rng, difficulty === 1 ? [1, -1] : [1, -1, 2])
      const start = between(rng, 0, GRADE1_MAX)
      return Array.from({ length: SERIES_LENGTH }, (_, i) => start + step * i)
    }
    case 'repeat2': {
      const [x, y] = shuffle(rng, [1, 2, 3, 4, 5, 6]).slice(0, 2)
      return Array.from({ length: SERIES_LENGTH }, (_, i) => (i % 2 === 0 ? x : y))
    }
    case 'repeat3': {
      const vals = shuffle(rng, [1, 2, 3, 4, 5, 6]).slice(0, 3)
      return Array.from({ length: SERIES_LENGTH }, (_, i) => vals[i % 3])
    }
    default: {
      const start = between(rng, 1, 4)
      return Array.from({ length: SERIES_LENGTH }, (_, i) => start + Math.floor(i / 2))
    }
  }
}

export function generateNumberSeriesQuestion(
  difficulty: Difficulty,
  seed: number = randomSeed(),
  grade: Grade = 2,
): Question {
  if (grade === 0) return kindergartenSeries(difficulty, seed)
  if (grade >= 3) return numericSeries(difficulty, seed, grade)
  const rng = mulberry32(seed)
  const max = grade === 1 ? GRADE1_MAX : ABACUS_MAX
  let series: number[] = []
  for (let i = 0; i < 500; i++) {
    series = grade === 1 ? seriesPatternGrade1(rng, difficulty) : seriesPattern(rng, difficulty)
    if (series.length === SERIES_LENGTH && series.every((v) => v >= 0 && v <= max)) break
  }

  const shown = series.slice(0, -1)
  const answer = series[series.length - 1]
  const last = shown[shown.length - 1]
  const prevStep = last - shown[shown.length - 2]
  const wrong = pickWrongValues(rng, answer, [last, last + prevStep], 0, max)

  return {
    id: grade === 1 ? `number-series-g1-${difficulty}-${seed}` : `number-series-${difficulty}-${seed}`,
    domain: 'quantitative',
    subType: 'number-series',
    difficulty,
    promptAudioText:
      'The beads on this abacus follow a pattern. How many beads should go on the last rod, where the question mark is?',
    promptVisual: [[{ kind: 'abacus', counts: [...shown, null] }]],
    choices: toChoices(rng, answer, wrong, (n) => ({ kind: 'abacus', counts: [n] })),
    source: 'generated',
    generatorSeed: seed,
  }
}

// ---------- Number Puzzles (missing number) ----------

function pictureEquation(rng: RngFn, difficulty: Difficulty, seed: number, grade: Grade = 2): Question {
  const obj = pickOne(rng, OBJECTS)
  // 1st grade: adding only on the easiest items, and totals of at most 8.
  const subtract = rng() < 0.4 && !(grade === 1 && difficulty === 1)
  const part = grade === 1 ? GRADE1_MAX / 2 : 5
  const a = between(rng, 1, part)
  const b = between(rng, 1, part)
  const total = a + b

  const visual = subtract
    ? [group(obj, total), text('−'), blank, text('='), group(obj, a)]
    : [group(obj, a), text('+'), blank, text('='), group(obj, total)]
  const wrong = pickWrongValues(rng, b, [total, a], 1, grade === 1 ? GRADE1_MAX : 10)

  return {
    id: grade === 1 ? `number-puzzle-g1-${difficulty}-${seed}` : `number-puzzle-${difficulty}-${seed}`,
    domain: 'quantitative',
    subType: 'number-puzzle',
    difficulty,
    promptAudioText: subtract
      ? 'Some were taken away. How many should go where the question mark is to make both sides the same?'
      : 'How many should go where the question mark is to make both sides the same?',
    promptVisual: [visual],
    choices: toChoices(rng, b, wrong, (n) => group(obj, n)),
    source: 'generated',
    generatorSeed: seed,
  }
}

function numberEquation(rng: RngFn, difficulty: Difficulty, seed: number): Question {
  let visual: ContentSpec[][] = []
  let answer = 0
  let preferred: number[] = []
  let audio = 'What number goes where the question mark is, so that both sides are equal?'

  const form = pickOne(rng, difficulty === 2 ? ['missingAddend', 'missingSubtrahend', 'missingStart'] : ['twoSided', 'twoSidedMinus', 'symbol'])
  const a = between(rng, 2, 9)
  const b = between(rng, 1, 9)

  switch (form) {
    case 'missingAddend': // a + ? = a+b
      answer = b
      preferred = [a + b + a, a]
      visual = [[text(a), text('+'), blank, text('='), text(a + b)]]
      break
    case 'missingSubtrahend': // a+b − ? = a
      answer = b
      preferred = [a + b + a, a]
      visual = [[text(a + b), text('−'), blank, text('='), text(a)]]
      break
    case 'missingStart': // ? − b = a
      answer = a + b
      preferred = [a - b, a]
      visual = [[blank, text('−'), text(b), text('='), text(a)]]
      break
    case 'twoSided': {
      // a + b = ? + c
      const c = between(rng, 1, a + b - 1)
      answer = a + b - c
      preferred = [a + b + c, a + b]
      visual = [[text(a), text('+'), text(b), text('='), blank, text('+'), text(c)]]
      break
    }
    case 'twoSidedMinus': {
      // a + b = ? − c
      const c = between(rng, 1, 6)
      answer = a + b + c
      preferred = [a + b - c, a + b]
      visual = [[text(a), text('+'), text(b), text('='), blank, text('−'), text(c)]]
      break
    }
    case 'symbol': {
      // ▲ = a ; ? = ▲ + b
      const symbol: ContentSpec = { kind: 'shape', spec: { type: 'triangle', color: '#3b82f6', size: 'small', rotation: 0, fill: 'solid' } }
      answer = a + b
      preferred = [a, b, a * 2]
      visual = [
        [symbol, text('='), text(a)],
        [blank, text('='), symbol, text('+'), text(b)],
      ]
      audio = 'The triangle stands for a number. What number goes where the question mark is?'
      break
    }
  }

  const wrong = pickWrongValues(rng, answer, preferred, 0, 30)
  return {
    id: `number-puzzle-${difficulty}-${seed}`,
    domain: 'quantitative',
    subType: 'number-puzzle',
    difficulty,
    promptAudioText: audio,
    promptVisual: visual,
    choices: toChoices(rng, answer, wrong, text),
    source: 'generated',
    generatorSeed: seed,
  }
}

export function generateNumberPuzzleQuestion(
  difficulty: Difficulty,
  seed: number = randomSeed(),
  grade: Grade = 2,
): Question {
  if (grade === 0) return kindergartenPuzzle(difficulty, seed)
  if (grade >= 3) return numericPuzzle(difficulty, seed, grade)
  const rng = mulberry32(seed)
  // 1st grade (Level 7) number puzzles are picture-based throughout.
  if (grade === 1) return pictureEquation(rng, difficulty, seed, 1)
  return difficulty === 1 ? pictureEquation(rng, difficulty, seed) : numberEquation(rng, difficulty, seed)
}

// ---------- Kindergarten (CogAT Level 5/6): pictures, amounts up to 5 ----------

const K_MAX = 5

function kindergartenAnalogy(difficulty: Difficulty, seed: number): Question {
  const rng = mulberry32(seed)
  const [objTop, objBottom] = shuffle(rng, OBJECTS).slice(0, 2)
  // One more or one less; two more/less only on the hardest items.
  const k = difficulty === 3 ? pickOne(rng, [1, 2]) : 1
  const step = rng() < 0.5 ? k : -k
  const ok = (n: number) => n >= 1 && n <= K_MAX
  let a = 1, c = 2
  for (let i = 0; i < 200; i++) {
    a = between(rng, 1, K_MAX)
    c = between(rng, 1, K_MAX)
    if (a !== c && ok(a + step) && ok(c + step)) break
  }
  const b = a + step
  const d = c + step
  const wrong = pickWrongValues(rng, d, [c, b, c - step], 1, K_MAX)
  return {
    id: generatedId('number-analogy', 0, difficulty, seed),
    domain: 'quantitative',
    subType: 'number-analogy',
    difficulty,
    promptAudioText:
      'Look at the top row. The pictures change in some way. The bottom row should change the same way. Which picture goes where the question mark is?',
    promptVisual: [
      [group(objTop, a), group(objTop, b)],
      [group(objBottom, c), blank],
    ],
    choices: toChoices(rng, d, wrong, (n) => group(objBottom, n)),
    source: 'generated',
    generatorSeed: seed,
  }
}

function kindergartenSeries(difficulty: Difficulty, seed: number): Question {
  const rng = mulberry32(seed)
  const max = 6
  let series: number[] = []
  for (let i = 0; i < 200; i++) {
    const kind = pickOne(rng, difficulty === 1 ? ['up', 'repeat2'] : difficulty === 2 ? ['up', 'down', 'repeat2'] : ['up', 'down', 'repeat2', 'repeat3'])
    if (kind === 'up' || kind === 'down') {
      const start = kind === 'up' ? between(rng, 0, 1) : between(rng, 5, max)
      series = Array.from({ length: SERIES_LENGTH }, (_, j) => start + (kind === 'up' ? j : -j))
    } else {
      const vals = shuffle(rng, [1, 2, 3, 4, 5]).slice(0, kind === 'repeat2' ? 2 : 3)
      series = Array.from({ length: SERIES_LENGTH }, (_, j) => vals[j % vals.length])
    }
    if (series.every((v) => v >= 0 && v <= max)) break
  }
  const shown = series.slice(0, -1)
  const answer = series[series.length - 1]
  const last = shown[shown.length - 1]
  const wrong = pickWrongValues(rng, answer, [last, last + (last - shown[shown.length - 2])], 0, max)
  return {
    id: generatedId('number-series', 0, difficulty, seed),
    domain: 'quantitative',
    subType: 'number-series',
    difficulty,
    promptAudioText:
      'The beads on this abacus follow a pattern. How many beads should go on the last rod, where the question mark is?',
    promptVisual: [[{ kind: 'abacus', counts: [...shown, null] }]],
    choices: toChoices(rng, answer, wrong, (n) => ({ kind: 'abacus', counts: [n] })),
    source: 'generated',
    generatorSeed: seed,
  }
}

function kindergartenPuzzle(difficulty: Difficulty, seed: number): Question {
  const rng = mulberry32(seed)
  const obj = pickOne(rng, OBJECTS)
  // Putting together first; taking away only on the hardest items.
  const subtract = difficulty === 3 && rng() < 0.5
  const a = between(rng, 1, 3)
  const b = between(rng, 1, K_MAX - a)
  const total = a + b
  const visual = subtract
    ? [group(obj, total), text('−'), blank, text('='), group(obj, a)]
    : [group(obj, a), text('+'), blank, text('='), group(obj, total)]
  const wrong = pickWrongValues(rng, b, [total, a], 1, K_MAX + 1)
  return {
    id: generatedId('number-puzzle', 0, difficulty, seed),
    domain: 'quantitative',
    subType: 'number-puzzle',
    difficulty,
    promptAudioText: subtract
      ? 'Some were taken away. How many should go where the question mark is to make both sides the same?'
      : 'How many should go where the question mark is to make both sides the same?',
    promptVisual: [visual],
    choices: toChoices(rng, b, wrong, (n) => group(obj, n)),
    source: 'generated',
    generatorSeed: seed,
  }
}

// ---------- Grades 3–4 (CogAT Levels 9–10): written numbers ----------

type NumRule = { apply: (n: number) => number; name: string }

function numericRule(rng: RngFn, difficulty: Difficulty, grade: Grade): NumRule {
  const add = (k: number): NumRule => ({ apply: (n) => n + k, name: `+${k}` })
  const sub = (k: number): NumRule => ({ apply: (n) => n - k, name: `-${k}` })
  const mul = (k: number): NumRule => ({ apply: (n) => n * k, name: `x${k}` })
  const div = (k: number): NumRule => ({ apply: (n) => n / k, name: `/${k}` })
  if (grade === 3) {
    if (difficulty === 1) return pickOne(rng, [add(between(rng, 2, 9)), sub(between(rng, 2, 9))])
    if (difficulty === 2) return pickOne(rng, [mul(2), mul(3), mul(5), mul(10), add(between(rng, 10, 20)), sub(between(rng, 10, 20))])
    return pickOne(rng, [div(2), div(3), div(5), mul(4), sub(between(rng, 11, 25))])
  }
  if (difficulty === 1) return pickOne(rng, [add(between(rng, 5, 15)), sub(between(rng, 5, 15)), mul(between(rng, 2, 5))])
  if (difficulty === 2) return pickOne(rng, [mul(between(rng, 3, 9)), div(between(rng, 2, 9))])
  // Two steps, e.g. double it then add one.
  const first = pickOne(rng, [2, 3])
  const then = pickOne(rng, [-2, -1, 1, 2, 3])
  return { apply: (n) => n * first + then, name: `x${first}${then > 0 ? '+' : ''}${then}` }
}

function numericAnalogy(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const rng = mulberry32(seed)
  const max = grade === 3 ? 100 : 150
  let rule = numericRule(rng, difficulty, grade)
  let inputs: number[] = []
  for (let i = 0; i < 500; i++) {
    rule = numericRule(rng, difficulty, grade)
    inputs = [between(rng, 2, 30), between(rng, 2, 30), between(rng, 2, 30)]
    const outs = inputs.map(rule.apply)
    const fine = outs.every((o) => Number.isInteger(o) && o >= 0 && o <= max)
    if (fine && new Set(inputs).size === 3 && inputs.every((n, j) => n !== outs[j])) break
  }
  const [a, c, e] = inputs
  const [b, d, answer] = inputs.map(rule.apply)
  // Typical slips: using the first pair's difference as an add-on, copying
  // the number, or being one off.
  const wrong = pickWrongValues(rng, answer, [e + (b - a), e + (d - c), e, answer + 10, answer - 10], 0, max * 2)
  const pairRow = (x: number, y: number | null): ContentSpec[] => [text(x), text('→'), y === null ? blank : text(y)]
  return {
    id: generatedId('number-analogy', grade, difficulty, seed),
    domain: 'quantitative',
    subType: 'number-analogy',
    difficulty,
    promptAudioText: 'Each pair of numbers follows the same rule. Which number goes where the question mark is?',
    promptVisual: [pairRow(a, b), pairRow(c, d), pairRow(e, null)],
    choices: toChoices(rng, answer, wrong, text),
    source: 'generated',
    generatorSeed: seed,
  }
}

const NUMERIC_SERIES_SHOWN = 7

function numericSeriesPattern(rng: RngFn, difficulty: Difficulty, grade: Grade): number[] {
  const n = NUMERIC_SERIES_SHOWN + 1
  const kinds =
    grade === 3
      ? difficulty === 1 ? ['step'] : difficulty === 2 ? ['alternate', 'growing', 'twoSeries'] : ['growing', 'staircase', 'double']
      : difficulty === 1 ? ['step', 'alternate'] : difficulty === 2 ? ['growing', 'twoSeries', 'double'] : ['staircase', 'triple', 'doublingSteps', 'sumOfTwo']
  const kind = pickOne(rng, kinds)
  switch (kind) {
    case 'step': {
      const step = pickOne(rng, grade === 3 ? [2, 3, 4, 5, 10, -2, -3, -5] : [6, 7, 8, 9, 11, 12, -4, -6, -7])
      const start = step > 0 ? between(rng, 1, 20) : between(rng, 60, 90)
      return Array.from({ length: n }, (_, i) => start + step * i)
    }
    case 'alternate': {
      // e.g. +5, -2, +5, -2 ...
      const up = between(rng, 3, 8)
      const down = between(rng, 1, up - 1)
      const out = [between(rng, 1, 15)]
      for (let i = 1; i < n; i++) out.push(out[i - 1] + (i % 2 === 1 ? up : -down))
      return out
    }
    case 'growing': {
      // Adds 1, then 2, then 3 ...
      const first = between(rng, 1, 2)
      const out = [between(rng, 1, 10)]
      for (let i = 1; i < n; i++) out.push(out[i - 1] + first + i - 1)
      return out
    }
    case 'twoSeries': {
      // Two patterns woven together: 2, 20, 4, 19, 6, 18 ...
      const a0 = between(rng, 1, 10)
      const b0 = between(rng, 20, 40)
      const sa = between(rng, 2, 5)
      const sb = -between(rng, 1, 3)
      return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? a0 + sa * (i / 2) : b0 + sb * ((i - 1) / 2)))
    }
    case 'staircase': {
      // 1, 2, 3, 2, 3, 4, 3, 4 ...: counts up three, then starts one higher.
      const start = between(rng, 1, 10)
      return Array.from({ length: n }, (_, i) => start + Math.floor(i / 3) + (i % 3))
    }
    case 'double': {
      const start = between(rng, 1, 3)
      return Array.from({ length: n }, (_, i) => start * 2 ** i)
    }
    case 'triple': {
      // x3, then -1 ... keeps numbers small enough: 2, 6, 5, 15, 14, 42 ...
      const start = between(rng, 1, 3)
      const out = [start]
      for (let i = 1; i < n; i++) out.push(i % 2 === 1 ? out[i - 1] * 3 : out[i - 1] - 1)
      return out
    }
    case 'doublingSteps': {
      // Adds 1, 2, 4, 8 ...
      const out = [between(rng, 1, 10)]
      for (let i = 1; i < n; i++) out.push(out[i - 1] + 2 ** (i - 1))
      return out
    }
    default: {
      // Each number is the sum of the two before it.
      const out = [between(rng, 1, 3), between(rng, 1, 4)]
      for (let i = 2; i < n; i++) out.push(out[i - 1] + out[i - 2])
      return out
    }
  }
}

function numericSeries(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const rng = mulberry32(seed)
  const limit = grade === 3 ? 200 : 400
  let series: number[] = []
  for (let i = 0; i < 500; i++) {
    series = numericSeriesPattern(rng, difficulty, grade)
    if (series.every((v) => Number.isInteger(v) && v >= 0 && v <= limit)) break
  }
  const shown = series.slice(0, -1)
  const answer = series[series.length - 1]
  const last = shown[shown.length - 1]
  const lastStep = last - shown[shown.length - 2]
  const firstStep = shown[1] - shown[0]
  const wrong = pickWrongValues(rng, answer, [last + lastStep, last + firstStep, last - lastStep, answer + 2, answer - 1], 0, limit * 2)
  return {
    id: generatedId('number-series', grade, difficulty, seed),
    domain: 'quantitative',
    subType: 'number-series',
    difficulty,
    promptAudioText: 'The numbers follow a pattern. Which number comes next?',
    promptVisual: [[...shown.map(text), blank]],
    choices: toChoices(rng, answer, wrong, text),
    source: 'generated',
    generatorSeed: seed,
  }
}

function numericPuzzle(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const rng = mulberry32(seed)
  const triangle: ContentSpec = { kind: 'shape', spec: { type: 'triangle', color: '#3b82f6', size: 'small', rotation: 0, fill: 'solid' } }
  const square: ContentSpec = { kind: 'shape', spec: { type: 'square', color: '#ef4444', size: 'small', rotation: 0, fill: 'solid' } }
  let visual: ContentSpec[][] = []
  let answer = 0
  let preferred: number[] = []
  let audio = 'What number goes where the question mark is, so that both sides are equal?'

  const forms =
    grade === 3
      ? difficulty === 1 ? ['missingAddend', 'missingStart'] : difficulty === 2 ? ['twoSided', 'twoSidedMinus'] : ['symbol', 'twoSided']
      : difficulty === 1 ? ['missingFactor', 'missingDividend'] : difficulty === 2 ? ['productEqualsSum', 'twoSidedMinus'] : ['twoSymbols', 'doubleSymbol']
  const form = pickOne(rng, forms)
  const big = grade === 3 ? 20 : 50

  switch (form) {
    case 'missingAddend': { // a + ? = c
      const a = between(rng, 5, big)
      answer = between(rng, 3, big)
      preferred = [a + answer + a, a]
      visual = [[text(a), text('+'), blank, text('='), text(a + answer)]]
      break
    }
    case 'missingStart': { // ? − b = a
      const a = between(rng, 5, big)
      const b = between(rng, 3, 15)
      answer = a + b
      preferred = [a - b, a]
      visual = [[blank, text('−'), text(b), text('='), text(a)]]
      break
    }
    case 'twoSided': { // a + b = ? + c
      const a = between(rng, 5, big)
      const b = between(rng, 3, big)
      const c = between(rng, 1, a + b - 1)
      answer = a + b - c
      preferred = [a + b + c, a + b]
      visual = [[text(a), text('+'), text(b), text('='), blank, text('+'), text(c)]]
      break
    }
    case 'twoSidedMinus': { // a + b = ? − c
      const a = between(rng, 5, big)
      const b = between(rng, 3, big)
      const c = between(rng, 2, 12)
      answer = a + b + c
      preferred = [a + b - c, a + b]
      visual = [[text(a), text('+'), text(b), text('='), blank, text('−'), text(c)]]
      break
    }
    case 'symbol': { // ▲ = a ; ? = ▲ + b
      const a = between(rng, 5, 15)
      const b = between(rng, 2, 12)
      answer = a + b
      preferred = [a, b, a * 2]
      visual = [
        [triangle, text('='), text(a)],
        [blank, text('='), triangle, text('+'), text(b)],
      ]
      audio = 'The triangle stands for a number. What number goes where the question mark is?'
      break
    }
    case 'missingFactor': { // a × ? = c
      const a = between(rng, 2, 9)
      answer = between(rng, 2, 9)
      preferred = [a * answer - a, a + answer, answer + 1]
      visual = [[text(a), text('×'), blank, text('='), text(a * answer)]]
      break
    }
    case 'missingDividend': { // ? ÷ b = a
      const a = between(rng, 2, 9)
      const b = between(rng, 2, 9)
      answer = a * b
      preferred = [a + b, a, answer + b]
      visual = [[blank, text('÷'), text(b), text('='), text(a)]]
      break
    }
    case 'productEqualsSum': { // a × b = ? + c
      const a = between(rng, 2, 9)
      const b = between(rng, 2, 9)
      const c = between(rng, 1, a * b - 1)
      answer = a * b - c
      preferred = [a * b + c, a * b, a + b]
      visual = [[text(a), text('×'), text(b), text('='), blank, text('+'), text(c)]]
      break
    }
    case 'twoSymbols': { // ▲ = a ; ■ = ▲ × b ; ? = ■ − c
      const a = between(rng, 2, 6)
      const b = between(rng, 2, 5)
      const c = between(rng, 1, a * b - 1)
      answer = a * b - c
      preferred = [a * b, a - c, a * b + c]
      visual = [
        [triangle, text('='), text(a)],
        [square, text('='), triangle, text('×'), text(b)],
        [blank, text('='), square, text('−'), text(c)],
      ]
      audio = 'Each shape stands for a number. What number goes where the question mark is?'
      break
    }
    default: { // ▲ + ▲ = n ; ? = ▲ + b
      const t = between(rng, 3, 15)
      const b = between(rng, 2, 10)
      answer = t + b
      preferred = [t * 2 + b, t * 2, t]
      visual = [
        [triangle, text('+'), triangle, text('='), text(t * 2)],
        [blank, text('='), triangle, text('+'), text(b)],
      ]
      audio = 'Each shape stands for a number. What number goes where the question mark is?'
    }
  }

  const wrong = pickWrongValues(rng, answer, preferred, 0, 200)
  return {
    id: generatedId('number-puzzle', grade, difficulty, seed),
    domain: 'quantitative',
    subType: 'number-puzzle',
    difficulty,
    promptAudioText: audio,
    promptVisual: visual,
    choices: toChoices(rng, answer, wrong, text),
    source: 'generated',
    generatorSeed: seed,
  }
}
