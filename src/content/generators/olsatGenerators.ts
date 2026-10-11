// OLSAT-style generated items (Otis-Lennon School Ability Test): Figural
// Series, Number Matrix, and written Arithmetic Reasoning word problems for
// readers (grades 3+). OLSAT's picture, figure-analogy and number parts reuse
// the CogAT generators; its listening items are authored banks.
import { figuralDifficulty } from './nnatGenerators'
import { between, pickWrongValues, toChoices } from './numberGenerators'
import { generatedId, mulberry32, pickN, pickOne, shuffle, type RngFn } from './rng'
import { BASIC_FILLS, COLORS, shapesLookAlike } from './shapePalette'
import type { ContentSpec, Difficulty, Grade, Question, ShapeRotation, ShapeSpec, ShapeType } from '../types'

const shape = (spec: ShapeSpec): ContentSpec => ({ kind: 'shape', spec })
const text = (value: string | number): ContentSpec => ({ kind: 'text', value: String(value) })
const word = (value: string | number): ContentSpec => ({ kind: 'word', value: String(value) })

// ---------- Figural Series ----------

const SERIES_SHOWN = 4
const SERIES_TYPES: ShapeType[] = ['triangle', 'star', 'square', 'circle', 'pentagon', 'hexagon']

// Series cells are small boxes in one phone-width row, so shapes stay small/medium.
function plain(type: ShapeType, color: string): ShapeSpec {
  return { type, color, size: 'medium', rotation: 0, fill: 'solid', count: 1, inner: 'none', nested: null }
}

const turn = (deg: number): ShapeRotation => ((((deg % 360) + 360) % 360) as ShapeRotation)

/** Five steps of a sequence (four shown, the fifth is the answer) plus traps. */
function seriesSteps(rng: RngFn, d: Difficulty): { steps: ShapeSpec[]; traps: ShapeSpec[] } {
  const color = pickOne(rng, COLORS)
  const [t1, t2, t3] = pickN(rng, SERIES_TYPES, 3)
  const arrow = plain('arrow', color)
  const kinds = d === 1 ? ['alternate', 'turn90'] : d === 2 ? ['cycle3', 'turn45', 'fillCycle'] : ['turnAndColor', 'cycleAndFill', 'turnAndSize']
  const at = <T,>(xs: T[], i: number) => xs[i % xs.length]
  switch (pickOne(rng, kinds)) {
    case 'alternate': {
      const steps = [0, 1, 2, 3, 4].map((i) => plain(i % 2 ? t2 : t1, color))
      return { steps, traps: [plain(t2, color), plain(t3, color), { ...plain(t1, color), fill: 'outline' }] }
    }
    case 'turn90': {
      const dir = rng() < 0.5 ? 90 : -90
      const steps = [0, 1, 2, 3, 4].map((i) => ({ ...arrow, rotation: turn(dir * i) }))
      return { steps, traps: [steps[3], steps[1], steps[2]] }
    }
    case 'cycle3': {
      const steps = [0, 1, 2, 3, 4].map((i) => plain(at([t1, t2, t3], i), color))
      return { steps, traps: [plain(t1, color), plain(t3, color), { ...plain(t2, color), fill: 'striped' }] }
    }
    case 'turn45': {
      const dir = rng() < 0.5 ? 45 : -45
      const steps = [0, 1, 2, 3, 4].map((i) => ({ ...arrow, rotation: turn(dir * i) }))
      // One step short, one step too far, two steps too far.
      return { steps, traps: [steps[3], { ...arrow, rotation: turn(dir * 5) }, { ...arrow, rotation: turn(dir * 6) }] }
    }
    case 'fillCycle': {
      const fills = pickN(rng, BASIC_FILLS, 3)
      const steps = [0, 1, 2, 3, 4].map((i) => ({ ...plain(t1, color), fill: at(fills, i) }))
      return { steps, traps: [steps[3], steps[2], { ...steps[4], type: t2 }] }
    }
    case 'turnAndColor': {
      const other = pickOne(rng, COLORS.filter((c) => c !== color))
      const steps = [0, 1, 2, 3, 4].map((i) => ({ ...arrow, rotation: turn(90 * i), color: i % 2 ? other : color }))
      return { steps, traps: [{ ...steps[4], color: other }, { ...steps[4], rotation: turn(90 * 3) }, steps[3]] }
    }
    case 'cycleAndFill': {
      const steps = [0, 1, 2, 3, 4].map((i) => ({ ...plain(at([t1, t2, t3], i), color), fill: i % 2 ? 'outline' : 'solid' }) as ShapeSpec)
      return { steps, traps: [{ ...steps[4], fill: 'outline' }, { ...steps[4], type: t3 }, steps[3]] }
    }
    default: {
      const steps = [0, 1, 2, 3, 4].map((i) => ({ ...arrow, rotation: turn(45 * i), size: i % 2 ? 'small' : 'medium' }) as ShapeSpec)
      return { steps, traps: [{ ...steps[4], size: 'small' }, { ...steps[4], rotation: turn(45 * 3) }, steps[3]] }
    }
  }
}

