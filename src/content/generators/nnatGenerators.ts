// NNAT3-style figural items (Naglieri Nonverbal Ability Test, Third Edition):
// Pattern Completion, Reasoning by Analogy, Serial Reasoning and Spatial
// Visualization. Built on the same shape primitives as the CogAT generators;
// only the item formats are new. Serial Reasoning and the 3x3 analogy are also
// reused for OLSAT's Pattern Matrix and CogAT Level 12's 3x3 figure matrices.
import { generateMatrixQuestion } from './matrixGenerator'
import { generatedId, mulberry32, pickN, pickOne, shuffle, upperGradeDifficulty, type RngFn } from './rng'
import { BASIC_FILLS, COLORS, EASY_SHAPE_TYPES, SHAPE_TYPES, shapesLookAlike } from './shapePalette'
import type { ContentSpec, Difficulty, Grade, LineStroke, Question, ShapeFill, ShapeSpec, ShapeType, SubType } from '../types'

/** Grades 3+ start harder, like the CogAT figure generators. */
export function figuralDifficulty(difficulty: Difficulty, grade: Grade): Difficulty {
  return grade >= 3 ? upperGradeDifficulty(difficulty, grade) : difficulty
}

const shape = (spec: ShapeSpec): ContentSpec => ({ kind: 'shape', spec })

function baseShape(type: ShapeType, color: string, fill: ShapeFill = 'solid'): ShapeSpec {
  return { type, color, size: 'medium', rotation: 0, fill, count: 1, inner: 'none', nested: null }
}

/** Keeps the first three candidates that differ from the answer and from each other. */
function pickDistinct<T>(correct: T, candidates: T[], same: (a: T, b: T) => boolean, n = 3): T[] {
  const out: T[] = []
  for (const c of candidates) {
    if (same(c, correct) || out.some((o) => same(o, c))) continue
    out.push(c)
    if (out.length === n) break
  }
  return out
}

function assemble(
  subType: SubType,
  grade: Grade,
  difficulty: Difficulty,
  seed: number,
  rng: RngFn,
  promptAudioText: string,
  promptVisual: ContentSpec[][],
  correct: ContentSpec,
  distractors: ContentSpec[],
): Question {
  const options = shuffle(rng, [{ content: correct, isCorrect: true }, ...distractors.map((content) => ({ content, isCorrect: false }))])
  return {
    id: generatedId(subType, grade, difficulty, seed),
    domain: 'nonverbal',
    subType,
    difficulty,
    promptAudioText,
    promptVisual,
    choices: options.map((o, i) => ({ id: `c${i}`, content: o.content, isCorrect: o.isCorrect })),
    source: 'generated',
    generatorSeed: seed,
  }
}

// ---------- Pattern Completion ----------

// Blue and yellow (plus white and navy) like the real NNAT: a pairing that
// stays distinct under every common kind of color blindness, mostly by lightness.
export const PATTERN_COLORS = ['#2563eb', '#facc15', '#ffffff', '#1e3a8a']

/**
 * A pattern: `value` gives each cell's color index, and cells with the same
 * `key` always share a color. A hole is fair only if every hidden cell's key
 * is also visible somewhere, so the missing piece can actually be worked out.
 */
interface PatternRule {
  key: (r: number, c: number) => string
  value: (r: number, c: number) => number
}

const ring = (n: number, r: number, c: number) => Math.min(r, c, n - 1 - r, n - 1 - c)

function patternRule(rng: RngFn, d: Difficulty): { size: number; rule: PatternRule; colors: number } {
  const byKey = (key: (r: number, c: number) => number): PatternRule => ({ key: (r, c) => String(key(r, c)), value: key })
  if (d === 1) {
    const rules: PatternRule[] = [
      byKey((_r, c) => c % 2),
      byKey((r) => r % 2),
      byKey((r, c) => (r + c) % 2),
      byKey((r, c) => (Math.floor(r / 2) + Math.floor(c / 2)) % 2),
    ]
    return { size: 4, rule: pickOne(rng, rules), colors: 2 }
  }
  const n = 6
  if (d === 2) {
    const motif = randomMotif(rng, 2, 3)
    const rules: PatternRule[] = [
      byKey((r, c) => (r + c) % 3),
      byKey((r, c) => (((r - c) % 3) + 3) % 3),
      byKey((r, c) => ring(n, r, c)),
      { key: (r, c) => `${r % 2},${c % 2}`, value: (r, c) => motif[r % 2][c % 2] },
    ]
    return { size: n, rule: pickOne(rng, rules), colors: 3 }
  }
  const motif = randomMotif(rng, 3, 4)
  const half = randomMotif(rng, 3, 3)
  const fold = (x: number) => (x < 3 ? x : 5 - x)
  const rules: PatternRule[] = [
    { key: (r, c) => `${r % 3},${c % 3}`, value: (r, c) => motif[r % 3][c % 3] },
    // Mirror image across both middle lines.
    { key: (r, c) => `${fold(r)},${fold(c)}`, value: (r, c) => half[fold(r)][fold(c)] },
    { key: (r, c) => `${ring(n, r, c)},${(r + c) % 2}`, value: (r, c) => (ring(n, r, c) + ((r + c) % 2)) % 3 },
  ]
  return { size: n, rule: pickOne(rng, rules), colors: 4 }
}

