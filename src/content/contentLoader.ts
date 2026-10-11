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
import { buildSentenceReadingBank } from './banks/sentenceReading'
import { buildVerbalAnalogyBank } from './banks/verbalAnalogy'
import { buildVerbalClassificationBank } from './banks/verbalClassification'
import {
  generatePatternCompletionQuestion,
  generateReasoningByAnalogyQuestion,
  generateSerialReasoningQuestion,
  generateSpatialVisualizationQuestion,
} from './generators/nnatGenerators'
import {
  generateArithmeticReasoningQuestion,
  generateFiguralSeriesQuestion,
  generateNumberMatrixQuestion,
} from './generators/olsatGenerators'
import { buildArithmeticPicturesBank, buildAuralReasoningBank, buildFollowingDirectionsBank } from './banks/olsatListening'
import { buildAntonymBank, buildLogicalSelectionBank, buildSentenceArrangementBank } from './banks/olsatVerbal'
import { generatedId, randomSeed, shuffle, mulberry32 } from './generators/rng'
import { FAMILIES, levelName } from './families'
import { LEVELS, isReadingLevel } from './levels'
import type { Difficulty, Domain, Grade, Question, SubType, TestFamily } from './types'

const bankSet = (grade: Grade): Partial<Record<SubType, Question[]>> =>
  isReadingLevel(grade)
    ? {
        'verbal-analogy': buildVerbalAnalogyBank(grade),
        'sentence-completion': buildSentenceReadingBank(grade),
        'verbal-classification': buildVerbalClassificationBank(grade),
        'antonyms': buildAntonymBank(grade),
        'logical-selection': buildLogicalSelectionBank(grade),
        'sentence-arrangement': buildSentenceArrangementBank(grade),
      }
    : {
        'picture-classification': buildPictureClassificationBank(grade),
        'picture-analogy': buildPictureAnalogyBank(grade),
        'sentence-completion': buildSentenceCompletionBank(grade),
        'following-directions': buildFollowingDirectionsBank(grade),
        'aural-reasoning': buildAuralReasoningBank(grade),
        // Read aloud with picture answers; readers get generated word problems.
        'arithmetic-reasoning': buildArithmeticPicturesBank(grade),
      }
const BANKS: Record<Grade, Partial<Record<SubType, Question[]>>> = {
  0: bankSet(0),
  1: bankSet(1),
  2: bankSet(2),
  3: bankSet(3),
  4: bankSet(4),
  5: bankSet(5),
  6: bankSet(6),
}

/**
 * CogAT Level 12 (6th grade) mixes some 3x3 figure matrices in with the 2x2
 * format ("some questions at Level 12" — Riverside product guide): one in three.
 */
function generateFigureMatrixForGrade(d: Difficulty, seed: number, grade: Grade): Question {
  if (grade < 6 || seed % 3 !== 0) return generateMatrixQuestion(d, seed, grade)
  return { ...generateReasoningByAnalogyQuestion(d, seed, grade), id: generatedId('figure-matrix', grade, d, seed), subType: 'figure-matrix' }
}

