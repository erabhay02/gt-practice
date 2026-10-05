import type { ContentSpec, Grade, Question } from '../types'

const emoji = (value: string): ContentSpec => ({ kind: 'emoji', value })

interface RawItem {
  example: [string, string, string]
  correct: string
  // At least one trap per item is "close but not quite" (related, but fails the rule).
  distractors: [string, string, string]
  category: string
  kindergartenOnly?: boolean
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
  { example: ['🥛', '🧀', '🧈'], correct: '🍦', distractors: ['🥚', '🍞', '🐄'], category: 'made from milk' },
  { example: ['🍌', '🌻', '🐥'], correct: '🌽', distractors: ['🍎', '🥦', '🍆'], category: 'yellow things' },
  { example: ['🍓', '🚒', '🍎'], correct: '🌹', distractors: ['🥦', '🍌', '🍋'], category: 'red things' },
  { example: ['🥦', '🐸', '🍀'], correct: '🥒', distractors: ['🍅', '🥕', '🍆'], category: 'green things' },
  { example: ['🦋', '🦅', '✈️'], correct: '🐝', distractors: ['🐟', '🚗', '🎈'], category: 'things with wings' },
  { example: ['🐢', '🐌', '🦀'], correct: '🦞', distractors: ['🐸', '🐚', '🐟'], category: 'animals with shells' },
  { example: ['⏰', '📅', '📏'], correct: '🌡️', distractors: ['🧸', '🖍️', '⚽'], category: 'things with numbers on them' },
  { example: ['✂️', '📌', '🌵'], correct: '🪡', distractors: ['🧸', '🎈', '🧽'], category: 'sharp things' },
  { example: ['🧸', '🧶', '🪶'], correct: '🧣', distractors: ['🪨', '🧱', '🔨'], category: 'soft things' },
  { example: ['🚿', '🛁', '🪥'], correct: '🧻', distractors: ['🍳', '🛏️', '📺'], category: 'things in the bathroom' },
  { example: ['✏️', '📚', '📏'], correct: '🎒', distractors: ['🛏️', '🍳', '🚗'], category: 'things for school' },
  { example: ['🌷', '🌹', '🌻'], correct: '🌼', distractors: ['🌳', '🍄', '🐝'], category: 'flowers' },
  { example: ['🚀', '🏎️', '🐆'], correct: '✈️', distractors: ['🐢', '🐌', '🦥'], category: 'fast things' },
  { example: ['🐒', '🦜', '🐍'], correct: '🐅', distractors: ['🐄', '🐧', '🐑'], category: 'jungle animals' },
  { example: ['🚲', '🐎', '🛹'], correct: '🛴', distractors: ['🎒', '👟', '🪁'], category: 'things you can ride' },
  { example: ['🥞', '🥣', '🍳'], correct: '🥓', distractors: ['🍕', '🌮', '🍝'], category: 'breakfast foods' },
  { example: ['🔔', '📢', '🥁'], correct: '⏰', distractors: ['🧸', '🪨', '🌷'], category: 'things that make loud sounds' },
  { example: ['🐚', '🏖️', '🦀'], correct: '🌊', distractors: ['⛄', '🌲', '🚜'], category: 'things at the beach' },
  { example: ['🌱', '🐣', '👶'], correct: '🌳', distractors: ['🪨', '🧱', '🚗'], category: 'things that grow' },
  { example: ['🟥', '🔺', '🔷'], correct: '⬛', distractors: ['⚪', '🔵', '🟠'], category: 'shapes with corners' },
  { example: ['🔵', '⚪', '🟠'], correct: '🟢', distractors: ['🟥', '🔺', '🔷'], category: 'circles' },
  { example: ['🧣', '🧤', '🧥'], correct: '🥾', distractors: ['🩳', '🩴', '👙'], category: 'winter clothes' },
  { example: ['🩳', '🕶️', '🩴'], correct: '👒', distractors: ['🧣', '🧤', '🧥'], category: 'summer clothes' },
  { example: ['💵', '🪙', '💳'], correct: '💰', distractors: ['🎟️', '📬', '🧾'], category: 'money' },
  { example: ['🥤', '🧃', '☕'], correct: '🥛', distractors: ['🍪', '🍦', '🧊'], category: 'drinks' },
  { example: ['🐘', '🦒', '🐋'], correct: '🦏', distractors: ['🐁', '🐜', '🐇'], category: 'big animals' },
  { example: ['🐜', '🐁', '🐞'], correct: '🐛', distractors: ['🐘', '🐴', '🐻'], category: 'small animals' },
  { example: ['🐶', '🐟', '🐒'], correct: '🦊', distractors: ['🐸', '🐌', '🦋'], category: 'animals with tails' },
  { example: ['🏠', '🚗', '🚌'], correct: '🚂', distractors: ['🛶', '🚲', '🛹'], category: 'things with doors' },
  { example: ['🎸', '🎻', '🪁'], correct: '🪀', distractors: ['🥁', '🎺', '⚽'], category: 'things with strings' },
  // Kindergarten only (CogAT Level 5/6).
  { example: ['🚗', '🚕', '🚙'], correct: '🚓', distractors: ['🚂', '⛵', '✈️'], category: 'cars', kindergartenOnly: true },
  { example: ['🧦', '👕', '👖'], correct: '👗', distractors: ['🍎', '🚗', '🧸'], category: 'clothes', kindergartenOnly: true },
  { example: ['🐟', '🐠', '🐡'], correct: '🦈', distractors: ['🐈', '🐦', '🐄'], category: 'fish', kindergartenOnly: true },
  { example: ['🧸', '🪀', '🪁'], correct: '🎈', distractors: ['🍞', '🥄', '🛏️'], category: 'toys', kindergartenOnly: true },
  { example: ['🍞', '🧀', '🥚'], correct: '🍗', distractors: ['🧸', '👟', '🪑'], category: 'food', kindergartenOnly: true },
  { example: ['✋', '🦶', '👂'], correct: '👃', distractors: ['🧤', '🧦', '🎧'], category: 'body parts', kindergartenOnly: true },
]

// Categories too abstract (or with tricky traps) for a 1st grader.
const GRADE2_ONLY_CATEGORIES = new Set([
  'things that use electricity', 'made from milk', 'things with numbers on them', 'things that grow',
  'animals with tails', 'things with doors', 'things with strings', 'things that hold liquids', 'plants',
])

// Kindergarten: concrete groups a 5-year-old knows by sight.
const K_CATEGORIES = new Set([
  'farm animals', 'fruits', 'vegetables', 'things that fly', 'sea animals', 'musical instruments', 'birds', 'round things',
  'sweets', 'parts of the face', 'balls', 'flowers', 'boats', 'shoes', 'pets', 'yellow things', 'red things',
  'green things', 'drinks', 'big animals', 'small animals', 'circles',
])

function inGrade(item: RawItem, grade: Grade): boolean {
  if (grade === 0) return item.kindergartenOnly === true || K_CATEGORIES.has(item.category)
  if (item.kindergartenOnly) return false
  return !(grade === 1 && GRADE2_ONLY_CATEGORIES.has(item.category))
}

export function buildPictureClassificationBank(grade: Grade = 2): Question[] {
  return RAW_ITEMS.flatMap((item, i): Question[] => !inGrade(item, grade) ? [] : [{
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
  }])
}