/** Every hidden cell's color is shown by some visible cell with the same key. */
export function holeIsSolvable(rule: PatternRule, size: number, hole: { row: number; col: number; size: number }): boolean {
  const inHole = (r: number, c: number) => r >= hole.row && r < hole.row + hole.size && c >= hole.col && c < hole.col + hole.size
  const visible = new Set<string>()
  for (let r = 0; r < size; r++) for (let c = 0; c < size; c++) if (!inHole(r, c)) visible.add(rule.key(r, c))
  for (let r = hole.row; r < hole.row + hole.size; r++)
    for (let c = hole.col; c < hole.col + hole.size; c++) if (!visible.has(rule.key(r, c))) return false
  return true
}

/** A k x k block of color indexes using at least two different colors. */
function randomMotif(rng: RngFn, k: number, colors: number): number[][] {
  for (;;) {
    const m = Array.from({ length: k }, () => Array.from({ length: k }, () => Math.floor(rng() * colors)))
    if (new Set(m.flat()).size >= 2) return m
  }
}

const sameBlock = (a: number[][], b: number[][]) => a.every((row, r) => row.every((v, c) => v === b[r][c]))
const rotateBlock = (b: number[][]) => b.map((row, r) => row.map((_v, c) => b[b.length - 1 - c][r]))
const mirrorBlock = (b: number[][]) => b.map((row) => [...row].reverse())

export function generatePatternCompletionQuestion(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const rng = mulberry32(seed)
  const d = figuralDifficulty(difficulty, grade)
  for (;;) {
    const { size, rule, colors } = patternRule(rng, d)
    const palette = shuffle(rng, PATTERN_COLORS.slice(0, Math.max(colors, 2)))
    const grid = Array.from({ length: size }, (_r, r) => Array.from({ length: size }, (_c, c) => rule.value(r, c)))
    const k = d === 3 && rng() < 0.5 ? 3 : 2
    const row = Math.floor(rng() * (size - k + 1))
    const col = Math.floor(rng() * (size - k + 1))
    if (!holeIsSolvable(rule, size, { row, col, size: k })) continue
    const block = (r0: number, c0: number) =>
      Array.from({ length: k }, (_r, r) => Array.from({ length: k }, (_c, c) => rule.value(r0 + r, c0 + c)))
    const correct = block(row, col)
    if (new Set(correct.flat()).size < 2) continue

    const used = [...new Set(grid.flat())]
    const swapped = correct.map((r) => r.map((v) => (v === used[0] ? used[1] : v === used[1] ? used[0] : v)))
    const oneOff = correct.map((r, ri) => r.map((v, ci) => (ri === 0 && ci === k - 1 ? used.find((u) => u !== v)! : v)))
    const candidates = shuffle(rng, [
      rotateBlock(correct),
      mirrorBlock(correct),
      swapped,
      block(row, col + 1 <= size - k ? col + 1 : col - 1),
      block(row + 1 <= size - k ? row + 1 : row - 1, col),
      oneOff,
    ])
    const distractors = pickDistinct(correct, candidates, sameBlock)
    if (distractors.length < 3) continue

    const paint = (b: number[][]) => b.map((r) => r.map((v) => palette[v]))
    return assemble(
      'pattern-completion', grade, difficulty, seed, rng,
      'Look at the big pattern. Which piece fills the empty space to finish it?',
      [[{ kind: 'pattern', cells: paint(grid), hole: { row, col, size: k } }]],
      { kind: 'pattern', cells: paint(correct) },
      distractors.map((b) => ({ kind: 'pattern', cells: paint(b) })),
    )
  }
}

// ---------- 3x3 matrices (Reasoning by Analogy, Serial Reasoning) ----------