export const FIGURAL_SERIES_PROMPT = 'The shapes change in a pattern from left to right. Which shape comes next?'

export function generateFiguralSeriesQuestion(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const rng = mulberry32(seed)
  const d = figuralDifficulty(difficulty, grade)
  for (;;) {
    const { steps, traps } = seriesSteps(rng, d)
    const correct = steps[SERIES_SHOWN]
    const wrong: ShapeSpec[] = []
    for (const t of traps) if (!shapesLookAlike(t, correct) && !wrong.some((w) => shapesLookAlike(w, t))) wrong.push(t)
    if (wrong.length < 3) continue
    const options = shuffle(rng, [{ s: correct, ok: true }, ...wrong.slice(0, 3).map((s) => ({ s, ok: false }))])
    return {
      id: generatedId('figural-series', grade, difficulty, seed),
      domain: 'nonverbal',
      subType: 'figural-series',
      difficulty,
      promptAudioText: FIGURAL_SERIES_PROMPT,
      promptVisual: [[...steps.slice(0, SERIES_SHOWN).map(shape), { kind: 'blank' }]],
      choices: options.map((o, i) => ({ id: `c${i}`, content: shape(o.s), isCorrect: o.ok })),
      source: 'generated',
      generatorSeed: seed,
    }
  }
}

// ---------- Number Matrix (grades 3+) ----------

interface RowRule {
  row: (rng: RngFn) => [number, number, number]
}

function matrixRule(rng: RngFn, d: Difficulty): RowRule {
  const sum: RowRule = { row: (r) => { const a = between(r, 2, 15); const b = between(r, 2, 15); return [a, b, a + b] } }
  const diff: RowRule = { row: (r) => { const b = between(r, 2, 12); const c = between(r, 2, 12); return [b + c, b, c] } }
  const product: RowRule = { row: (r) => { const a = between(r, 2, 9); const b = between(r, 2, 9); return [a, b, a * b] } }
  const k = between(rng, 2, 3)
  const geometric: RowRule = { row: (r) => { const a = between(r, 1, 6); return [a, a * k, a * k * k] } }
  const step = between(rng, 3, 9)
  const arithmetic: RowRule = { row: (r) => { const a = between(r, 1, 30); return [a, a + step, a + 2 * step] } }
  const doubledSum: RowRule = { row: (r) => { const a = between(r, 1, 9); const b = between(r, 1, 9); return [a, b, (a + b) * 2] } }
  const productMinus: RowRule = { row: (r) => { const a = between(r, 2, 9); const b = between(r, 2, 6); return [a, b, a * b - a] } }
  if (d === 1) return pickOne(rng, [sum, diff, arithmetic])
  if (d === 2) return pickOne(rng, [product, geometric, arithmetic])
  return pickOne(rng, [doubledSum, productMinus, geometric])
}

// Every rule the matrix can use, as "what the third number should be".
const ROW_RULES: ((a: number, b: number) => number)[] = [
  (a, b) => a + b,
  (a, b) => a - b,
  (a, b) => a * b,
  (a, b) => (a + b) * 2,
  (a, b) => a * b - a,
  (a, b) => (b * b) / a, // a, a·k, a·k²
  (a, b) => 2 * b - a, // a, a+s, a+2s
]

/** No other rule fits the two complete rows but gives a different answer. */
export function numberMatrixIsUnambiguous(rows: [number, number, number][]): boolean {
  const [a, b, answer] = rows[2]
  return ROW_RULES.every((rule) => {
    const fits = rows.slice(0, 2).every(([x, y, z]) => rule(x, y) === z)
    return !fits || rule(a, b) === answer
  })
}