const GENERATORS: Partial<Record<SubType, (d: Difficulty, seed: number, grade: Grade) => Question>> = {
  'figure-matrix': generateFigureMatrixForGrade,
  'pattern-completion': generatePatternCompletionQuestion,
  'reasoning-by-analogy': generateReasoningByAnalogyQuestion,
  'serial-reasoning': generateSerialReasoningQuestion,
  'spatial-visualization': generateSpatialVisualizationQuestion,
  'figural-series': generateFiguralSeriesQuestion,
  'number-matrix': generateNumberMatrixQuestion,
  'arithmetic-reasoning': generateArithmeticReasoningQuestion,
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
 * function lets each level (picture-based K–2, reading-based 3–4) supply its
 * own content without touching session/progress code.
 */
export function getQuestionPool(
  subType: SubType,
  difficulty: Difficulty,
  count: number,
  excludeIds: string[] = [],
  grade: Grade = 2,
): Question[] {
  const bank = BANKS[grade][subType]
  if (bank) return pickFromBank(bank, count, excludeIds)

  const generate = GENERATORS[subType]
  if (!generate) throw new Error(`No content available for subtype: ${subType}`)
  return Array.from({ length: count }, () => generate(difficulty, randomSeed(), grade))
}

/**
 * A real subtest runs easy → hard. Splits `count` into thirds at
 * difficulty 1, 2, 3 (authored banks ignore difficulty).
 */
export function getRampedQuestions(
  subType: SubType,
  count: number,
  excludeIds: string[] = [],
  grade: Grade = 2,
): Question[] {
  if (BANKS[grade][subType]) return getQuestionPool(subType, 1, count, excludeIds, grade)
  const third = Math.floor(count / 3)
  return [
    ...getQuestionPool(subType, 1, third, [], grade),
    ...getQuestionPool(subType, 2, third, [], grade),
    ...getQuestionPool(subType, 3, count - 2 * third, [], grade),
  ]
}

export interface SubtestInfo {
  domain: Domain
  subType: SubType
  label: string
  icon: string
  shortDescription: string
  // How to solve this kind of question; read aloud after the mock-test example.
  tip: string
}

/** The nine picture-based parts used from Kindergarten through 2nd grade (Levels 5/6–8). */
export const AVAILABLE_SUBTYPES: SubtestInfo[] = [
  {
    domain: 'verbal', subType: 'picture-analogy', icon: '🔗', label: 'Picture Analogies',
    shortDescription: 'A goes with B, so C goes with ?',
    tip: 'First figure out how the two top pictures go together. Then find the picture that goes with the bottom picture in the very same way.',
  },
  {
    domain: 'verbal', subType: 'sentence-completion', icon: '👂', label: 'Sentence Completion',
    shortDescription: 'Listen, then pick the picture',
    tip: 'Listen to every word of the question, especially words like NOT and but. You can tap the speaker to hear it again.',
  },
  {
    domain: 'verbal', subType: 'picture-classification', icon: '🧺', label: 'Picture Classification',
    shortDescription: 'Which one belongs with the three?',
    tip: 'Think about how the three top pictures are all alike. Pick the one picture that is alike in that same way.',
  },
  {
    domain: 'quantitative', subType: 'number-analogy', icon: '🍎', label: 'Number Analogies',
    shortDescription: 'How do the amounts change?',
    tip: 'Count the top pictures. Did the number go up or down, and by how many? Make the same change to the bottom picture.',
  },
  {
    domain: 'quantitative', subType: 'number-puzzle', icon: '➕', label: 'Number Puzzles',
    shortDescription: 'Find the missing number',
    tip: 'Both sides of the equals sign must be the same amount. Try each answer in place of the question mark and check.',
  },
  {
    domain: 'quantitative', subType: 'number-series', icon: '🧮', label: 'Number Series',
    shortDescription: 'Abacus bead patterns',
    tip: 'Count the beads on each rod, left to right. Look for the pattern, like adding one each time or repeating, and continue it.',
  },
  {
    domain: 'nonverbal', subType: 'figure-matrix', icon: '🔷', label: 'Figure Matrices',
    shortDescription: 'Shape A changes to B, so C changes to ?',
    tip: 'Look at what changes from the first shape to the second: color, pattern, size, turning, or how many. Make the same changes to the bottom shape.',
  },
  {
    domain: 'nonverbal', subType: 'paper-folding', icon: '📄', label: 'Paper Folding',
    shortDescription: 'Fold, punch, unfold',
    tip: 'The hole goes through every layer. When you unfold, each fold makes a mirror copy of the hole on the other side of the fold line.',
  },
  {
    domain: 'nonverbal', subType: 'figure-classification', icon: '🔶', label: 'Figure Classification',
    shortDescription: 'Which shape belongs with the three?',
    tip: 'Find the one thing all three top shapes share, like the same shape, color, or pattern. Ignore the things that are different.',
  },
]

/** The nine parts at Levels 9–10 (3rd and 4th grade): reading and written numbers. */
export const READING_LEVEL_SUBTYPES: SubtestInfo[] = [
  {
    domain: 'verbal', subType: 'verbal-analogy', icon: '🔗', label: 'Verbal Analogies',
    shortDescription: 'Word A goes with B, so C goes with ?',
    tip: 'Say how the first two words go together in a sentence, like "a puppy grows into a dog." Then use the same sentence with the third word.',
  },
  {
    domain: 'verbal', subType: 'sentence-completion', icon: '📖', label: 'Sentence Completion',
    shortDescription: 'Pick the word that fits',
    tip: 'Read the whole sentence first. Try each word in the blank and pick the one that makes the sentence make sense. Watch for words like but, although and because.',
  },
  {
    domain: 'verbal', subType: 'verbal-classification', icon: '🗂️', label: 'Verbal Classification',
    shortDescription: 'Which word belongs with the three?',
    tip: 'Find what all three top words have in common, as exactly as you can. A word can be related but still not belong to the same group.',
  },
  {
    domain: 'quantitative', subType: 'number-analogy', icon: '🔢', label: 'Number Analogies',
    shortDescription: 'Find the rule for each pair',
    tip: 'Find one rule that turns the first number into the second in BOTH pairs, like add 5 or times 3. Then use it on the last number.',
  },
  {
    domain: 'quantitative', subType: 'number-puzzle', icon: '➕', label: 'Number Puzzles',
    shortDescription: 'Find the missing number',
    tip: 'Both sides of the equals sign must be the same amount. Work out the side you can, then find what makes the other side match.',
  },
  {
    domain: 'quantitative', subType: 'number-series', icon: '📈', label: 'Number Series',
    shortDescription: 'What comes next?',
    tip: 'Write down how much the numbers change each step. The change itself may follow a pattern, or two patterns may take turns.',
  },
  ...AVAILABLE_SUBTYPES.filter((s) => s.domain === 'nonverbal'),
]

/** The four NNAT3 item types (Levels A–E): all figural, no words or numbers. */
export const NNAT_SUBTYPES: SubtestInfo[] = [
  {
    domain: 'nonverbal', subType: 'pattern-completion', icon: '🧩', label: 'Pattern Completion',
    shortDescription: 'Find the missing piece',
    tip: 'Look at the colors all around the empty space. The right piece keeps the pattern going in every direction, so check that all of its edges match.',
  },
  {
    domain: 'nonverbal', subType: 'reasoning-by-analogy', icon: '🔀', label: 'Reasoning by Analogy',
    shortDescription: 'How do the shapes change?',
    tip: 'Find what changes as you go across a row and what changes as you go down a column. The missing picture follows both changes.',
  },
  {
    domain: 'nonverbal', subType: 'serial-reasoning', icon: '🔁', label: 'Serial Reasoning',
    shortDescription: 'Each row follows a pattern',
    tip: 'Each row and column uses the same few pictures in a different order. Find the picture that is still missing from the last row and the last column.',
  },
  {
    domain: 'nonverbal', subType: 'spatial-visualization', icon: '📐', label: 'Spatial Visualization',
    shortDescription: 'Put the pictures together',
    tip: 'Imagine sliding the first two pictures on top of each other and keep every line you would see. If the question says shared lines disappear, cross those lines out.',
  },
]

const info = (subType: SubType, overrides: Partial<SubtestInfo> = {}): SubtestInfo => {
  const base = [...AVAILABLE_SUBTYPES, ...READING_LEVEL_SUBTYPES, ...NNAT_SUBTYPES].find((s) => s.subType === subType)!
  return { ...base, ...overrides }
}

const OLSAT_ONLY: Record<'followingDirections' | 'auralReasoning' | 'arithmeticListen' | 'arithmeticRead' | 'figuralSeries' | 'antonyms' | 'arrangement' | 'logic' | 'numberMatrix', SubtestInfo> = {
  followingDirections: {
    domain: 'verbal', subType: 'following-directions', icon: '👂', label: 'Following Directions',
    shortDescription: 'Listen and find the right box',
    tip: 'Listen to every word. Words like above, below, between, first and last tell you exactly where things go.',
  },
  auralReasoning: {
    domain: 'verbal', subType: 'aural-reasoning', icon: '🤔', label: 'Aural Reasoning',
    shortDescription: 'Listen and think',
    tip: 'Listen to the whole question before you look. Think about each clue, then pick the picture that fits all of them.',
  },
  arithmeticListen: {
    domain: 'verbal', subType: 'arithmetic-reasoning', icon: '🍎', label: 'Arithmetic Reasoning',
    shortDescription: 'Listen to the story and solve it',
    tip: 'Picture the story in your head. Start with how many there are, then add or take away what happens.',
  },
  arithmeticRead: {
    domain: 'verbal', subType: 'arithmetic-reasoning', icon: '🧮', label: 'Arithmetic Reasoning',
    shortDescription: 'Solve the word problem',
    tip: 'Read the whole problem first. Find what it asks, then do each step in order and check that your answer makes sense.',
  },
  figuralSeries: {
    domain: 'nonverbal', subType: 'figural-series', icon: '➡️', label: 'Figural Series',
    shortDescription: 'Which shape comes next?',
    tip: 'Look at how each shape changes from one box to the next: turning, color, pattern or shape. Keep the same change going.',
  },
  antonyms: {
    domain: 'verbal', subType: 'antonyms', icon: '↔️', label: 'Antonyms',
    shortDescription: 'Find the opposite',
    tip: 'Watch out for words that mean the same thing. You want the word that means the opposite.',
  },
  arrangement: {
    domain: 'verbal', subType: 'sentence-arrangement', icon: '🔤', label: 'Sentence Arrangement',
    shortDescription: 'Put the words in order',
    tip: 'Find who or what the sentence is about and what happened. Build the whole sentence in your head before you choose its last word.',
  },
  logic: {
    domain: 'verbal', subType: 'logical-selection', icon: '✅', label: 'Logical Selection',
    shortDescription: 'What is always true?',
    tip: 'Many answers are often true. Pick the one that is true every single time, with no exceptions.',
  },
  numberMatrix: {
    domain: 'quantitative', subType: 'number-matrix', icon: '🔢', label: 'Number Matrix',
    shortDescription: 'Find the rule in each row',
    tip: 'Find one rule that works for both full rows, like adding the first two numbers. Then use it on the last row.',
  },
}

/** OLSAT Levels A–C (K–2): listening plus picture and figure reasoning. Level A has no picture analogies or pattern matrix. */
function olsatPrimary(grade: Grade): SubtestInfo[] {
  return [
    OLSAT_ONLY.followingDirections,
    OLSAT_ONLY.auralReasoning,
    OLSAT_ONLY.arithmeticListen,
    // OLSAT scores picture items as nonverbal (pictorial reasoning), unlike CogAT.
    info('picture-classification', { domain: 'nonverbal' }),
    ...(grade >= 1 ? [info('picture-analogy', { domain: 'nonverbal' })] : []),
    info('figure-classification', { label: 'Figural Classification' }),
    info('figure-matrix', { label: 'Figural Analogies' }),
    OLSAT_ONLY.figuralSeries,
    ...(grade >= 1 ? [info('serial-reasoning', { label: 'Pattern Matrix', icon: '🔳' })] : []),
  ]
}

/** OLSAT Levels D–F (3rd–6th): reading, figural and quantitative reasoning. */
const OLSAT_UPPER: SubtestInfo[] = [
  OLSAT_ONLY.antonyms,
  info('sentence-completion', { icon: '📖' }),
  OLSAT_ONLY.arrangement,
  OLSAT_ONLY.arithmeticRead,
  info('verbal-analogy'),
  info('verbal-classification'),
  OLSAT_ONLY.logic,
  info('figure-matrix', { label: 'Figural Analogies' }),
  info('serial-reasoning', { label: 'Pattern Matrix', icon: '🔳' }),
  OLSAT_ONLY.figuralSeries,
  { ...READING_LEVEL_SUBTYPES.find((s) => s.subType === 'number-series')! },
  info('number-analogy', { label: 'Numeric Inference', icon: '🔢', shortDescription: 'Find the rule' }),
  OLSAT_ONLY.numberMatrix,
]

// NNAT3: 48 items per level. Pearson doesn't publish the mix of item types, so
// this split is an estimate: younger levels lean on pattern completion, older
// ones on analogy, serial reasoning and spatial visualization.
const NNAT_MIX: Record<string, Partial<Record<SubType, number>>> = {
  A: { 'pattern-completion': 26, 'reasoning-by-analogy': 12, 'serial-reasoning': 6, 'spatial-visualization': 4 },
  B: { 'pattern-completion': 20, 'reasoning-by-analogy': 14, 'serial-reasoning': 8, 'spatial-visualization': 6 },
  C: { 'pattern-completion': 14, 'reasoning-by-analogy': 16, 'serial-reasoning': 10, 'spatial-visualization': 8 },
  D: { 'pattern-completion': 8, 'reasoning-by-analogy': 16, 'serial-reasoning': 12, 'spatial-visualization': 12 },
  E: { 'pattern-completion': 4, 'reasoning-by-analogy': 16, 'serial-reasoning': 14, 'spatial-visualization': 14 },
}

// OLSAT totals per level from public guides (A 40, B–C 60, D 64, E–F 72),
// split evenly between verbal and nonverbal (incl. quantitative) items. The
// split within each half is an estimate.
const OLSAT_MIX: Record<string, Partial<Record<SubType, number>>> = {
  A: { 'following-directions': 6, 'aural-reasoning': 5, 'arithmetic-reasoning': 5, 'picture-classification': 6, 'figure-classification': 6, 'figure-matrix': 6, 'figural-series': 6 },
  B: { 'following-directions': 10, 'aural-reasoning': 10, 'arithmetic-reasoning': 10, 'picture-classification': 5, 'picture-analogy': 5, 'figure-classification': 5, 'figure-matrix': 5, 'figural-series': 5, 'serial-reasoning': 5 },
  D: { 'antonyms': 5, 'sentence-completion': 5, 'sentence-arrangement': 4, 'arithmetic-reasoning': 5, 'verbal-analogy': 5, 'verbal-classification': 4, 'logical-selection': 4, 'figure-matrix': 6, 'serial-reasoning': 5, 'figural-series': 5, 'number-series': 6, 'number-analogy': 5, 'number-matrix': 5 },
  E: { 'antonyms': 6, 'sentence-completion': 5, 'sentence-arrangement': 5, 'arithmetic-reasoning': 5, 'verbal-analogy': 5, 'verbal-classification': 5, 'logical-selection': 5, 'figure-matrix': 6, 'serial-reasoning': 6, 'figural-series': 6, 'number-series': 6, 'number-analogy': 6, 'number-matrix': 6 },
}
OLSAT_MIX.C = OLSAT_MIX.B
OLSAT_MIX.F = OLSAT_MIX.E

export interface TestPlan {
  family: TestFamily
  // "CogAT Level 7", "NNAT3 Level B".
  levelName: string
  // In the order the real test gives them.
  parts: SubtestInfo[]
  mockLength: (subType: SubType) => number
  // A time limit per part (CogAT Levels 9+), or for the whole test (NNAT3).
  minutesPerPart: number | null
  totalMinutes: number | null
}

/** What a child practices: the parts, lengths and timing of their real test. */
export function testPlan(family: TestFamily, grade: Grade): TestPlan {
  const level = FAMILIES[family].levels[grade]
  const common = { family, levelName: levelName(family, grade), totalMinutes: FAMILIES[family].totalMinutes }
  if (family === 'nnat3') {
    return { ...common, parts: NNAT_SUBTYPES, mockLength: (s) => NNAT_MIX[level][s] ?? 0, minutesPerPart: null }
  }
  if (family === 'olsat') {
    return {
      ...common,
      parts: isReadingLevel(grade) ? OLSAT_UPPER : olsatPrimary(grade),
      mockLength: (s) => OLSAT_MIX[level][s] ?? 0,
      minutesPerPart: null,
    }
  }
  return {
    ...common,
    parts: isReadingLevel(grade) ? READING_LEVEL_SUBTYPES : AVAILABLE_SUBTYPES,
    mockLength: (s) => LEVELS[grade].mockLength[s] ?? 12,
    minutesPerPart: LEVELS[grade].minutesPerPart,
  }
}

/** The CogAT parts a child at this grade practices. */
export function subtypesForGrade(grade: Grade): SubtestInfo[] {
  return testPlan('cogat', grade).parts
}

const ALL_INFOS: SubtestInfo[] = [
  ...AVAILABLE_SUBTYPES,
  ...READING_LEVEL_SUBTYPES,
  ...NNAT_SUBTYPES,
  ...Object.values(OLSAT_ONLY),
]

/** Every distinct part across all tests (for the worksheet's part filter). */
export const ALL_SUBTYPES: SubType[] = [...new Set(ALL_INFOS.map((s) => s.subType))]

/** Label/tip for a part, even one this child's plan doesn't use (e.g. in old history). */
export function subtypeInfo(subType: SubType, grade: Grade, family: TestFamily = 'cogat'): SubtestInfo | undefined {
  return testPlan(family, grade).parts.find((s) => s.subType === subType)
    ?? subtypesForGrade(grade).find((s) => s.subType === subType)
    ?? ALL_INFOS.find((s) => s.subType === subType)
}

export const BATTERIES: { domain: Domain; label: string; kidLabel: string; icon: string }[] = [
  { domain: 'verbal', label: 'Verbal', kidLabel: 'Words', icon: '💬' },
  { domain: 'quantitative', label: 'Quantitative', kidLabel: 'Numbers', icon: '🔢' },
  { domain: 'nonverbal', label: 'Nonverbal', kidLabel: 'Shapes', icon: '🔷' },
]
