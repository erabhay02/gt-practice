import { mulberry32, pickOne, randomSeed, shuffle, type RngFn } from './rng'
import type { ContentSpec, Difficulty, Question } from '../types'

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

function analogyRule(rng: RngFn, difficulty: Difficulty): Rule {
  const options: Rule[] = []
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

export function generateNumberAnalogyQuestion(difficulty: Difficulty, seed: number = randomSeed()): Question {
  const rng = mulberry32(seed)
  const [objTop, objBottom] = shuffle(rng, OBJECTS).slice(0, 2)
  const ok = (n: number) => Number.isInteger(n) && n >= 1 && n <= 10

  let rule = analogyRule(rng, difficulty)
  let a = 0, b = 0, c = 0, d = 0
  for (let i = 0; i < 500; i++) {
    rule = analogyRule(rng, difficulty)
    a = between(rng, 1, 9)
    c = between(rng, 1, 9)
    b = rule.apply(a)
    d = rule.apply(c)
    if (ok(b) && ok(d) && a !== c && b !== d && a !== b) break
  }

  // Typical slips: no change, copying the top-right count, changing the wrong way.
  const wrong = pickWrongValues(rng, d, [c, b, rule.inverse(c)], 1, 10)

  return {
    id: `number-analogy-${difficulty}-${seed}`,
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

export function generateNumberSeriesQuestion(difficulty: Difficulty, seed: number = randomSeed()): Question {
  const rng = mulberry32(seed)
  let series: number[] = []
  for (let i = 0; i < 500; i++) {
    series = seriesPattern(rng, difficulty)
    if (series.length === SERIES_LENGTH && series.every((v) => v >= 0 && v <= ABACUS_MAX)) break
  }

  const shown = series.slice(0, -1)
  const answer = series[series.length - 1]
  const last = shown[shown.length - 1]
  const prevStep = last - shown[shown.length - 2]
  const wrong = pickWrongValues(rng, answer, [last, last + prevStep], 0, ABACUS_MAX)

  return {
    id: `number-series-${difficulty}-${seed}`,
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

function pictureEquation(rng: RngFn, difficulty: Difficulty, seed: number): Question {
  const obj = pickOne(rng, OBJECTS)
  const subtract = rng() < 0.4
  const a = between(rng, 1, 5)
  const b = between(rng, 1, 5)
  const total = a + b

  const visual = subtract
    ? [group(obj, total), text('−'), blank, text('='), group(obj, a)]
    : [group(obj, a), text('+'), blank, text('='), group(obj, total)]
  const wrong = pickWrongValues(rng, b, [total, a], 1, 10)

  return {
    id: `number-puzzle-${difficulty}-${seed}`,
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

export function generateNumberPuzzleQuestion(difficulty: Difficulty, seed: number = randomSeed()): Question {
  const rng = mulberry32(seed)
  return difficulty === 1 ? pictureEquation(rng, difficulty, seed) : numberEquation(rng, difficulty, seed)
}