export const NUMBER_MATRIX_PROMPT ='The numbers in each row follow the same rule. Which number goes in the empty box?'

export function generateNumberMatrixQuestion(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const rng = mulberry32(seed)
  // Levels for 5th–6th grade start one step harder.
  const d = (grade >= 5 ? Math.min(3, difficulty + 1) : difficulty) as Difficulty
  for (;;) {
    const rule = matrixRule(rng, d)
    const rows = [rule.row(rng), rule.row(rng), rule.row(rng)]
    // Rows must differ, or the rule can't be seen.
    if (new Set(rows.map((r) => r.join())).size < 3) continue
    if (!numberMatrixIsUnambiguous(rows)) continue
    const [a, b, answer] = rows[2]
    const wrong = pickWrongValues(rng, answer, [a + b, a * b, Math.abs(a - b), answer + a, answer - b], 0, 999)
    if (wrong.length < 3) continue
    return {
      id: generatedId('number-matrix', grade, difficulty, seed),
      domain: 'quantitative',
      subType: 'number-matrix',
      difficulty,
      promptAudioText: NUMBER_MATRIX_PROMPT,
      promptVisual: rows.map((r, ri) => r.map((v, ci): ContentSpec => (ri === 2 && ci === 2 ? { kind: 'blank' } : word(v)))),
      choices: toChoices(rng, answer, wrong, text),
      source: 'generated',
      generatorSeed: seed,
    }
  }
}

// ---------- Arithmetic Reasoning (written word problems, grades 3+) ----------

// Names only, never pronouns, so every problem reads the same for any child.
const NAMES = ['Maya', 'Leo', 'Ava', 'Sam', 'Nora', 'Eli', 'Zoe', 'Omar', 'Ivy', 'Ben', 'Rosa', 'Kai']

interface WordProblem {
  text: string
  answer: number
  // Answers a child gets from a typical slip (one step only, wrong operation).
  slips: number[]
}

type Template = (rng: RngFn) => WordProblem | null

