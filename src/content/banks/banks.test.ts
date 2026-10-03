import { describe, expect, it } from 'vitest'
import { buildPictureAnalogyBank } from './pictureAnalogy'
import { buildPictureClassificationBank } from './pictureClassification'
import { buildSentenceCompletionBank } from './sentenceCompletion'
import type { ContentSpec, Question } from '../types'

const BANKS: [string, Question[]][] = [
  ['picture-analogy', buildPictureAnalogyBank()],
  ['picture-classification', buildPictureClassificationBank()],
  ['sentence-completion', buildSentenceCompletionBank()],
]

const val = (c: ContentSpec) => (c.kind === 'emoji' ? c.value : JSON.stringify(c))

describe.each(BANKS)('%s bank', (_name, bank) => {
  it('has at least 60 questions with unique ids', () => {
    expect(bank.length).toBeGreaterThanOrEqual(60)
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
