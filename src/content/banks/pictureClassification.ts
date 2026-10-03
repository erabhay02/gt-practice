import type { ContentSpec, Question } from '../types'

const emoji = (value: string): ContentSpec => ({ kind: 'emoji', value })

interface RawItem {
  example: [string, string, string]
  correct: string
  // At least one trap per item is "close but not quite" (related, but fails the rule).
  distractors: [string, string, string]
  category: string
}

const RAW_ITEMS: RawItem[] = [
  { example: ['🐄', '🐖', '🐑'], correct: '🐐', distractors: ['🦁', '🚜', '🐟'], category: 'farm animals' },
  { example: ['🍎', '🍌', '🍇'], correct: '🍓', distractors: ['🥕', '🧁', '🌳'], category: 'fruits' },
  { example: ['🥕', '🥦', '🌽'], correct: '🥔', distractors: ['🍎', '🍕', '🌻'], category: 'vegetables' },
  { example: ['🚗', '🚲', '🛒'], correct: '🛴', distractors: ['⛵', '🐎', '🛶'], category: 'things with wheels' },
  { example: ['✈️', '🚁', '🎈'], correct: '🪁', distractors: ['🚗', '⛵', '🐧'], category: 'things that fly' },
  { example: ['🐟', '🐙', '🐳'], correct: '🦀', distractors: ['🐈', '🦅', '🦒'], category: 'sea animals' },
  { example: ['🧢', '🎩', '👒'], correct: '⛑️', distractors: ['👟', '🧤', '👓'], category: 'worn on the head' },
  { example: ['🎸', '🎹', '🥁'], correct: '🎺', distractors: ['🎤', '🎧', '📻'], category: 'musical instruments' },
  { example: ['🔨', '🪛', '🔧'], correct: '🪚', distractors: ['🧹', '🥄', '🧸'], category: 'tools' },
  { example: ['💡', '🔦', '🕯️'], correct: '🏮', distractors: ['🔋', '🔌', '🪞'], category: 'things that give light' },
  { example: ['🦅', '🦆', '🦜'], correct: '🐧', distractors: ['🦇', '🦋', '🐝'], category: 'birds' },
  { example: ['🐝', '🐞', '🦋'], correct: '🐜', distractors: ['🐦', '🐸', '🦇'], category: 'insects' },
  { example: ['⚽', '🌕', '🍊'], correct: '⚾', distractors: ['🧊', '📦', '📐'], category: 'round things' },
  { example: ['☀️', '🌙', '⭐'], correct: '☁️', distractors: ['🌊', '🌳', '🏔️'], category: 'in the sky' },
  { example: ['🍳', '🥄', '🍴'], correct: '🥣', distractors: ['🛏️', '🪥', '🧸'], category: 'in the kitchen' },
  { example: ['❄️', '⛄', '🧊'], correct: '🍦', distractors: ['🔥', '☀️', '☕'], category: 'cold things' },
  { example: ['🍰', '🍩', '🍪'], correct: '🧁', distractors: ['🥪', '🥕', '🍕'], category: 'sweets' },
  { example: ['👂', '👃', '👁️'], correct: '👄', distractors: ['🦶', '👓', '🧢'], category: 'parts of the face' },
  { example: ['✏️', '🖍️', '🖊️'], correct: '🖌️', distractors: ['📏', '📄', '✂️'], category: 'things you write or draw with' },
  { example: ['⚽', '🏀', '🏈'], correct: '🎾', distractors: ['🥅', '🏆', '👟'], category: 'balls' },
  { example: ['🦁', '🐯', '🐻'], correct: '🐺', distractors: ['🐶', '🐱', '🐄'], category: 'wild animals' },
  { example: ['🌳', '🌵', '🌻'], correct: '🌷', distractors: ['🍄', '🪨', '🐛'], category: 'plants' },
  { example: ['⛵', '🚤', '🛶'], correct: '🚢', distractors: ['🚗', '🚂', '🐟'], category: 'boats' },
  { example: ['🔥', '☀️', '☕'], correct: '🌋', distractors: ['❄️', '🧊', '🍦'], category: 'hot things' },
  { example: ['📖', '📰', '✉️'], correct: '🗺️', distractors: ['✏️', '📺', '🎨'], category: 'things you read' },
  { example: ['👟', '🥾', '👞'], correct: '🩴', distractors: ['🧦', '🧤', '🎩'], category: 'shoes' },
  { example: ['🌧️', '⛈️', '🌨️'], correct: '🌩️', distractors: ['☂️', '🧥', '🌊'], category: 'kinds of weather' },
  { example: ['🥛', '🪣', '☕'], correct: '🥤', distractors: ['🧺', '📦', '🎒'], category: 'things that hold liquids' },
  { example: ['🐶', '🐱', '🐹'], correct: '🐰', distractors: ['🦁', '🐻', '🦊'], category: 'pets' },
  { example: ['💡', '📺', '💻'], correct: '📱', distractors: ['🕯️', '📖', '🧸'], category: 'things that use electricity' },
]

export function buildPictureClassificationBank(): Question[] {
  return RAW_ITEMS.map((item, i) => ({
    id: `picture-classification-${i}`,
    domain: 'verbal',
    subType: 'picture-classification',
    difficulty: 1,
    promptAudioText: 'The three pictures in the top row are alike in some way. Which picture below goes with them?',
    promptVisual: [item.example.map(emoji)],
    choices: [item.correct, ...item.distractors].map((value, ci) => ({
      id: `c${ci}`,
      content: emoji(value),
      isCorrect: ci === 0,
    })),
    explanationAudioText: `They are all ${item.category}.`,
    source: 'authored',
  }))
}
