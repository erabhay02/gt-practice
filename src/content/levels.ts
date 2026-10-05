import type { Grade, SubType } from './types'

export interface LevelInfo {
  grade: Grade
  label: string
  // Short form for tight spots ("K", "3rd").
  shortLabel: string
  cogatLevel: string
  // Approximate number of items on each real subtest at this level.
  mockLength: Partial<Record<SubType, number>>
  // Levels 9 and up give each subtest a time limit; K–2 are untimed.
  minutesPerPart: number | null
}

export const LEVELS: Record<Grade, LevelInfo> = {
  0: {
    grade: 0,
    label: 'Kindergarten',
    shortLabel: 'K',
    cogatLevel: '5/6',
    mockLength: {
      'picture-analogy': 12,
      'sentence-completion': 12,
      'picture-classification': 12,
      'number-analogy': 12,
      'number-puzzle': 10,
      'number-series': 12,
      'figure-matrix': 10,
      'paper-folding': 10,
      'figure-classification': 10,
    },
    minutesPerPart: null,
  },
  1: {
    grade: 1,
    label: '1st grade',
    shortLabel: '1st',
    cogatLevel: '7',
    mockLength: {
      'picture-analogy': 13,
      'sentence-completion': 13,
      'picture-classification': 12,
      'number-analogy': 13,
      'number-puzzle': 11,
      'number-series': 13,
      'figure-matrix': 11,
      'paper-folding': 10,
      'figure-classification': 11,
    },
    minutesPerPart: null,
  },
  2: {
    grade: 2,
    label: '2nd grade',
    shortLabel: '2nd',
    cogatLevel: '8',
    mockLength: {
      'picture-analogy': 16,
      'sentence-completion': 16,
      'picture-classification': 16,
      'number-analogy': 16,
      'number-puzzle': 14,
      'number-series': 16,
      'figure-matrix': 16,
      'paper-folding': 14,
      'figure-classification': 16,
    },
    minutesPerPart: null,
  },
  // Levels 9 and 10 share the same subtests and item counts.
  3: {
    grade: 3,
    label: '3rd grade',
    shortLabel: '3rd',
    cogatLevel: '9',
    mockLength: {
      'verbal-analogy': 22,
      'sentence-completion': 20,
      'verbal-classification': 20,
      'number-analogy': 18,
      'number-puzzle': 16,
      'number-series': 18,
      'figure-matrix': 22,
      'paper-folding': 16,
      'figure-classification': 22,
    },
    minutesPerPart: 10,
  },
  4: {
    grade: 4,
    label: '4th grade',
    shortLabel: '4th',
    cogatLevel: '10',
    mockLength: {
      'verbal-analogy': 22,
      'sentence-completion': 20,
      'verbal-classification': 20,
      'number-analogy': 18,
      'number-puzzle': 16,
      'number-series': 18,
      'figure-matrix': 22,
      'paper-folding': 16,
      'figure-classification': 22,
    },
    minutesPerPart: 10,
  },
}

export const GRADES: Grade[] = [0, 1, 2, 3, 4]

/** Grades 3 and up read their own verbal questions and work with written numbers. */
export const isReadingLevel = (grade: Grade) => grade >= 3

export function mockLengthFor(grade: Grade, subType: SubType): number {
  return LEVELS[grade].mockLength[subType] ?? 12
}
