import type { Grade, SubType } from './types'

export interface LevelInfo {
  grade: Grade
  label: string
  cogatLevel: number
  // Approximate number of items on each real subtest at this level.
  mockLength: Record<SubType, number>
}

export const LEVELS: Record<Grade, LevelInfo> = {
  1: {
    grade: 1,
    label: '1st grade',
    cogatLevel: 7,
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
  },
  2: {
    grade: 2,
    label: '2nd grade',
    cogatLevel: 8,
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
  },
}

export const GRADES: Grade[] = [1, 2]