type ColAttr = 'fill' | 'color' | 'count' | 'size'

function columnValues(rng: RngFn, attr: ColAttr, base: ShapeSpec): ((s: ShapeSpec) => ShapeSpec)[] {
  switch (attr) {
    case 'fill': {
      const fills = pickN(rng, BASIC_FILLS, 3)
      return fills.map((fill) => (s) => ({ ...s, fill }))
    }
    case 'color': {
      const colors = pickN(rng, COLORS.filter((c) => c !== base.color), 3)
      return colors.map((color) => (s) => ({ ...s, color }))
    }
    case 'count':
      // Medium: ContentTile already scales 2–3 copies down to fit one box.
      return ([1, 2, 3] as const).map((count) => (s) => ({ ...s, count, size: 'medium' }))
    case 'size':
      return (['small', 'medium', 'large'] as const).map((size) => (s) => ({ ...s, size }))
  }
}

export const MATRIX3_ANALOGY_PROMPT =
  'Look at how the pictures change across each row and down each column. Which picture goes in the empty box?'

/**
 * Each row keeps one shape; each column applies the same change (pattern,
 * color, how many, or size). Harder items add a second change down the rows.
 */
export function build3x3Analogy(rng: RngFn, d: Difficulty, young: boolean) {
  const types = pickN(rng, young ? EASY_SHAPE_TYPES.filter((t) => t !== 'circle') : SHAPE_TYPES, 3)
  const base = baseShape(types[0], pickOne(rng, COLORS))
  const colAttr = pickOne(rng, (d === 1 ? ['fill', 'count', 'size'] : ['fill', 'color', 'count', 'size']) as ColAttr[])
  const cols = columnValues(rng, colAttr, base)
  // Hardest: rows also differ in a second attribute that the columns don't touch.
  const rowColor = d === 3 && colAttr !== 'color' ? pickN(rng, COLORS, 3) : null
  const rowFill = d === 3 && colAttr === 'color' ? pickN(rng, BASIC_FILLS, 3) : null
  const cell = (r: number, c: number): ShapeSpec => {
    let s: ShapeSpec = { ...base, type: types[r] }
    if (rowColor) s = { ...s, color: rowColor[r] }
    if (rowFill) s = { ...s, fill: rowFill[r] }
    return cols[c](s)
  }
  const grid = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cell(r, c)))
  const correct = grid[2][2]
  // Traps: the right shape with the wrong column change, the right change on
  // the wrong shape, or the right picture with the row's other change wrong.
  const candidates = shuffle(rng, [
    grid[2][1],
    grid[1][2],
    grid[2][0],
    grid[0][2],
    ...(rowColor ? [{ ...correct, color: rowColor[1] }] : []),
    ...(rowFill ? [{ ...correct, fill: rowFill[0] }] : []),
  ])
  return { grid, correct, distractors: pickDistinct(correct, candidates, shapesLookAlike) }
}

export function generateReasoningByAnalogyQuestion(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const d = figuralDifficulty(difficulty, grade)
  // Easiest items are the familiar 2x2 analogy (the same format as CogAT's).
  if (d === 1) {
    const q = generateMatrixQuestion(difficulty, seed, grade)
    return { ...q, id: generatedId('reasoning-by-analogy', grade, difficulty, seed), subType: 'reasoning-by-analogy' }
  }
  const rng = mulberry32(seed)
  for (;;) {
    const { grid, correct, distractors } = build3x3Analogy(rng, d, grade <= 2)
    if (distractors.length < 3) continue
    return assemble(
      'reasoning-by-analogy', grade, difficulty, seed, rng,
      MATRIX3_ANALOGY_PROMPT,
      grid.map((row, r) => row.map((s, c) => (r === 2 && c === 2 ? { kind: 'blank' } : shape(s)))),
      shape(correct),
      distractors.map(shape),
    )
  }
}

export const SERIAL_PROMPT = 'Each row and each column follows a pattern. Which picture goes in the empty box?'

/**
 * Latin-square rows: every row and column holds each value once, shifted along
 * like a sequence. Harder items layer a second (and third) sequence on top.
 */
