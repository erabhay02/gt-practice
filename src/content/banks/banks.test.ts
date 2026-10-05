import { describe, expect, it } from 'vitest'
import { buildPictureAnalogyBank } from './pictureAnalogy'
import { buildPictureClassificationBank } from './pictureClassification'
import { buildSentenceCompletionBank } from './sentenceCompletion'
import { buildSentenceReadingBank } from './sentenceReading'
import { buildVerbalAnalogyBank } from './verbalAnalogy'
import { buildVerbalClassificationBank } from './verbalClassification'
import type { ContentSpec, Question } from '../types'

const BANKS: [string, Question[], number][] = [
  ['picture-analogy (2nd grade)', buildPictureAnalogyBank(2), 60],
  ['picture-classification (2nd grade)', buildPictureClassificationBank(2), 60],
  ['sentence-completion (2nd grade)', buildSentenceCompletionBank(2), 60],
  ['picture-analogy (1st grade)', buildPictureAnalogyBank(1), 40],
  ['picture-classification (1st grade)', buildPictureClassificationBank(1), 40],
  ['sentence-completion (1st grade)', buildSentenceCompletionBank(1), 40],
  ['picture-analogy (Kindergarten)', buildPictureAnalogyBank(0), 25],
  ['picture-classification (Kindergarten)', buildPictureClassificationBank(0), 25],
  ['sentence-completion (Kindergarten)', buildSentenceCompletionBank(0), 25],
  ['verbal-analogy (3rd grade)', buildVerbalAnalogyBank(3), 30],
  ['verbal-classification (3rd grade)', buildVerbalClassificationBank(3), 30],
  ['sentence-completion (3rd grade)', buildSentenceReadingBank(3), 30],
  ['verbal-analogy (4th grade)', buildVerbalAnalogyBank(4), 50],
  ['verbal-classification (4th grade)', buildVerbalClassificationBank(4), 50],
  ['sentence-completion (4th grade)', buildSentenceReadingBank(4), 50],
]

const val = (c: ContentSpec) => (c.kind === 'emoji' || c.kind === 'word' ? c.value : JSON.stringify(c))

describe.each(BANKS)('%s bank', (_name, bank, minSize) => {
  it(`has at least ${minSize} questions with unique ids`, () => {
    expect(bank.length).toBeGreaterThanOrEqual(minSize)
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length)
  })

  it('every question has 4 different choices and exactly one correct', () => {
    for (const q of bank) {
      expect(q.choices).toHaveLength(4)
      expect(new Set(q.choices.map((c) => val(c.content))).size).toBe(4)
      expect(q.choices.filter((c) => c.isCorrect)).toHaveLength(1)
    }
  })

  it('the correct answer never repeats a picture or word already shown in the prompt', () => {
    for (const q of bank) {
      const shown = new Set((q.promptVisual ?? []).flat().map(val))
      const correct = val(q.choices.find((c) => c.isCorrect)!.content)
      expect(shown.has(correct), `${q.id}: answer ${correct} is in the prompt`).toBe(false)
    }
  })

  it('has no duplicate questions', () => {
    const keys = bank.map((q) => q.promptAudioText + (q.promptVisual ?? []).flat().map(val).join(''))
    expect(new Set(keys).size).toBe(keys.length)
  })
})

describe('reading-level sentences', () => {
  it('each sentence has exactly one blank', () => {
    for (const grade of [3, 4] as const) {
      for (const q of buildSentenceReadingBank(grade)) {
        const cell = q.promptVisual![0][0]
        expect(cell.kind).toBe('sentence')
        if (cell.kind === 'sentence') expect(cell.value.split('___')).toHaveLength(2)
      }
    }
  })

  it('3rd grade gets a subset of the 4th-grade items (same ids)', () => {
    for (const build of [buildVerbalAnalogyBank, buildVerbalClassificationBank, buildSentenceReadingBank]) {
      const g4 = new Set(build(4).map((q) => q.id))
      expect(build(3).every((q) => g4.has(q.id))).toBe(true)
    }
  })
})

describe('Kindergarten picture banks', () => {
  it('have no NOT questions', () => {
    expect(buildSentenceCompletionBank(0).some((q) => q.promptAudioText.includes('NOT'))).toBe(false)
  })

  it('include items written just for Kindergarten', () => {
    for (const build of [buildPictureAnalogyBank, buildPictureClassificationBank, buildSentenceCompletionBank]) {
      const older = new Set([...build(1), ...build(2)].map((q) => q.id))
      const kOnly = build(0).filter((q) => !older.has(q.id))
      expect(kOnly.length).toBeGreaterThan(5)
    }
  })
})
