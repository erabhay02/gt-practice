import { generatedId, mulberry32, pickOne, randomSeed, shuffle, upperGradeDifficulty, type RngFn } from './rng'
import type { ContentSpec, Difficulty, FoldLine, Grade, Hole, PaperRegion, Point, Question } from '../types'

interface Fold {
  axis: FoldLine
  // Which side stays visible after folding (the other side folds on top of it).
  keep: 'first' | 'second'
}

interface PaperShape {
  region: PaperRegion
  polygon?: Point[]
}

const FULL: PaperRegion = { x: 0, y: 0, w: 64, h: 64 }
const CARDINALS = [0, 90, 180, 270]
const norm = (a: number) => ((a % 360) + 360) % 360

function foldShape(shape: PaperShape, fold: Fold): PaperShape {
  const r = shape.region
  switch (fold.axis) {
    case 'vertical': {
      const w = r.w / 2
      return { region: { ...r, w, x: fold.keep === 'first' ? r.x : r.x + w } }
    }
    case 'horizontal': {
      const h = r.h / 2
      return { region: { ...r, h, y: fold.keep === 'first' ? r.y : r.y + h } }
    }
    case 'diagonal': // line y = x; first = upper-right triangle
      return {
        region: FULL,
        polygon: fold.keep === 'first' ? [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 64, y: 64 }] : [{ x: 0, y: 0 }, { x: 0, y: 64 }, { x: 64, y: 64 }],
      }
    case 'anti-diagonal': // line x + y = 64; first = upper-left triangle
      return {
        region: FULL,
        polygon: fold.keep === 'first' ? [{ x: 0, y: 0 }, { x: 64, y: 0 }, { x: 0, y: 64 }] : [{ x: 64, y: 0 }, { x: 64, y: 64 }, { x: 0, y: 64 }],
      }
  }
}

function inside(shape: PaperShape, p: Point, margin: number): boolean {
  const r = shape.region
  const inRect = p.x >= r.x + margin && p.x <= r.x + r.w - margin && p.y >= r.y + margin && p.y <= r.y + r.h - margin
  if (!inRect) return false
  if (!shape.polygon) return true
  const [a, b, c] = shape.polygon
  // Point-in-triangle via sign of cross products.
  const cross = (o: Point, u: Point, v: Point) => (u.x - o.x) * (v.y - o.y) - (u.y - o.y) * (v.x - o.x)
  const d1 = cross(a, b, p)
  const d2 = cross(b, c, p)
  const d3 = cross(c, a, p)
  return (d1 >= 0 && d2 >= 0 && d3 >= 0) || (d1 <= 0 && d2 <= 0 && d3 <= 0)
}

function distanceFromFold(p: Point, axis: FoldLine): number {
  switch (axis) {
    case 'vertical':
      return Math.abs(p.x - 32)
    case 'horizontal':
      return Math.abs(p.y - 32)
    case 'diagonal':
      return Math.abs(p.x - p.y) / Math.SQRT2
    case 'anti-diagonal':
      return Math.abs(p.x + p.y - 64) / Math.SQRT2
  }
}

/** Mirror a hole across a fold line, flipping a triangle's direction too. */
function reflect(h: Hole, axis: FoldLine): Hole {
  const a = h.angle ?? 0
  switch (axis) {
    case 'vertical':
      return { ...h, x: 64 - h.x, angle: norm(180 - a) }
    case 'horizontal':
      return { ...h, y: 64 - h.y, angle: norm(-a) }
    case 'diagonal':
      return { ...h, x: h.y, y: h.x, angle: norm(90 - a) }
    case 'anti-diagonal':
      return { ...h, x: 64 - h.y, y: 64 - h.x, angle: norm(-90 - a) }
  }
}

// Classic mistake: copy lands in the mirror spot but isn't flipped.
const reflectNoFlip = (h: Hole, axis: FoldLine): Hole => ({ ...reflect(h, axis), angle: h.angle })

// Classic mistake: copy slides across instead of flipping.
function slide(h: Hole, axis: FoldLine): Hole {
  if (axis === 'vertical') return { ...h, x: h.x < 32 ? h.x + 32 : h.x - 32 }
  if (axis === 'horizontal') return { ...h, y: h.y < 32 ? h.y + 32 : h.y - 32 }
  return reflectNoFlip(h, axis)
}

// Unfold in reverse order; each fold doubles every hole across its fold line.
function unfold(holes: Hole[], folds: Fold[], op: (h: Hole, a: FoldLine) => Hole = reflect): Hole[] {
  let result = holes
  for (const fold of [...folds].reverse()) result = [...result, ...result.map((h) => op(h, fold.axis))]
  return result
}