export function generateSerialReasoningQuestion(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const rng = mulberry32(seed)
  const d = figuralDifficulty(difficulty, grade)
  for (;;) {
    const types = pickN(rng, grade <= 2 ? EASY_SHAPE_TYPES.filter((t) => t !== 'circle') : SHAPE_TYPES, 3)
    const fills = pickN(rng, BASIC_FILLS, 3)
    const colors = pickN(rng, COLORS, 3)
    const color = pickOne(rng, COLORS)
    const shift = rng() < 0.5 ? 1 : 2
    const cell = (r: number, c: number): ShapeSpec => {
      const s = baseShape(types[(c + shift * r) % 3], d === 3 ? colors[(c + r) % 3] : color)
      // A second, differently-shifted sequence of patterns on harder items.
      return d >= 2 ? { ...s, fill: fills[(c + (3 - shift) * r) % 3] } : s
    }
    const grid = [0, 1, 2].map((r) => [0, 1, 2].map((c) => cell(r, c)))
    const correct = grid[2][2]
    const others = types.filter((t) => t !== correct.type)
    const candidates = shuffle(rng, [
      { ...correct, type: others[0] },
      { ...correct, type: others[1] },
      grid[2][1],
      grid[1][2],
      { ...correct, fill: fills.find((f) => f !== correct.fill)! },
      { ...correct, color: colors.find((c) => c !== correct.color)! },
      grid[2][0],
    ])
    const distractors = pickDistinct(correct, candidates, shapesLookAlike)
    if (distractors.length < 3) continue
    return assemble(
      'serial-reasoning', grade, difficulty, seed, rng,
      SERIAL_PROMPT,
      grid.map((row, r) => row.map((s, c) => (r === 2 && c === 2 ? { kind: 'blank' } : shape(s)))),
      shape(correct),
      distractors.map(shape),
    )
  }
}

// ---------- Spatial Visualization (line figures) ----------

const STROKES: LineStroke[] = ['top', 'bottom', 'left', 'right', 'diag', 'antidiag', 'vmid', 'hmid', 'ring']

const norm = (s: LineStroke[]) => STROKES.filter((x) => s.includes(x))
const sameStrokes = (a: LineStroke[], b: LineStroke[]) => norm(a).join() === norm(b).join()
const union = (a: LineStroke[], b: LineStroke[]) => norm([...a, ...b])
const xor = (a: LineStroke[], b: LineStroke[]) => norm([...a.filter((s) => !b.includes(s)), ...b.filter((s) => !a.includes(s))])

export const SPATIAL_ADD_PROMPT =
  'In each row, the first two pictures are put together to make the third picture. Which picture goes in the empty box?'
export const SPATIAL_XOR_PROMPT =
  'In each row, the first two pictures are put on top of each other, and the lines they share disappear. Which picture goes in the empty box?'

export function generateSpatialVisualizationQuestion(difficulty: Difficulty, seed: number, grade: Grade): Question {
  const rng = mulberry32(seed)
  const d = figuralDifficulty(difficulty, grade)
  const combine = d === 3 ? xor : union
  const rowsShown = d === 1 ? 1 : 2
  const lines = (strokes: LineStroke[]): ContentSpec => ({ kind: 'lines', strokes })

  const pair = (): [LineStroke[], LineStroke[]] => {
    for (;;) {
      const per = d === 1 ? 1 : 2
      const a = pickN(rng, STROKES, per)
      const b = pickN(rng, STROKES, per)
      const shared = a.filter((s) => b.includes(s)).length
      // Adding needs new lines; cancelling needs at least one shared line.
      if (d === 3 ? shared >= 1 && xor(a, b).length >= 1 : shared === 0) return [a, b]
    }
  }

  for (;;) {
    const examples = Array.from({ length: rowsShown }, pair)
    const [a, b] = pair()
    const correct = combine(a, b)
    const spare = STROKES.filter((s) => !correct.includes(s))
    const candidates = shuffle(rng, [
      ...(d === 3 ? [union(a, b)] : []),
      correct.slice(1),
      correct.slice(0, -1),
      norm([...correct, pickOne(rng, spare)]),
      norm([...correct.slice(1), pickOne(rng, spare)]),
      a,
      b,
    ]).filter((s) => s.length > 0)
    const distractors = pickDistinct(correct, candidates, sameStrokes)
    if (distractors.length < 3 || correct.length === 0) continue
    return assemble(
      'spatial-visualization', grade, difficulty, seed, rng,
      d === 3 ? SPATIAL_XOR_PROMPT : SPATIAL_ADD_PROMPT,
      [
        ...examples.map(([x, y]) => [lines(x), lines(y), lines(combine(x, y))]),
        [lines(a), lines(b), { kind: 'blank' }],
      ],
      lines(correct),
      distractors.map(lines),
    )
  }
}
