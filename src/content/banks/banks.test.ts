import { describe, expect, it } from 'vitest'
import { buildPictureAnalogyBank } from './pictureAnalogy'
import { buildPictureClassificationBank } from './pictureClassification'
import { buildSentenceCompletionBank } from './sentenceCompletion'
import type { ContentSpec, Question } from '../types'

const BANKS: [string, Question[], number][] = [
  ['picture-analogy (2nd grade)', buildPictureAnalogyBank(2), 60],
  ['picture-classification (2nd grade)', buildPictureClassificationBank(2), 60],
  ['sentence-completion (2nd grade)', buildSentenceCompletionBank(2), 60],
  ['picture-analogy (1st grade)', buildPictureAnalogyBank(1), 40],
  ['picture-classification (1st grade)', buildPictureClassificationBank(1), 40],
  ['sentence-completion (1st grade)', buildSentenceCompletionBank(1), 40],
]

const val = (c: ContentSpec) => (c.kind === 'emoji' ? c.value : JSON.stringify(c))

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

  it('the correct answer never repeats a picture already shown in the prompt', () => {
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
