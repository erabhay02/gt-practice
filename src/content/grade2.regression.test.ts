/// <reference types="node" />
import { createHash } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import { buildPictureAnalogyBank } from './banks/pictureAnalogy'
import { buildPictureClassificationBank } from './banks/pictureClassification'
import { buildSentenceCompletionBank } from './banks/sentenceCompletion'
import { generateFigureClassificationQuestion } from './generators/classificationGenerator'
import { generateMatrixQuestion } from './generators/matrixGenerator'
import {
  generateNumberAnalogyQuestion,
  generateNumberPuzzleQuestion,
  generateNumberSeriesQuestion,
} from './generators/numberGenerators'
import { generatePaperFoldingQuestion } from './generators/paperFoldingGenerator'
import type { Difficulty, Grade, Question } from './types'

// Fingerprints of the 2nd-grade (CogAT Level 8) content, recorded before 1st
// grade was added. 1st-grade work must not change anything a 2nd grader sees;
// update these only for an intentional 2nd-grade change.
const EXPECTED = {
  generateMatrixQuestion: '60e54b912812d0dd',
  generateFigureClassificationQuestion: '0d0fcc6c5a8f2069',
  generatePaperFoldingQuestion: 'b3119ad77717d142',
  generateNumberAnalogyQuestion: 'e4e81929466332a6',
  generateNumberPuzzleQuestion: 'dcafafff381f5ec8',
  generateNumberSeriesQuestion: 'bc9b85538b9e829e',
  buildPictureAnalogyBank: 'a53860713631ee66',
  buildPictureClassificationBank: '6ac87d47a7342a87',
  buildSentenceCompletionBank: '9562f2f454f9209c',
}

type Gen = (d: Difficulty, seed: number, grade?: Grade) => Question
const GENERATORS: Record<string, Gen> = {
  generateMatrixQuestion,
  generateFigureClassificationQuestion,
  generatePaperFoldingQuestion,
  generateNumberAnalogyQuestion,
  generateNumberPuzzleQuestion,
  generateNumberSeriesQuestion,
}
const BANKS: Record<string, (grade?: Grade) => Question[]> = {
  buildPictureAnalogyBank,
  buildPictureClassificationBank,
  buildSentenceCompletionBank,
}

describe('2nd-grade content is unchanged', () => {
  for (const [name, generate] of Object.entries(GENERATORS)) {
    it(name, () => {
      const h = createHash('sha256')
      for (const d of [1, 2, 3] as const) for (let s = 1; s <= 300; s++) h.update(JSON.stringify(generate(d, s, 2)))
      expect(h.digest('hex').slice(0, 16)).toBe(EXPECTED[name as keyof typeof EXPECTED])
    })
  }
  for (const [name, build] of Object.entries(BANKS)) {
    it(name, () => {
      const hash = createHash('sha256').update(JSON.stringify(build(2))).digest('hex').slice(0, 16)
      expect(hash).toBe(EXPECTED[name as keyof typeof EXPECTED])
    })
  }
})