const T: Record<string, Template> = {
  getThenGive: (r) => {
    const n = pickOne(r, NAMES), a = between(r, 12, 40), b = between(r, 5, 20), c = between(r, 3, 15)
    return { text: `${n} had ${a} stickers and got ${b} more. Then ${n} gave away ${c}. How many stickers does ${n} have now?`, answer: a + b - c, slips: [a + b, a - c, a + b + c] }
  },
  rows: (r) => {
    const rowsN = between(r, 3, 9), k = between(r, 4, 9)
    return { text: `There are ${rowsN} rows of chairs with ${k} chairs in each row. How many chairs are there in all?`, answer: rowsN * k, slips: [rowsN + k, rowsN * k - k, rowsN * (k + 1)] }
  },
  ages: (r) => {
    const [x, y] = pickN(r, NAMES, 2), a = between(r, 6, 11), d = between(r, 2, 6), yrs = between(r, 2, 5)
    return { text: `${x} is ${a} years old. ${y} is ${d} years older than ${x}. How old will ${y} be in ${yrs} years?`, answer: a + d + yrs, slips: [a + d, a + yrs, a + d - yrs] }
  },
  boxes: (r) => {
    const k = between(r, 4, 8), m = between(r, 3, 9)
    return { text: `A box holds ${k} crayons. How many boxes are needed to hold ${k * m} crayons?`, answer: m, slips: [m + 1, k * m - k, k + m] }
  },
  twiceAsMany: (r) => {
    const n = pickOne(r, NAMES), a = between(r, 8, 30)
    return { text: `${n} read ${a} pages on Monday and twice as many pages on Tuesday. How many pages did ${n} read on the two days together?`, answer: 3 * a, slips: [2 * a, a + 2, 4 * a] }
  },
  change: (r) => {
    const n = pickOne(r, NAMES), count = between(r, 2, 5), p = pickOne(r, [10, 15, 20, 25])
    if (count * p >= 100) return null
    return { text: `${n} bought ${count} pencils that cost ${p} cents each and paid with one dollar. How much change did ${n} get, in cents?`, answer: 100 - count * p, slips: [count * p, 100 - p, 100 - count - p] }
  },
  shareThenGive: (r) => {
    const k = between(r, 3, 6), each = between(r, 6, 12), g = between(r, 1, 4)
    return { text: `${k} friends share ${k * each} marbles equally. Then each friend gives ${g} marbles away. How many marbles does each friend have left?`, answer: each - g, slips: [each, k * each - g, each + g] }
  },
  halfThenBikes: (r) => {
    const t = 2 * between(r, 10, 20), b = between(r, 2, 8)
    return { text: `There are ${t} students in a class. Half of them walk to school, and ${b} of the others ride bikes. The rest come by bus. How many students come by bus?`, answer: t / 2 - b, slips: [t / 2, t - b, t / 2 + b] }
  },
  unitPrice: (r) => {
    const k = pickOne(r, [2, 3, 4, 5]), each = between(r, 2, 6), m = between(r, 6, 12)
    if (m === k) return null
    return { text: `If ${k} notebooks cost ${k * each} dollars, how many dollars do ${m} notebooks cost?`, answer: m * each, slips: [m * k * each, m + each, k * each + m] }
  },
  average: (r) => {
    const n = pickOne(r, NAMES), x = between(r, 70, 95), y = between(r, 70, 95), avg = between(r, 75, 90), z = 3 * avg - x - y
    if (z < 60 || z > 100) return null
    return { text: `${n}'s scores on three quizzes were ${x}, ${y}, and ${z}. What was the average score?`, answer: avg, slips: [x + y + z, Math.round((x + y) / 2), avg + 3] }
  },
  perimeter: (r) => {
    const w = between(r, 3, 15), l = between(r, w + 1, 25)
    return { text: `A rectangle is ${w} centimeters wide and ${l} centimeters long. What is its perimeter, in centimeters?`, answer: 2 * (w + l), slips: [w + l, w * l, 2 * w + l] }
  },
  thirds: (r) => {
    const n = 6 * between(r, 3, 10)
    return { text: `A jar holds ${n} marbles. One-third of them are red. Half of the rest are blue. How many marbles are blue?`, answer: n / 3, slips: [n / 2, n / 6, (2 * n) / 3] }
  },
  saving: (r) => {
    const n = pickOne(r, NAMES), s = between(r, 3, 8), weeks = between(r, 4, 10), have = between(r, 5, 20)
    return { text: `${n} has ${have} dollars and saves ${s} more dollars each week. After how many weeks will ${n} have ${have + s * weeks} dollars?`, answer: weeks, slips: [weeks + 1, Math.round((have + s * weeks) / s), weeks - 1] }
  },
  speed: (r) => {
    const v = 2 * between(r, 15, 30), h = between(r, 2, 4)
    return { text: `A car travels ${v} miles each hour. How many miles does it travel in ${h} and a half hours?`, answer: v * h + v / 2, slips: [v * h, v * (h + 1), v * h + 30] }
  },
}

const TEMPLATES_BY_LEVEL: Record<'g3' | 'g4' | 'g56', (keyof typeof T)[]> = {
  g3: ['getThenGive', 'rows', 'ages', 'boxes', 'twiceAsMany'],
  g4: ['rows', 'boxes', 'twiceAsMany', 'change', 'shareThenGive', 'halfThenBikes'],
  g56: ['change', 'shareThenGive', 'halfThenBikes', 'unitPrice', 'average', 'perimeter', 'thirds', 'saving', 'speed'],
}

export const ARITHMETIC_READING_PROMPT = 'Read the problem. Which answer is correct?'

export function generateArithmeticReasoningQuestion(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const rng = mulberry32(seed)
  const level = grade >= 5 ? 'g56' : grade === 4 ? 'g4' : 'g3'
  // Harder difficulties lean on the later (multi-step) templates in each list.
  const pool = TEMPLATES_BY_LEVEL[level]
  const start = difficulty === 1 ? 0 : difficulty === 2 ? Math.floor(pool.length / 3) : Math.floor(pool.length / 2)
  for (;;) {
    const problem = T[pickOne(rng, pool.slice(start))](rng)
    if (!problem || problem.answer <= 0) continue
    const wrong = pickWrongValues(rng, problem.answer, problem.slips, 0, 9999)
    if (wrong.length < 3) continue
    return {
      id: generatedId('arithmetic-reasoning', grade, difficulty, seed),
      domain: 'verbal',
      subType: 'arithmetic-reasoning',
      difficulty,
      promptAudioText: ARITHMETIC_READING_PROMPT,
      promptVisual: [[{ kind: 'sentence', value: problem.text }]],
      choices: toChoices(rng, problem.answer, wrong, text),
      source: 'generated',
      generatorSeed: seed,
    }
  }
}
