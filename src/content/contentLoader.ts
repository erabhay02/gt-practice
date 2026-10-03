import { generateMatrixQuestion } from './generators/matrixGenerator'
import { generateFigureClassificationQuestion } from './generators/classificationGenerator'
import { generatePaperFoldingQuestion } from './generators/paperFoldingGenerator'
import {
  generateNumberAnalogyQuestion,
  generateNumberPuzzleQuestion,
  generateNumberSeriesQuestion,
} from './generators/numberGenerators'
import { buildPictureClassificationBank } from './banks/pictureClassification'
import { buildPictureAnalogyBank } from './banks/pictureAnalogy'
import { buildSentenceCompletionBank } from './banks/sentenceCompletion'
import { randomSeed, shuffle, mulberry32 } from './generators/rng'
import type { Difficulty, Domain, Question, SubType } from './types'

const BANKS: Partial<Record<SubType, Question[]>> = {
  'picture-classification': buildPictureClassificationBank(),
  'picture-analogy': buildPictureAnalogyBank(),
  'sentence-completion': buildSentenceCompletionBank(),
}

const GENERATORS: Partial<Record<SubType, (d: Difficulty, seed: number) => Question>> = {
  'figure-matrix': generateMatrixQuestion,
  'figure-classification': generateFigureClassificationQuestion,
  'paper-folding': generatePaperFoldingQuestion,
  'number-analogy': generateNumberAnalogyQuestion,
  'number-puzzle': generateNumberPuzzleQuestion,
  'number-series': generateNumberSeriesQuestion,
}

// Authored items list the correct answer first; shuffle on every serve so the
// answer position never becomes a pattern.
function withShuffledChoices(q: Question): Question {
  const rng = mulberry32(randomSeed())
  return { ...q, choices: shuffle(rng, q.choices) }
}

// Prefers items not in `excludeIds` (recently shown) so a small authored
// bank doesn't repeat the same questions across back-to-back sessions.
// Falls back to the full bank once the unseen pool runs short.
function pickFromBank(bank: Question[], count: number, excludeIds: string[]): Question[] {
  const rng = mulberry32(randomSeed())
  const excluded = new Set(excludeIds)
  const unseen = shuffle(rng, bank.filter((q) => !excluded.has(q.id)))
  const picked =
    unseen.length >= count
      ? unseen.slice(0, count)
      : [...unseen, ...shuffle(rng, bank.filter((q) => !unseen.includes(q))).slice(0, count - unseen.length)]
  return picked.map(withShuffledChoices)
}

/**
 * Single access point for question content. Keeping every subtype behind this
 * function is what lets a future Level-9 (text-based) content set drop in
 * without touching any UI/session/progress code.
 */
export function getQuestionPool(
  subType: SubType,
  difficulty: Difficulty,
  count: number,
  excludeIds: string[] = [],
): Question[] {
  const bank = BANKS[subType]
  if (bank) return pickFromBank(bank, count, excludeIds)

  const generate = GENERATORS[subType]
  if (!generate) throw new Error(`No content available for subtype: ${subType}`)
  return Array.from({ length: count }, () => generate(difficulty, randomSeed()))
}

/**
 * A real subtest runs easy → hard. Splits `count` into thirds at
 * difficulty 1, 2, 3 (authored banks ignore difficulty).
 */
export function getRampedQuestions(subType: SubType, count: number, excludeIds: string[] = []): Question[] {
  if (BANKS[subType]) return getQuestionPool(subType, 1, count, excludeIds)
  const third = Math.floor(count / 3)
  return [
    ...getQuestionPool(subType, 1, third),
    ...getQuestionPool(subType, 2, third),
    ...getQuestionPool(subType, 3, count - 2 * third),
  ]
}

export interface SubtestInfo {
  domain: Domain
  subType: SubType
  label: string
  // Approximate number of items on the real Level 8 subtest.
  realLength: number
  shortDescription: string
}

export const AVAILABLE_SUBTYPES: SubtestInfo[] = [
  { domain: 'verbal', subType: 'picture-analogy', label: 'Picture Analogies', realLength: 16, shortDescription: 'A goes with B, so C goes with ?' },
  { domain: 'verbal', subType: 'sentence-completion', label: 'Sentence Completion', realLength: 16, shortDescription: 'Listen, then pick the picture' },
  { domain: 'verbal', subType: 'picture-classification', label: 'Picture Classification', realLength: 16, shortDescription: 'Which one belongs with the three?' },
  { domain: 'quantitative', subType: 'number-analogy', label: 'Number Analogies', realLength: 16, shortDescription: 'How do the amounts change?' },
  { domain: 'quantitative', subType: 'number-puzzle', label: 'Number Puzzles', realLength: 14, shortDescription: 'Find the missing number' },
  { domain: 'quantitative', subType: 'number-series', label: 'Number Series', realLength: 16, shortDescription: 'Abacus bead patterns' },
  { domain: 'nonverbal', subType: 'figure-matrix', label: 'Figure Matrices', realLength: 16, shortDescription: 'Shape A changes to B, so C changes to ?' },
  { domain: 'nonverbal', subType: 'paper-folding', label: 'Paper Folding', realLength: 14, shortDescription: 'Fold, punch, unfold' },
  { domain: 'nonverbal', subType: 'figure-classification', label: 'Figure Classification', realLength: 16, shortDescription: 'Which shape belongs with the three?' },
]

export const BATTERIES: { domain: Domain; label: string }[] = [
  { domain: 'verbal', label: 'Verbal' },
  { domain: 'quantitative', label: 'Quantitative' },
  { domain: 'nonverbal', label: 'Nonverbal' },
]
