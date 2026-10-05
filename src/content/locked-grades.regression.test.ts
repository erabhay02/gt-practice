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

// Fingerprints of the 1st-grade (CogAT Level 7) and 2nd-grade (Level 8)
// content. Work on other grades must not change anything these children see;
// update a value only for an intentional change to that grade.
const EXPECTED: Partial<Record<Grade, Record<string, string>>> = {
  // Recorded before Kindergarten and grades 3–4 were added.
  1: {
    generateMatrixQuestion: '9da2835630e197c6',
    generateFigureClassificationQuestion: '69dd40c6ade7b64e',
    generatePaperFoldingQuestion: '8381f251f272c499',
    generateNumberAnalogyQuestion: '70ae83bf0890f84e',
    generateNumberPuzzleQuestion: '5c598799ffa873ae',
    generateNumberSeriesQuestion: '7230180a1c65041c',
    buildPictureAnalogyBank: 'a16c629518005f87',
    buildPictureClassificationBank: 'c7a3d0057f03bc2d',
    buildSentenceCompletionBank: 'bfb4bf5ad8869b1e',
  },
  // Recorded before 1st grade was added.
  2: {
    generateMatrixQuestion: '60e54b912812d0dd',
    generateFigureClassificationQuestion: '0d0fcc6c5a8f2069',
    generatePaperFoldingQuestion: 'b3119ad77717d142',
    generateNumberAnalogyQuestion: 'e4e81929466332a6',
    generateNumberPuzzleQuestion: 'dcafafff381f5ec8',
    generateNumberSeriesQuestion: 'bc9b85538b9e829e',
    buildPictureAnalogyBank: 'a53860713631ee66',
    buildPictureClassificationBank: '6ac87d47a7342a87',
    buildSentenceCompletionBank: '9562f2f454f9209c',
  },
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

for (const grade of [1, 2] as const) {
  describe(`grade ${grade} content is unchanged`, () => {
    for (const [name, generate] of Object.entries(GENERATORS)) {
      it(name, () => {
        const h = createHash('sha256')
        for (const d of [1, 2, 3] as const) for (let s = 1; s <= 300; s++) h.update(JSON.stringify(generate(d, s, grade)))
        expect(h.digest('hex').slice(0, 16)).toBe(EXPECTED[grade]![name])
      })
    }
    for (const [name, build] of Object.entries(BANKS)) {
      it(name, () => {
        const hash = createHash('sha256').update(JSON.stringify(build(grade))).digest('hex').slice(0, 16)
        expect(hash).toBe(EXPECTED[grade]![name])
      })
    }
  })
}