function holeKey(holes: Hole[]): string {
  return holes
    .map((h) => `${Math.round(h.x)},${Math.round(h.y)},${h.cut ?? 'circle'},${h.cut === 'triangle' ? norm(h.angle ?? 0) : 0}`)
    .sort()
    .join('|')
}

const sameLook = (p: Hole, q: Hole) =>
  (p.cut ?? 'circle') === (q.cut ?? 'circle') && (p.cut !== 'triangle' || norm(p.angle ?? 0) === norm(q.angle ?? 0))

// Different hole sets that would look the same at phone size are unfair, not tricky.
function nearlySame(a: Hole[], b: Hole[]): boolean {
  if (a.length !== b.length) return false
  const close = (p: Hole, set: Hole[]) => set.some((q) => Math.abs(p.x - q.x) < 12 && Math.abs(p.y - q.y) < 12 && sameLook(p, q))
  return a.every((p) => close(p, b)) && b.every((p) => close(p, a))
}

// Overlapping holes within one paper look like a drawing glitch, not an answer.
const overlaps = (holes: Hole[]) =>
  holes.some((p, i) => holes.some((q, j) => j > i && Math.abs(p.x - q.x) < 10 && Math.abs(p.y - q.y) < 10))

const allMirrors = (p: Point): Point[] => [
  p,
  { x: 64 - p.x, y: p.y },
  { x: p.x, y: 64 - p.y },
  { x: 64 - p.x, y: 64 - p.y },
  { x: p.y, y: p.x },
  { x: 64 - p.y, y: 64 - p.x },
]

// Holes sit on a coarse grid inside the folded paper, away from edges and fold
// lines, and away from mirror spots of other holes (which would make the
// wrong answers collapse into the right one).
function randomHole(rng: RngFn, shape: PaperShape, folds: Fold[], taken: Point[]): Point {
  const grid: Point[] = []
  for (let x = 8; x <= 56; x += 4) for (let y = 8; y <= 56; y += 4) grid.push({ x, y })
  const avoid = taken.flatMap(allMirrors)
  const ok = (p: Point) =>
    inside(shape, p, 7) &&
    folds.every((f) => distanceFromFold(p, f.axis) >= 7) &&
    !avoid.some((t) => Math.abs(t.x - p.x) < 10 && Math.abs(t.y - p.y) < 10)
  const options = grid.filter(ok)
  return options.length > 0 ? pickOne(rng, options) : { x: 16, y: 16 }
}

type Variant = { folds: Fold[]; holeCount: number; cut: Hole['cut'] }

function chooseVariant(rng: RngFn, requested: Difficulty, grade: Grade): Variant {
  const straight = (): FoldLine => pickOne(rng, ['vertical', 'horizontal'] as FoldLine[])
  const keep = () => pickOne(rng, ['first', 'second'] as const)
  // Kindergarten: one straight fold, one round hole.
  if (grade === 0) return { folds: [{ axis: straight(), keep: keep() }], holeCount: 1, cut: 'circle' }
  // Grades 3–4 use the 2nd-grade folds, one step harder.
  const difficulty = grade >= 3 ? upperGradeDifficulty(requested, grade) : requested
  // 1st grade: always one straight fold and round holes.
  if (grade === 1) return { folds: [{ axis: straight(), keep: keep() }], holeCount: difficulty === 3 ? 2 : 1, cut: 'circle' }
  if (difficulty === 1) return { folds: [{ axis: straight(), keep: keep() }], holeCount: 1, cut: 'circle' }
  if (difficulty === 2) {
    const axis = pickOne(rng, ['vertical', 'horizontal', 'diagonal', 'anti-diagonal'] as FoldLine[])
    return { folds: [{ axis, keep: keep() }], holeCount: 2, cut: pickOne(rng, ['circle', 'square'] as const) }
  }
  if (rng() < 0.5) {
    const first = straight()
    const second: FoldLine = first === 'vertical' ? 'horizontal' : 'vertical'
    return { folds: [{ axis: first, keep: keep() }, { axis: second, keep: keep() }], holeCount: 1, cut: 'circle' }
  }
  const axis = pickOne(rng, ['vertical', 'horizontal', 'diagonal', 'anti-diagonal'] as FoldLine[])
  return { folds: [{ axis, keep: keep() }], holeCount: 1, cut: 'triangle' }
}

// A triangle must point somewhere its mirror copy visibly flips.
function triangleAngle(rng: RngFn, axis: FoldLine): number {
  if (axis === 'vertical') return pickOne(rng, [0, 180])
  if (axis === 'horizontal') return pickOne(rng, [90, 270])
  return pickOne(rng, CARDINALS)
}

