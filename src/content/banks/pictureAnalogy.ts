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
  { pairA: ['🐻', '🍯'], pairCStart: '🐿️', correct: '🌰', distractors: ['🌳', '🍯', '🐦'], relation: 'likes to eat' },
  { pairA: ['📖', '📄'], pairCStart: '🌳', correct: '🍃', distractors: ['🍎', '📄', '🪵'], relation: 'is made of many' },
  { pairA: ['🏥', '🩺'], pairCStart: '🏫', correct: '✏️', distractors: ['🚌', '🩺', '🏠'], relation: 'used inside' },
  { pairA: ['🐢', '🐇'], pairCStart: '🐌', correct: '🐆', distractors: ['🐛', '🐚', '🐢'], relation: 'slow : fast' },
  { pairA: ['🪣', '💧'], pairCStart: '🧺', correct: '👕', distractors: ['🧼', '💧', '🪥'], relation: 'holds' },
  { pairA: ['🍎', '🌳'], pairCStart: '🥥', correct: '🌴', distractors: ['🏝️', '🌳', '🌊'], relation: 'grows on' },
  { pairA: ['🥛', '🧈'], pairCStart: '🍎', correct: '🧃', distractors: ['🍏', '🧈', '🥧'], relation: 'made into' },
  { pairA: ['🧱', '🏠'], pairCStart: '🪵', correct: '🪑', distractors: ['🌳', '🏠', '🪓'], relation: 'used to make' },
  { pairA: ['🌰', '🌳'], pairCStart: '🥚', correct: '🐓', distractors: ['🍳', '🌳', '🧺'], relation: 'grows into' },
  { pairA: ['❄️', '🛷'], pairCStart: '🌊', correct: '🏄', distractors: ['🐟', '🛷', '🏖️'], relation: 'fun on' },
  { pairA: ['⛸️', '🧊'], pairCStart: '🛶', correct: '🌊', distractors: ['🎣', '🧊', '🏔️'], relation: 'used on' },
  { pairA: ['🛏️', '😴'], pairCStart: '🍽️', correct: '😋', distractors: ['🥄', '😴', '🛁'], relation: 'for' },
  { pairA: ['🐦', '🐛'], pairCStart: '🐼', correct: '🎋', distractors: ['🌳', '🐛', '🐻'], relation: 'eats' },
  { pairA: ['🌱', '💧'], pairCStart: '🔥', correct: '🪵', distractors: ['🧯', '💧', '🌡️'], relation: 'needs' },
  { pairA: ['🥚', '🐔'], pairCStart: '🥛', correct: '🐄', distractors: ['🧀', '🐔', '🐖'], relation: 'comes from' },
  { pairA: ['📺', '👀'], pairCStart: '📻', correct: '👂', distractors: ['🎵', '👀', '👄'], relation: 'enjoyed with' },
  { pairA: ['🧂', '🍟'], pairCStart: '🍯', correct: '🥞', distractors: ['🐝', '🍟', '🥛'], relation: 'goes on' },
  { pairA: ['🔺', '3️⃣'], pairCStart: '🟥', correct: '4️⃣', distractors: ['3️⃣', '5️⃣', '2️⃣'], relation: 'number of sides' },
  { pairA: ['🐕', '4️⃣'], pairCStart: '🐔', correct: '2️⃣', distractors: ['4️⃣', '6️⃣', '8️⃣'], relation: 'number of legs' },
  { pairA: ['🍓', '🔴'], pairCStart: '🍌', correct: '🟡', distractors: ['🔴', '🟢', '🟤'], relation: 'color' },
  { pairA: ['👶', '🍼'], pairCStart: '🐱', correct: '🥛', distractors: ['🐟', '🍼', '🧶'], relation: 'drinks' },
  { pairA: ['🎣', '🐟'], pairCStart: '🕸️', correct: '🪰', distractors: ['🕷️', '🐟', '🍃'], relation: 'catches' },
  { pairA: ['➕', '➖'], pairCStart: '✔️', correct: '❌', distractors: ['⭕', '➖', '❓'], relation: 'opposite' },
  { pairA: ['🔧', '🚗'], pairCStart: '🩹', correct: '🤕', distractors: ['🏥', '🚗', '💊'], relation: 'fixes' },
  { pairA: ['🎺', '👄'], pairCStart: '🎹', correct: '✋', distractors: ['🎵', '👄', '🦶'], relation: 'played with' },
  { pairA: ['🐧', '🧊'], pairCStart: '🐒', correct: '🌴', distractors: ['🍌', '🧊', '🦍'], relation: 'lives among' },
  { pairA: ['⛵', '🌬️'], pairCStart: '🚲', correct: '🦵', distractors: ['🛞', '🌬️', '🔋'], relation: 'moved by' },
  { pairA: ['🍿', '🎬'], pairCStart: '🎂', correct: '🎉', distractors: ['🕯️', '🎬', '🍰'], relation: 'enjoyed at' },
  { pairA: ['👀', '2️⃣'], pairCStart: '👃', correct: '1️⃣', distractors: ['2️⃣', '3️⃣', '4️⃣'], relation: 'how many you have' },
  { pairA: ['🍃', '🟢'], pairCStart: '☀️', correct: '🟡', distractors: ['🟢', '🟠', '🔴'], relation: 'color' },
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
