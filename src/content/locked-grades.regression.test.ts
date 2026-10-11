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
    // generateMatrixQuestion and generateFigureClassificationQuestion updated
    // 2026-10-10 (Phase 5, accessibility): shapePalette.ts's COLORS swapped
    // to a colorblind-safe palette (the old one had a near-total blue/purple
    // collision and a hard green/amber collision under simulated CVD).
    generateMatrixQuestion: '33fa4bce2893bfe5',
    generateFigureClassificationQuestion: '534c162ee9f5ac7d',
    generatePaperFoldingQuestion: '8381f251f272c499',
    generateNumberAnalogyQuestion: '70ae83bf0890f84e',
    generateNumberPuzzleQuestion: '5c598799ffa873ae',
    generateNumberSeriesQuestion: '7230180a1c65041c',
    // buildPictureAnalogyBank updated 2026-10-10 (eight batches, completing Phase 1's
    // doubling target at 182 items): see pictureAnalogy.ts's "New batch" through
    // "Eighth new batch" comments for what changed each time.
    buildPictureAnalogyBank: '1c440644c107c60b',
    // buildPictureClassificationBank updated 2026-10-10 (six batches, exceeding Phase
    // 1's doubling target at 141 items; no change in the third round).
    buildPictureClassificationBank: 'eb9922d09a92464b',
    // buildSentenceCompletionBank updated 2026-10-10 (seven batches, completing Phase
    // 1's doubling target at 148 items), same pattern.
    buildSentenceCompletionBank: 'c4a0c378e2d3b7ff',
  },
  // Recorded before 1st grade was added.
  2: {
    // See the grade-1 comment above — same 2026-10-10 accessibility update.
    // generateNumberPuzzleQuestion also changed here (not at grade 1): its
    // algebra-symbol triangle/square colors were hardcoded to the two old
    // palette hexes directly, now updated to the new blue/red.
    generateMatrixQuestion: '7db79eec4b74c5ad',
    generateFigureClassificationQuestion: '217c461266fd92fa',
    generatePaperFoldingQuestion: 'b3119ad77717d142',
    generateNumberAnalogyQuestion: 'e4e81929466332a6',
    generateNumberPuzzleQuestion: '9caeaec1c800e9d5',
    generateNumberSeriesQuestion: 'bc9b85538b9e829e',
    // See the grade-1 comment above — same 2026-10-10 updates.
    buildPictureAnalogyBank: 'd71b1932fd6625da',
    buildPictureClassificationBank: '63ef5115f2254d9d',
    buildSentenceCompletionBank: 'ad90f0ee474363c6',
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
