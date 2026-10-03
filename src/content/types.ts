export type Domain = 'verbal' | 'quantitative' | 'nonverbal'

export type SubType =
  | 'picture-analogy'
  | 'picture-classification'
  | 'sentence-completion'
  | 'number-analogy'
  | 'number-puzzle'
  | 'number-series'
  | 'figure-matrix'
  | 'figure-classification'
  | 'paper-folding'

export type Difficulty = 1 | 2 | 3

export type ShapeType = 'circle' | 'square' | 'triangle' | 'star' | 'pentagon' | 'hexagon' | 'arrow' | 'cross'
export type ShapeFill = 'solid' | 'striped' | 'dotted' | 'outline' | 'half'
export type ShapeSize = 'small' | 'medium' | 'large'
export type ShapeRotation = 0 | 45 | 90 | 135 | 180 | 225 | 270 | 315
export type InnerMark = 'none' | 'dot' | 'line' | 'x'

export interface ShapeSpec {
  type: ShapeType
  color: string
  size: ShapeSize
  rotation: ShapeRotation
  fill: ShapeFill
  count?: 1 | 2 | 3
  // A small mark drawn in the middle (ignored when `nested` is set).
  inner?: InnerMark
  // A small outlined shape drawn inside this one.
  nested?: ShapeType | null
}

export interface Point {
  x: number
  y: number
}

// Rectangle within the 64x64 paper coordinate space.
export interface PaperRegion {
  x: number
  y: number
  w: number
  h: number
}

export type FoldLine = 'vertical' | 'horizontal' | 'diagonal' | 'anti-diagonal'

// A punched or cut hole. Triangles point toward `angle` (0 = right), so a
// mirror copy visibly flips direction.
export interface Hole extends Point {
  cut?: 'circle' | 'square' | 'triangle'
  angle?: number
}

export type ContentSpec =
  | { kind: 'emoji'; value: string }
  | { kind: 'shape'; spec: ShapeSpec }
  | { kind: 'text'; value: string }
  | { kind: 'blank' }
  | { kind: 'group'; emoji: string; count: number }
  | { kind: 'abacus'; counts: (number | null)[] }
  | {
      kind: 'paper'
      region: PaperRegion
      // When set, the visible (folded) paper is this triangle instead of `region`.
      polygon?: Point[]
      holes: Hole[]
      foldLines?: FoldLine[]
    }

export interface Choice {
  id: string
  content: ContentSpec
  isCorrect: boolean
}

export interface Question {
  id: string
  domain: Domain
  subType: SubType
  difficulty: Difficulty
  promptAudioText: string
  promptVisual?: ContentSpec[][]
  choices: Choice[]
  explanationAudioText?: string
  source: 'authored' | 'generated'
  generatorSeed?: number
}
