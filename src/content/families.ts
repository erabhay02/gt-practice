import type { Grade, TestFamily } from './types'

export interface FamilyInfo {
  family: TestFamily
  // Short name used everywhere in the UI.
  name: string
  // "a CogAT score", "an OLSAT score" (said as letters: "en-en-ay-tee").
  article: 'a' | 'an'
  fullName: string
  // One line for the child form, so a parent can recognize the test.
  description: string
  // Level for each grade on the real test.
  levels: Record<Grade, string>
  // Total testing time on the real test when it is one timed sitting.
  totalMinutes: number | null
  // Parent-facing: what a real score report looks like.
  scoreExplainer: string
}

// Level-to-grade mappings: CogAT from Riverside's level table; NNAT3 from
// Pearson's product listing (A=K, B=1, C=2, D=3–4, E=5–6); OLSAT from
// publicly available guides (A=K, B=1, C=2, D=3, E=4–5, F=6–8).
export const FAMILIES: Record<TestFamily, FamilyInfo> = {
  cogat: {
    family: 'cogat',
    name: 'CogAT',
    article: 'a',
    fullName: 'Cognitive Abilities Test',
    description: 'Verbal, number and shape reasoning (the most common school test)',
    levels: { 0: '5/6', 1: '7', 2: '8', 3: '9', 4: '10', 5: '11', 6: '12' },
    totalMinutes: null,
    scoreExplainer:
      "The real test doesn't report a percentage correct. Schools get back a Standard Age Score (100 is typical for a child's age) and an Age Percentile Rank from 1 to 99 — a percentile rank of 70 means a child did as well as or better than 70% of other kids the same age nationally.",
  },
  nnat3: {
    family: 'nnat3',
    name: 'NNAT3',
    article: 'an',
    fullName: 'Naglieri Nonverbal Ability Test',
    description: 'Shape and pattern puzzles only, no words or numbers',
    levels: { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'D', 5: 'E', 6: 'E' },
    totalMinutes: 30,
    scoreExplainer:
      "The real test doesn't report a percentage correct. Schools get back a Naglieri Ability Index (100 is typical for a child's age) and a percentile rank from 1 to 99 — a percentile rank of 70 means a child did as well as or better than 70% of other kids the same age.",
  },
  olsat: {
    family: 'olsat',
    name: 'OLSAT',
    article: 'an',
    fullName: 'Otis-Lennon School Ability Test',
    description: 'Listening, word, picture and number reasoning',
    levels: { 0: 'A', 1: 'B', 2: 'C', 3: 'D', 4: 'E', 5: 'E', 6: 'F' },
    totalMinutes: null,
    scoreExplainer:
      "The real test doesn't report a percentage correct. Schools get back a School Ability Index (100 is typical for a child's age) and a percentile rank from 1 to 99 — a percentile rank of 70 means a child did as well as or better than 70% of other students the same age.",
  },
}

export const TEST_FAMILIES: TestFamily[] = ['cogat', 'nnat3', 'olsat']

/** "CogAT Level 7", "NNAT3 Level B". */
export const levelName = (family: TestFamily, grade: Grade) => `${FAMILIES[family].name} Level ${FAMILIES[family].levels[grade]}`

/** Profiles saved before test families existed are CogAT. */
export const familyOf = (p: { testFamily?: TestFamily }): TestFamily => p.testFamily ?? 'cogat'
