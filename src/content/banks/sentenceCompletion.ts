import type { ContentSpec, Grade, Question } from '../types'

const emoji = (value: string): ContentSpec => ({ kind: 'emoji', value })

interface RawItem {
  question: string
  correct: string
  distractors: [string, string, string]
}

// Mirrors the real Sentence Completion format: the question is read aloud and
// the child picks a picture. Wrong answers are related, so listening carefully
// to every word ("NOT", "but", "more than") matters.
const RAW_ITEMS: RawItem[] = [
  { question: 'If you heard a loud moo, which animal would it be?', correct: '🐄', distractors: ['🐑', '🐖', '🐎'] },
  { question: 'Which one is NOT alive?', correct: '🪨', distractors: ['🌳', '🐛', '🐟'] },
  { question: 'Which one is the heaviest?', correct: '🐘', distractors: ['🐕', '🐈', '🐁'] },
  { question: 'Which one would you find in a kitchen?', correct: '🍳', distractors: ['🛏️', '🚿', '🧸'] },
  { question: 'Which one helps you see in the dark?', correct: '🔦', distractors: ['🕶️', '🔑', '🧤'] },
  { question: 'Which one keeps your hands warm in winter?', correct: '🧤', distractors: ['🧣', '🧢', '👟'] },
  { question: 'Which one grows on a tree?', correct: '🍎', distractors: ['🥕', '🥔', '🍄'] },
  { question: 'Which one can fly, but is not a bird?', correct: '🦋', distractors: ['🦆', '🦉', '🐧'] },
  { question: 'Which one has wheels, but no engine?', correct: '🚲', distractors: ['🚗', '🚌', '🛵'] },
  { question: 'Which one lives in water and has no legs?', correct: '🐟', distractors: ['🐸', '🦀', '🐢'] },
  { question: 'Which one tells you what time it is?', correct: '⏰', distractors: ['📅', '🧭', '🌡️'] },
  { question: 'Which one would you use to measure how long something is?', correct: '📏', distractors: ['⚖️', '🌡️', '⏱️'] },
  { question: 'Which one is the smallest?', correct: '🐜', distractors: ['🐁', '🐈', '🐕'] },
  { question: 'Which animal has a very long neck?', correct: '🦒', distractors: ['🦓', '🐘', '🐪'] },
  { question: 'Which one melts when it gets warm?', correct: '🧊', distractors: ['🪨', '🔑', '🧱'] },
  { question: 'Which one do you use to pay at a store?', correct: '💵', distractors: ['🎟️', '📬', '🔑'] },
  { question: 'Which one gives us milk?', correct: '🐄', distractors: ['🐖', '🐔', '🐎'] },
  { question: 'Which one is round and bounces?', correct: '🏀', distractors: ['🎲', '🧱', '🍎'] },
  { question: 'Which one comes before a butterfly?', correct: '🐛', distractors: ['🐝', '🐞', '🦗'] },
  { question: 'Which one would a firefighter use?', correct: '🧯', distractors: ['🩺', '🔨', '🍳'] },
  { question: 'Which one would a doctor use?', correct: '🩺', distractors: ['🧯', '🎨', '🔧'] },
  { question: 'Which one would you NOT find at the beach?', correct: '⛄', distractors: ['🐚', '🦀', '🌊'] },
  { question: 'Which one has more legs than a dog?', correct: '🕷️', distractors: ['🐔', '🐟', '🐈'] },
  { question: 'Which one opens a door?', correct: '🔑', distractors: ['🔒', '🚪', '🧲'] },
  { question: 'Which one can you write with and also erase?', correct: '✏️', distractors: ['🖊️', '🖍️', '🖌️'] },
  { question: 'Which one would float on water?', correct: '🪵', distractors: ['🪨', '🔑', '⚓'] },
  { question: 'Which one is a baby animal?', correct: '🐣', distractors: ['🐓', '🦆', '🦉'] },
  { question: 'Which one is used to cut wood?', correct: '🪚', distractors: ['✂️', '🔨', '🪛'] },
  { question: 'Which one shines in the sky at night?', correct: '🌙', distractors: ['☀️', '🌈', '☁️'] },
  { question: 'Which one is a vegetable?', correct: '🥕', distractors: ['🍎', '🍌', '🍇'] },
  { question: 'Which one would you wear when it is raining?', correct: '🧥', distractors: ['🩳', '🕶️', '👙'] },
  { question: 'Which one is bigger than a cat but smaller than a horse?', correct: '🐕', distractors: ['🐁', '🐘', '🐜'] },
  { question: 'Which one would you use to sweep the floor?', correct: '🧹', distractors: ['🧽', '🪣', '🧺'] },
  { question: 'Which one do bees make?', correct: '🍯', distractors: ['🍞', '🧈', '🥛'] },
  { question: 'Which animal can live both in water and on land?', correct: '🐸', distractors: ['🐟', '🐕', '🐦'] },
  { question: 'Which one is NOT a fruit?', correct: '🥕', distractors: ['🍎', '🍌', '🍇'] },
  { question: 'Which one would you use to cut paper?', correct: '✂️', distractors: ['🪚', '🖍️', '📏'] },
  { question: 'Which one has the most legs?', correct: '🕷️', distractors: ['🐜', '🐕', '🐔'] },
  { question: 'Which one would you take outside on a rainy day?', correct: '☂️', distractors: ['🕶️', '🪁', '🏐'] },
  { question: 'When you plant a seed, which one comes up first?', correct: '🌱', distractors: ['🌳', '🍎', '🌸'] },
  { question: 'Which one is the coldest?', correct: '🧊', distractors: ['☕', '🔥', '🌞'] },
  { question: 'Which one can you NOT eat?', correct: '🧸', distractors: ['🍪', '🍇', '🥪'] },
  { question: 'Which one would you use to talk to a friend who is far away?', correct: '📱', distractors: ['📺', '📻', '📷'] },
  { question: 'Which one would you see at a birthday party?', correct: '🎂', distractors: ['🎄', '🎃', '🧯'] },
  { question: 'Which animal says quack?', correct: '🦆', distractors: ['🐔', '🦉', '🐦'] },
  { question: 'Which one lays eggs?', correct: '🐔', distractors: ['🐄', '🐖', '🐎'] },
  { question: 'Which one would a carpenter use?', correct: '🔨', distractors: ['🩺', '🧯', '🎨'] },
  { question: 'Which one is the lightest?', correct: '🪶', distractors: ['🧱', '📚', '🍉'] },
  { question: 'Which one would you find in the ocean?', correct: '🐙', distractors: ['🐄', '🐿️', '🦒'] },
  { question: 'Which one do you need to build a snowman?', correct: '❄️', distractors: ['🏖️', '☀️', '🌧️'] },
  { question: 'Which one is NOT something you wear?', correct: '🪑', distractors: ['🧢', '🧦', '🧥'] },
  { question: 'Which one moves the slowest?', correct: '🐌', distractors: ['🐇', '🐎', '🐆'] },
  { question: 'Which animal has a long trunk?', correct: '🐘', distractors: ['🦒', '🦏', '🐊'] },
  { question: 'Which one would you use to see something very far away?', correct: '🔭', distractors: ['👓', '🔦', '🔍'] },
  { question: 'Which one comes inside a shell?', correct: '🥚', distractors: ['🍎', '🍞', '🥕'] },
  { question: 'Which one makes a loud noise?', correct: '🥁', distractors: ['🪶', '🧸', '🧦'] },
  { question: 'Which one does NOT live in water?', correct: '🐒', distractors: ['🐟', '🐙', '🐳'] },
  { question: 'Which one would you use to carry your books to school?', correct: '🎒', distractors: ['🧺', '🛒', '👜'] },
  { question: 'Which one has four wheels?', correct: '🚗', distractors: ['🚲', '🛵', '🛴'] },
  { question: 'Which one is bigger than a car?', correct: '🚌', distractors: ['🚲', '🐕', '🛴'] },
  { question: 'Which one would you NOT find in a kitchen?', correct: '🛏️', distractors: ['🍳', '🥄', '🍴'] },
  { question: 'Which animal gives us wool?', correct: '🐑', distractors: ['🐄', '🐔', '🐖'] },
]

// Two-condition questions ("but", "more than", "and also") and harder
// knowledge items are kept for 2nd grade.
const GRADE2_ONLY = new Set([
  'Which one can fly, but is not a bird?',
  'Which one has wheels, but no engine?',
  'Which one lives in water and has no legs?',
  'Which one has more legs than a dog?',
  'Which one can you write with and also erase?',
  'Which one is bigger than a cat but smaller than a horse?',
  'Which one would you use to measure how long something is?',
  'Which one would float on water?',
  'Which animal can live both in water and on land?',
  'Which one has the most legs?',
  'Which one would a carpenter use?',
])

export function buildSentenceCompletionBank(grade: Grade = 2): Question[] {
  return RAW_ITEMS.flatMap((item, i): Question[] => grade === 1 && GRADE2_ONLY.has(item.question) ? [] : [{
    id: `sentence-completion-${i}`,
    domain: 'verbal',
    subType: 'sentence-completion',
    difficulty: 1,
    promptAudioText: item.question,
    choices: [item.correct, ...item.distractors].map((value, ci) => ({
      id: `c${ci}`,
      content: emoji(value),
      isCorrect: ci === 0,
    })),
    source: 'authored',
  }])
}
