import type { Grade, SubType } from './types'

export interface LevelInfo {
  grade: Grade
  label: string
  // Short form for tight spots ("K", "3rd").
  shortLabel: string
  cogatLevel: string
  // Items on each real CogAT subtest at this level (Riverside's published
  // Form 7 table: "CogAT testing time, number of items per subtest").
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
      'picture-analogy': 14,
      'sentence-completion': 14,
      'picture-classification': 14,
      'number-analogy': 14,
      'number-puzzle': 10,
      'number-series': 14,
      'figure-matrix': 14,
      'paper-folding': 10,
      'figure-classification': 14,
    },
    minutesPerPart: null,
  },
  1: {
    grade: 1,
    label: '1st grade',
    shortLabel: '1st',
    cogatLevel: '7',
    mockLength: {
      'picture-analogy': 16,
      'sentence-completion': 16,
      'picture-classification': 16,
      'number-analogy': 16,
      'number-puzzle': 12,
      'number-series': 16,
      'figure-matrix': 16,
      'paper-folding': 12,
      'figure-classification': 16,
    },
    minutesPerPart: null,
  },
  2: {
    grade: 2,
    label: '2nd grade',
    shortLabel: '2nd',
    cogatLevel: '8',
    mockLength: {
      'picture-analogy': 18,
      'sentence-completion': 18,
      'picture-classification': 18,
      'number-analogy': 18,
      'number-puzzle': 14,
      'number-series': 18,
      'figure-matrix': 18,
      'paper-folding': 16,
      'figure-classification': 18,
    },
    minutesPerPart: null,
  },
  // Levels 9 through 12 share the same subtests and 10-minute timed parts;
  // Level 9 has 22 verbal analogies and 20 figure items, Levels 10–17/18 have
  // 24 and 22 (Riverside's published item table).
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
      'figure-matrix': 20,
      'paper-folding': 16,
      'figure-classification': 20,
    },
    minutesPerPart: 10,
  },
  4: {
    grade: 4,
    label: '4th grade',
    shortLabel: '4th',
    cogatLevel: '10',
    mockLength: {
      'verbal-analogy': 24,
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
  5: {
    grade: 5,
    label: '5th grade',
    shortLabel: '5th',
    cogatLevel: '11',
    mockLength: {
      'verbal-analogy': 24,
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
  6: {
    grade: 6,
    label: '6th grade',
    shortLabel: '6th',
    cogatLevel: '12',
    mockLength: {
      'verbal-analogy': 24,
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

export const GRADES: Grade[] = [0, 1, 2, 3, 4, 5, 6]

/** Grades 3 and up read their own verbal questions and work with written numbers. */
export const isReadingLevel = (grade: Grade) => grade >= 3

export function mockLengthFor(grade: Grade, subType: SubType): number {
  return LEVELS[grade].mockLength[subType] ?? 12
}
