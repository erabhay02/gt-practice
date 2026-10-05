import type { ContentSpec, Grade, Question } from '../types'

const emoji = (value: string): ContentSpec => ({ kind: 'emoji', value })

interface RawItem {
  pairA: [string, string]
  pairCStart: string
  correct: string
  // Plausible traps: things related to the bottom-left picture in the wrong
  // way, or a copy of the top-right picture.
  distractors: [string, string, string]
  relation: string
  // Defaults: 1st + 2nd grade if the relation is simple enough (below), else 2nd only.
  // Kindergarten: see inGrade.
  grades?: Grade[]
}

// Connections a 1st grader can reason about; abstract ones (number of sides,
// "needs to work", "made into"...) stay 2nd grade.
const GRADE1_RELATIONS = new Set([
  'eats', 'likes to eat', 'home it builds', 'gives us', 'worn on', 'protects from', 'lives in', 'grows into',
  'big : small', 'travels on', 'part of', 'cooked into', 'eaten with', 'helps with', 'grows in', 'grows on',
  'color', 'lives among',
])

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
  // 1st grade only (CogAT Level 7): simple, concrete connections.
  { pairA: ['🐶', '🦴'], pairCStart: '🐱', correct: '🐟', distractors: ['🦴', '🧶', '🥕'], relation: 'likes to eat', grades: [1] },
  { pairA: ['🐦', '🪱'], pairCStart: '🐒', correct: '🍌', distractors: ['🪱', '🌴', '🎈'], relation: 'eats', grades: [1] },
  { pairA: ['🐻', '🌲'], pairCStart: '🐧', correct: '🧊', distractors: ['🌲', '🐟', '☀️'], relation: 'lives in', grades: [1] },
  { pairA: ['🍎', '🔴'], pairCStart: '🥦', correct: '🟢', distractors: ['🔴', '🟠', '🟣'], relation: 'color', grades: [1] },
  { pairA: ['🍊', '🟠'], pairCStart: '🍆', correct: '🟣', distractors: ['🟠', '🟢', '🔴'], relation: 'color', grades: [1] },
  { pairA: ['🌊', '🔵'], pairCStart: '🌻', correct: '🟡', distractors: ['🔵', '🟤', '🔴'], relation: 'color', grades: [1] },
  { pairA: ['🌳', '🌱'], pairCStart: '🐓', correct: '🐣', distractors: ['🥚', '🌱', '🦆'], relation: 'big one : baby one', grades: [1] },
  { pairA: ['🔥', '🧊'], pairCStart: '🍲', correct: '🍦', distractors: ['🔥', '🍕', '🥣'], relation: 'hot : cold', grades: [1] },
  { pairA: ['❄️', '🧤'], pairCStart: '☀️', correct: '🕶️', distractors: ['🧤', '🧣', '☂️'], relation: 'what to wear', grades: [1] },
  { pairA: ['👀', '👓'], pairCStart: '🦶', correct: '🧦', distractors: ['👓', '🧤', '🎩'], relation: 'worn on', grades: [1] },
  { pairA: ['✈️', '☁️'], pairCStart: '🚢', correct: '🌊', distractors: ['☁️', '🚗', '⚓'], relation: 'travels in', grades: [1] },
  { pairA: ['🔑', '🚪'], pairCStart: '🪥', correct: '🦷', distractors: ['🚪', '🧼', '🍬'], relation: 'used on', grades: [1] },
  { pairA: ['⚽', '⚪'], pairCStart: '📦', correct: '🟫', distractors: ['⚪', '🔺', '⭐'], relation: 'shape', grades: [1] },
  { pairA: ['🥄', '🥣'], pairCStart: '🍴', correct: '🍽️', distractors: ['🥣', '🍳', '🥤'], relation: 'used with', grades: [1] },
  { pairA: ['⛄', '❄️'], pairCStart: '🏖️', correct: '☀️', distractors: ['❄️', '🍂', '☔'], relation: 'goes with', grades: [1] },
  { pairA: ['🍪', '🥛'], pairCStart: '🍞', correct: '🧈', distractors: ['🥛', '🍳', '🍎'], relation: 'goes with', grades: [1] },
  { pairA: ['🐔', '🌽'], pairCStart: '🐻', correct: '🍯', distractors: ['🌽', '🐝', '🌲'], relation: 'likes to eat', grades: [1] },
  { pairA: ['🐿️', '🌳'], pairCStart: '🐟', correct: '🌊', distractors: ['🌳', '🎣', '🐚'], relation: 'lives in', grades: [1] },
  { pairA: ['🐣', '🥚'], pairCStart: '🦋', correct: '🐛', distractors: ['🥚', '🌸', '🐝'], relation: 'came from', grades: [1] },
  { pairA: ['⚽', '🦶'], pairCStart: '🏀', correct: '✋', distractors: ['🦶', '👂', '🥅'], relation: 'played with', grades: [1] },
  // Kindergarten only (CogAT Level 5/6): everyday things, one obvious connection.
  { pairA: ['🐶', '🦴'], pairCStart: '🐰', correct: '🥕', distractors: ['🦴', '🧀', '🐶'], relation: 'likes to eat', grades: [0] },
  { pairA: ['🐟', '🌊'], pairCStart: '🐦', correct: '🪹', distractors: ['🌊', '🐟', '🍎'], relation: 'lives in', grades: [0] },
  { pairA: ['🍌', '🟡'], pairCStart: '🍓', correct: '🔴', distractors: ['🟡', '🔵', '🟢'], relation: 'color', grades: [0] },
  { pairA: ['🧦', '🦶'], pairCStart: '🧤', correct: '✋', distractors: ['🦶', '👂', '👀'], relation: 'worn on', grades: [0] },
  { pairA: ['🚗', '🛣️'], pairCStart: '🚂', correct: '🛤️', distractors: ['🛣️', '✈️', '🚌'], relation: 'travels on', grades: [0] },
  { pairA: ['🌧️', '☂️'], pairCStart: '☀️', correct: '🕶️', distractors: ['☂️', '🧤', '🧣'], relation: 'goes with', grades: [0] },
  { pairA: ['🐵', '🍌'], pairCStart: '🐼', correct: '🎋', distractors: ['🍌', '🐻', '🌳'], relation: 'eats', grades: [0] },
  { pairA: ['🍪', '🥛'], pairCStart: '🥣', correct: '🥄', distractors: ['🥛', '🍳', '🍌'], relation: 'goes with', grades: [0] },
  { pairA: ['🔑', '🔒'], pairCStart: '🪥', correct: '🦷', distractors: ['🔒', '🧼', '🍭'], relation: 'used with', grades: [0] },
  { pairA: ['🐝', '🌸'], pairCStart: '🐛', correct: '🍃', distractors: ['🌸', '🦋', '🐞'], relation: 'eats', grades: [0] },
  { pairA: ['🐄', '🌾'], pairCStart: '🐱', correct: '🐟', distractors: ['🌾', '🐶', '🧶'], relation: 'eats', grades: [0] },
]

const gradesOf = (item: RawItem): Grade[] => item.grades ?? (GRADE1_RELATIONS.has(item.relation) ? [1, 2] : [2])

// Kindergarten also gets the 1st-grade items with the most concrete connections.
const K_RELATIONS = new Set(['likes to eat', 'eats', 'lives in', 'color', 'worn on', 'goes with', 'hot : cold', 'big one : baby one'])
const inGrade = (item: RawItem, grade: Grade): boolean =>
  grade === 0 ? gradesOf(item).includes(0) || (gradesOf(item).includes(1) && K_RELATIONS.has(item.relation)) : gradesOf(item).includes(grade)

export function buildPictureAnalogyBank(grade: Grade = 2): Question[] {
  return RAW_ITEMS.flatMap((item, i): Question[] => inGrade(item, grade) ? [{
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
  }] : [])
}
