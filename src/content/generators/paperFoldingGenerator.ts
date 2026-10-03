import { mulberry32, pickOne, randomSeed, shuffle, type RngFn } from './rng'
import type { ContentSpec, Difficulty, PaperRegion, Point, Question } from '../types'

type Axis = 'vertical' | 'horizontal'

interface Fold {
  axis: Axis
  // Which half stays visible after folding (the other half folds on top of it).
  keep: 'first' | 'second'
}

const FULL: PaperRegion = { x: 0, y: 0, w: 64, h: 64 }

function foldRegion(region: PaperRegion, fold: Fold): PaperRegion {
  if (fold.axis === 'vertical') {
    const w = region.w / 2
    return { ...region, w, x: fold.keep === 'first' ? region.x : region.x + w }
  }
  const h = region.h / 2
  return { ...region, h, y: fold.keep === 'first' ? region.y : region.y + h }
}

function reflect(p: Point, axis: Axis): Point {
  return axis === 'vertical' ? { x: 64 - p.x, y: p.y } : { x: p.x, y: 64 - p.y }
}

function translate(p: Point, axis: Axis): Point {
  if (axis === 'vertical') return { x: p.x < 32 ? p.x + 32 : p.x - 32, y: p.y }
  return { x: p.x, y: p.y < 32 ? p.y + 32 : p.y - 32 }
}

// Unfold in reverse order; each fold doubles every hole across its fold line.
function unfold(holes: Point[], folds: Fold[], op: (p: Point, a: Axis) => Point = reflect): Point[] {
  let result = holes
  for (const fold of [...folds].reverse()) {
    result = [...result, ...result.map((p) => op(p, fold.axis))]
  }
  return result
}

// Different hole sets that would look the same at phone size are unfair, not tricky.
function nearlySame(a: Point[], b: Point[]): boolean {
  if (a.length !== b.length) return false
  const close = (p: Point, set: Point[]) => set.some((q) => Math.abs(p.x - q.x) < 12 && Math.abs(p.y - q.y) < 12)
  return a.every((p) => close(p, b)) && b.every((p) => close(p, a))
}

function holeKey(holes: Point[]): string {
  return holes
    .map((h) => `${Math.round(h.x)},${Math.round(h.y)}`)
    .sort()
    .join('|')
}

// Holes sit on a coarse grid inside the folded region, away from edges and
// fold lines so the unfolded copies are clearly separate.
function randomHole(rng: RngFn, region: PaperRegion, taken: Point[]): Point {
  const xs: number[] = []
  const ys: number[] = []
  for (let v = region.x + 8; v <= region.x + region.w - 8; v += 4) xs.push(v)
  for (let v = region.y + 8; v <= region.y + region.h - 8; v += 4) ys.push(v)
  for (let i = 0; i < 100; i++) {
    const p = { x: pickOne(rng, xs), y: pickOne(rng, ys) }
    const nearFold = Math.abs(p.x - 32) < 6 || Math.abs(p.y - 32) < 6
    const nearOther = taken.some((t) => Math.abs(t.x - p.x) < 10 && Math.abs(t.y - p.y) < 10)
    if (!nearFold && !nearOther) return p
  }
  return { x: region.x + region.w / 2, y: region.y + region.h / 2 }
}

function buildFolds(rng: RngFn, difficulty: Difficulty): Fold[] {
  const first: Fold = { axis: pickOne(rng, ['vertical', 'horizontal'] as Axis[]), keep: pickOne(rng, ['first', 'second'] as const) }
  if (difficulty < 3) return [first]
  const second: Fold = {
    axis: first.axis === 'vertical' ? 'horizontal' : 'vertical',
    keep: pickOne(rng, ['first', 'second'] as const),
  }
  return [first, second]
}

export function generatePaperFoldingQuestion(difficulty: Difficulty, seed: number = randomSeed()): Question {
  const rng = mulberry32(seed)
  const folds = buildFolds(rng, difficulty)

  const regions: PaperRegion[] = [FULL]
  for (const f of folds) regions.push(foldRegion(regions[regions.length - 1], f))
  const finalRegion = regions[regions.length - 1]

  const holeCount = difficulty === 2 ? 2 : 1
  const punched: Point[] = []
  for (let i = 0; i < holeCount; i++) punched.push(randomHole(rng, finalRegion, punched))

  const correct = unfold(punched, folds)
  const otherAxis = (a: Axis): Axis => (a === 'vertical' ? 'horizontal' : 'vertical')

  const candidates: Point[][] = [
    // Forgot to unfold: only the punched hole(s).
    punched,
    // Slid the copy across instead of flipping it.
    unfold(punched, folds, translate),
    // Flipped across the wrong line.
    unfold(punched, folds.map((f) => ({ ...f, axis: otherAxis(f.axis) }))),
  ]
  if (folds.length === 2) {
    // Unfolded only once.
    candidates.unshift(unfold(punched, folds.slice(1)))
  }
  // Fallbacks: right count with one copy misplaced; too many holes.
  candidates.push(correct.map((p, i) => (i === correct.length - 1 ? translate(reflect(p, folds[0].axis), otherAxis(folds[0].axis)) : p)))
  if (folds.length === 1) {
    candidates.push(unfold(punched, [folds[0], { axis: otherAxis(folds[0].axis), keep: 'first' }]))
  }

  const seen = new Set([holeKey(correct)])
  const distractors: Point[][] = []
  for (const c of candidates) {
    const key = holeKey(c)
    if (seen.has(key) || nearlySame(c, correct) || distractors.some((d) => nearlySame(c, d))) continue
    seen.add(key)
    distractors.push(c)
    if (distractors.length === 3) break
  }

  const paper = (region: PaperRegion, holes: Point[], foldLines?: Axis[]): ContentSpec => ({
    kind: 'paper',
    region,
    holes,
    foldLines,
  })
  const arrow: ContentSpec = { kind: 'text', value: '→' }

  const promptRow: ContentSpec[] = []
  regions.forEach((region, i) => {
    const isLast = i === regions.length - 1
    if (i > 0) promptRow.push(arrow)
    promptRow.push(paper(region, isLast ? punched : [], isLast ? undefined : [folds[i].axis]))
  })

  const options = shuffle(rng, [
    { holes: correct, isCorrect: true },
    ...distractors.map((holes) => ({ holes, isCorrect: false })),
  ])

  return {
    id: `paper-folding-${difficulty}-${seed}`,
    domain: 'nonverbal',
    subType: 'paper-folding',
    difficulty,
    promptAudioText:
      folds.length === 1
        ? 'A piece of paper is folded along the dotted line. Then a hole is punched through it. When the paper is opened up, what will it look like?'
        : 'A piece of paper is folded two times. Then a hole is punched through it. When the paper is opened up, what will it look like?',
    promptVisual: [promptRow],
    choices: options.map((o, i) => ({ id: `c${i}`, content: paper(FULL, o.holes), isCorrect: o.isCorrect })),
    source: 'generated',
    generatorSeed: seed,
  }
}
