import type { ContentSpec, Question } from '../types'

const emoji = (value: string): ContentSpec => ({ kind: 'emoji', value })

interface RawItem {
  pairA: [string, string]
  pairCStart: string
  correct: string
  // Plausible traps: things related to the bottom-left picture in the wrong
  // way, or a copy of the top-right picture.
  distractors: [string, string, string]
  relation: string
}

const RAW_ITEMS: RawItem[] = [
  { pairA: ['🐯', '🥩'], pairCStart: '🐐', correct: '🌿', distractors: ['🥛', '🥩', '🐑'], relation: 'eats' },
  { pairA: ['🐦', '🪹'], pairCStart: '🕷️', correct: '🕸️', distractors: ['🐜', '🪹', '🌳'], relation: 'home it builds' },
  { pairA: ['🐄', '🥛'], pairCStart: '🐔', correct: '🥚', distractors: ['🐣', '🥛', '🌽'], relation: 'gives us' },
  { pairA: ['🦶', '👟'], pairCStart: '✋', correct: '🧤', distractors: ['🧦', '✏️', '👟'], relation: 'worn on' },
  { pairA: ['🪚', '🪵'], pairCStart: '✂️', correct: '📄', distractors: ['✏️', '🪵', '📦'], relation: 'cuts' },
  { pairA: ['☀️', '🕶️'], pairCStart: '🌧️', correct: '☂️', distractors: ['🌈', '🕶️', '❄️'], relation: 'protects from' },
  { pairA: ['🐟', '🌊'], pairCStart: '🐪', correct: '🏜️', distractors: ['🌴', '🌊', '🐎'], relation: 'lives in' },
  { pairA: ['🐣', '🐓'], pairCStart: '🐛', correct: '🦋', distractors: ['🐝', '🍃', '🐓'], relation: 'grows into' },
  { pairA: ['🌱', '🌳'], pairCStart: '👶', correct: '🧑', distractors: ['🍼', '🧸', '🌳'], relation: 'grows into' },
  { pairA: ['🥚', '🍳'], pairCStart: '🌽', correct: '🍿', distractors: ['🧈', '🍳', '🥕'], relation: 'cooked into' },
  { pairA: ['🐕', '🦴'], pairCStart: '🐒', correct: '🍌', distractors: ['🌴', '🦴', '🥕'], relation: 'likes to eat' },
  { pairA: ['🚒', '🔥'], pairCStart: '🚑', correct: '🤕', distractors: ['🏥', '🔥', '🚓'], relation: 'helps with' },
  { pairA: ['🥣', '🥄'], pairCStart: '🥩', correct: '🍴', distractors: ['🍽️', '🥄', '🧂'], relation: 'eaten with' },
  { pairA: ['🐘', '🐭'], pairCStart: '🐋', correct: '🐟', distractors: ['🦈', '🐭', '🌊'], relation: 'big : small' },
  { pairA: ['🍽️', '🧽'], pairCStart: '🦷', correct: '🪥', distractors: ['🧼', '🧽', '🍬'], relation: 'cleaned with' },
  { pairA: ['⬆️', '⬇️'], pairCStart: '⬅️', correct: '➡️', distractors: ['⬆️', '⬇️', '↙️'], relation: 'opposite' },
  { pairA: ['🚗', '⛽'], pairCStart: '💡', correct: '🔌', distractors: ['🕯️', '⛽', '🔦'], relation: 'needs to work' },
  { pairA: ['✏️', '📝'], pairCStart: '🖌️', correct: '🖼️', distractors: ['🎨', '📝', '🖍️'], relation: 'makes' },
  { pairA: ['👂', '🎵'], pairCStart: '👃', correct: '🌸', distractors: ['👀', '🎵', '🖐️'], relation: 'senses' },
  { pairA: ['🐑', '🧶'], pairCStart: '🌳', correct: '🪵', distractors: ['🍃', '🧶', '🪓'], relation: 'comes from' },
  { pairA: ['🏠', '🚪'], pairCStart: '🚗', correct: '🛞', distractors: ['⛽', '🚪', '🚌'], relation: 'part of' },
  { pairA: ['☁️', '🌧️'], pairCStart: '🐝', correct: '🍯', distractors: ['🌸', '🌧️', '🐞'], relation: 'makes' },
  { pairA: ['👓', '👀'], pairCStart: '🎧', correct: '👂', distractors: ['🎵', '👀', '👃'], relation: 'used with' },
  { pairA: ['🐭', '🧀'], pairCStart: '🐰', correct: '🥕', distractors: ['🕳️', '🧀', '🦊'], relation: 'likes to eat' },
  { pairA: ['🚂', '🛤️'], pairCStart: '🚗', correct: '🛣️', distractors: ['⛽', '🛤️', '🚦'], relation: 'travels on' },
  { pairA: ['🎃', '🍂'], pairCStart: '⛄', correct: '❄️', distractors: ['☀️', '🍂', '🧥'], relation: 'season' },
  { pairA: ['🐝', '🌸'], pairCStart: '🐄', correct: '🌾', distractors: ['🥛', '🌸', '🐖'], relation: 'gets food from' },
  { pairA: ['😀', '😢'], pairCStart: '👍', correct: '👎', distractors: ['👌', '✋', '😢'], relation: 'opposite' },
  { pairA: ['🌵', '🏜️'], pairCStart: '🌴', correct: '🏝️', distractors: ['🥥', '🏜️', '🌊'], relation: 'grows in' },
  { pairA: ['🎒', '📚'], pairCStart: '👛', correct: '🪙', distractors: ['💄', '📚', '👗'], relation: 'holds' },
]

export function buildPictureAnalogyBank(): Question[] {
  return RAW_ITEMS.map((item, i) => ({
    id: `picture-analogy-${i}`,
    domain: 'verbal',
    subType: 'picture-analogy',
    difficulty: 1,
    promptAudioText:
      'The two pictures in the top row go together in some way. Which picture goes with the picture in the bottom row in the same way?',
    promptVisual: [
      [emoji(item.pairA[0]), emoji(item.pairA[1])],
      [emoji(item.pairCStart), { kind: 'blank' }],
    ],
    choices: [item.correct, ...item.distractors].map((value, ci) => ({
      id: `c${ci}`,
      content: emoji(value),
      isCorrect: ci === 0,
    })),
    explanationAudioText: `How they go together: ${item.relation}.`,
    source: 'authored',
  }))
}