const OTHER_AXIS: Record<FoldLine, FoldLine> = {
  vertical: 'horizontal',
  horizontal: 'vertical',
  diagonal: 'anti-diagonal',
  'anti-diagonal': 'diagonal',
}

export function generatePaperFoldingQuestion(
  difficulty: Difficulty,
  seed: number = randomSeed(),
  grade: Grade = 2,
): Question {
  const rng = mulberry32(seed)
  const { folds, holeCount, cut } = chooseVariant(rng, difficulty, grade)

  const shapes: PaperShape[] = [{ region: FULL }]
  for (const f of folds) shapes.push(foldShape(shapes[shapes.length - 1], f))
  const finalShape = shapes[shapes.length - 1]

  const punched: Hole[] = []
  for (let i = 0; i < holeCount; i++) {
    const p = randomHole(rng, finalShape, folds, punched)
    punched.push(cut === 'triangle' ? { ...p, cut, angle: triangleAngle(rng, folds[0].axis) } : { ...p, cut })
  }

  const correct = unfold(punched, folds)

  const candidates: Hole[][] = [
    punched, // forgot to unfold
    unfold(punched, folds, reflectNoFlip), // copied to the mirror spot without flipping
    unfold(punched, folds, slide), // slid across instead of flipping
    unfold(punched, folds.map((f) => ({ ...f, axis: OTHER_AXIS[f.axis] }))), // flipped across the wrong line
  ]
  if (folds.length === 2) candidates.unshift(unfold(punched, folds.slice(1))) // unfolded only once
  if (folds.length === 1) {
    candidates.push(unfold(punched, [folds[0], { axis: OTHER_AXIS[folds[0].axis], keep: 'first' }])) // too many
    candidates.push([...punched, ...punched.map((h) => ({ ...h, x: 64 - h.x, y: 64 - h.y }))]) // diagonal copy
  }
  // Right pattern, wrong place on the paper.
  for (const [dx, dy] of [[16, 0], [-16, 0], [0, 16], [0, -16], [12, 12], [-12, -12], [12, -12], [-12, 12]]) {
    const shifted = correct.map((h) => ({ ...h, x: h.x + dx, y: h.y + dy }))
    if (shifted.every((h) => h.x >= 5 && h.x <= 59 && h.y >= 5 && h.y <= 59)) candidates.push(shifted)
  }

  const seen = new Set([holeKey(correct)])
  const distractors: Hole[][] = []
  const accept = (c: Hole[]) => {
    const key = holeKey(c)
    if (seen.has(key) || overlaps(c) || nearlySame(c, correct) || distractors.some((d) => nearlySame(c, d))) return
    seen.add(key)
    distractors.push(c)
  }
  for (const c of candidates) {
    if (distractors.length === 3) break
    accept(c)
  }
  // Last resort for rare symmetric layouts where the deliberate mistakes collapse.
  const spots = [8, 16, 24, 40, 48, 56]
  for (let i = 0; distractors.length < 3 && i < 500; i++) {
    accept(correct.map((h) => ({ ...h, x: pickOne(rng, spots), y: pickOne(rng, spots) })))
  }

  const paper = (shape: PaperShape, holes: Hole[], foldLines?: FoldLine[]): ContentSpec => ({
    kind: 'paper',
    region: shape.region,
    polygon: shape.polygon,
    holes,
    foldLines,
  })
  const arrow: ContentSpec = { kind: 'text', value: '→' }

  const promptRow: ContentSpec[] = []
  shapes.forEach((shape, i) => {
    const isLast = i === shapes.length - 1
    if (i > 0) promptRow.push(arrow)
    promptRow.push(paper(shape, isLast ? punched : [], isLast ? undefined : [folds[i].axis]))
  })

  const options = shuffle(rng, [
    { holes: correct, isCorrect: true },
    ...distractors.map((holes) => ({ holes, isCorrect: false })),
  ])

  const action = cut === 'triangle' ? 'a triangle is cut out of it' : cut === 'square' ? 'square holes are punched through it' : holeCount > 1 ? 'holes are punched through it' : 'a hole is punched through it'
  const foldText = folds.length === 2 ? 'folded two times' : 'folded along the dotted line'

  return {
    id: generatedId('paper-folding', grade, difficulty, seed),
    domain: 'nonverbal',
    subType: 'paper-folding',
    difficulty,
    promptAudioText: `A piece of paper is ${foldText}. Then ${action}. When the paper is opened up, what will it look like?`,
    promptVisual: [promptRow],
    choices: options.map((o, i) => ({ id: `c${i}`, content: paper({ region: FULL }, o.holes), isCorrect: o.isCorrect })),
    source: 'generated',
    generatorSeed: seed,
  }
}
