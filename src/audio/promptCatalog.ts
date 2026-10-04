import { buildPictureAnalogyBank } from '../content/banks/pictureAnalogy'
import { buildPictureClassificationBank } from '../content/banks/pictureClassification'
import { buildSentenceCompletionBank } from '../content/banks/sentenceCompletion'
import { generateFigureClassificationQuestion } from '../content/generators/classificationGenerator'
import { generateMatrixQuestion } from '../content/generators/matrixGenerator'
import {
  generateNumberAnalogyQuestion,
  generateNumberPuzzleQuestion,
  generateNumberSeriesQuestion,
} from '../content/generators/numberGenerators'
import { generatePaperFoldingQuestion } from '../content/generators/paperFoldingGenerator'
import type { Difficulty, Grade, Question } from '../content/types'
import { normalizeSpokenText } from './clipId'

export const SOUND_CHECK_TEXT = 'This is a sound check. Which one can fly, but is not a bird?'

const GENERATORS: ((d: Difficulty, seed: number, grade: Grade) => Question)[] = [
  generateMatrixQuestion,
  generateFigureClassificationQuestion,
  generatePaperFoldingQuestion,
  generateNumberAnalogyQuestion,
  generateNumberPuzzleQuestion,
  generateNumberSeriesQuestion,
]

// Generated prompts come from a handful of templates; sampling many seeds
// reaches every variant. A coverage test fails if a new one has no recording.
const SEEDS_PER_DIFFICULTY = 1500

/** Every sentence the app can read aloud. */
export function allSpokenTexts(): string[] {
  const texts = new Set<string>([SOUND_CHECK_TEXT])
  for (const grade of [1, 2] as const) {
    for (const bank of [buildPictureAnalogyBank(grade), buildPictureClassificationBank(grade), buildSentenceCompletionBank(grade)]) {
      for (const q of bank) texts.add(q.promptAudioText)
    }
    for (const generate of GENERATORS) {
      for (const d of [1, 2, 3] as const) {
        for (let seed = 1; seed <= SEEDS_PER_DIFFICULTY; seed++) texts.add(generate(d, seed, grade).promptAudioText)
      }
    }
  }
  return [...texts].map(normalizeSpokenText).sort()
}
