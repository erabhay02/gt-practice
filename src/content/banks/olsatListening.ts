import type { ContentSpec, Grade, Question } from '../types'

// OLSAT Levels A–C (Kindergarten–2nd grade) listening items: the question is
// read aloud and the child answers with a picture. Every item's spoken text
// gets its own recording (see src/audio/promptCatalog.ts).

// ---------- Following Directions ----------

interface DirectionsItem {
  say: string
  // Each answer is a little scene: rows of emoji, top to bottom.
  correct: string[][]
  // Each trap breaks exactly one part of the direction.
  distractors: [string[][], string[][], string[][]]
  // Default: Kindergarten through 2nd grade.
  grades?: Grade[]
}

const DIRECTIONS: DirectionsItem[] = [
  { say: 'Find the box with a star above a moon.', correct: [['⭐'], ['🌙']], distractors: [[['🌙'], ['⭐']], [['⭐', '🌙']], [['☀️'], ['🌙']]] },
  { say: 'Find the box with a cat below a tree.', correct: [['🌳'], ['🐱']], distractors: [[['🐱'], ['🌳']], [['🌳', '🐱']], [['🌳'], ['🐶']]] },
  { say: 'Find the box with a ball between two hats.', correct: [['🎩', '⚽', '🎩']], distractors: [[['⚽', '🎩', '🎩']], [['🎩', '🎩', '⚽']], [['🎩', '🏀', '🎩']]] },
  { say: 'Find the box with three apples.', correct: [['🍎', '🍎', '🍎']], distractors: [[['🍎', '🍎']], [['🍎', '🍎', '🍎', '🍎']], [['🍊', '🍊', '🍊']]] },
  { say: 'Find the box with a fish on the left and a boat on the right.', correct: [['🐟', '⛵']], distractors: [[['⛵', '🐟']], [['🐟', '🐟']], [['🐟', '🚗']]] },
  { say: 'Find the box where the bird is last.', correct: [['🌸', '🐶', '🐦']], distractors: [[['🐦', '🌸', '🐶']], [['🌸', '🐦', '🐶']], [['🌸', '🐶', '🐱']]] },
  { say: 'Find the box where the dog is first.', correct: [['🐶', '🐱', '🐭']], distractors: [[['🐱', '🐶', '🐭']], [['🐭', '🐱', '🐶']], [['🐱', '🐭', '🐰']]] },
  { say: 'Find the box with two hearts and one star.', correct: [['❤️', '❤️', '⭐']], distractors: [[['❤️', '⭐', '⭐']], [['❤️', '❤️', '❤️']], [['❤️', '⭐']]] },
  { say: 'Find the box with a sun above a cloud.', correct: [['☀️'], ['☁️']], distractors: [[['☁️'], ['☀️']], [['☀️', '☁️']], [['☀️'], ['🌧️']]] },
  { say: 'Find the box with a car next to a house.', correct: [['🚗', '🏠']], distractors: [[['🚗', '🌳']], [['🚌', '🏠']], [['🏠']]] },
  { say: 'Find the box with no flowers.', correct: [['🌳', '🍄']], distractors: [[['🌷', '🍄']], [['🌳', '🌻']], [['🌸']]] },
  { say: 'Find the box with the most balloons.', correct: [['🎈', '🎈'], ['🎈', '🎈']], distractors: [[['🎈', '🎈']], [['🎈', '🎈', '🎈']], [['🎈']]] },
  { say: 'Find the box with the fewest stars.', correct: [['⭐']], distractors: [[['⭐', '⭐']], [['⭐', '⭐', '⭐']], [['⭐', '⭐'], ['⭐', '⭐']]] },
  { say: 'Find the box where the duck is in the middle.', correct: [['🐸', '🦆', '🐢']], distractors: [[['🦆', '🐸', '🐢']], [['🐸', '🐢', '🦆']], [['🐸', '🐔', '🐢']]] },
  { say: 'Find the box with a red heart and a blue heart, and nothing else.', correct: [['❤️', '💙']], distractors: [[['❤️', '❤️']], [['❤️', '💙', '⭐']], [['💙', '💙']]] },
  { say: 'Find the box where the moon is above the star, and the star is above the tree.', correct: [['🌙'], ['⭐'], ['🌳']], distractors: [[['⭐'], ['🌙'], ['🌳']], [['🌙'], ['🌳'], ['⭐']], [['🌳'], ['⭐'], ['🌙']]], grades: [1, 2] },
  { say: 'Find the box with two dogs and two cats.', correct: [['🐶', '🐶', '🐱', '🐱']], distractors: [[['🐶', '🐱', '🐱']], [['🐶', '🐶', '🐱']], [['🐶', '🐶', '🐶', '🐱']]], grades: [1, 2] },
  { say: 'Find the box where the apple is between the banana and the grapes.', correct: [['🍌', '🍎', '🍇']], distractors: [[['🍎', '🍌', '🍇']], [['🍌', '🍇', '🍎']], [['🍌', '🍐', '🍇']]], grades: [1, 2] },
  { say: 'Find the box with a star on each side of the heart.', correct: [['⭐', '❤️', '⭐']], distractors: [[['⭐', '⭐', '❤️']], [['❤️', '⭐', '⭐']], [['⭐', '❤️', '🌙']]] },
  { say: 'Find the box with more fish than boats.', correct: [['🐟', '🐟', '🐟', '⛵']], distractors: [[['🐟', '⛵', '⛵']], [['🐟', '⛵']], [['⛵', '⛵', '⛵', '🐟']]], grades: [1, 2] },
  { say: 'Find the box where the cat is not next to the dog.', correct: [['🐱', '🐭', '🐶']], distractors: [[['🐱', '🐶', '🐭']], [['🐶', '🐱', '🐭']], [['🐭', '🐶', '🐱']]], grades: [1, 2] },
  { say: 'Find the box with the same number of hearts and stars.', correct: [['❤️', '❤️'], ['⭐', '⭐']], distractors: [[['❤️', '❤️'], ['⭐']], [['❤️'], ['⭐', '⭐', '⭐']], [['❤️', '❤️', '❤️'], ['⭐', '⭐']]], grades: [1, 2] },
  { say: 'Find the box where the second animal is a frog.', correct: [['🐰', '🐸', '🐻']], distractors: [[['🐸', '🐰', '🐻']], [['🐰', '🐻', '🐸']], [['🐰', '🐢', '🐻']]], grades: [1, 2] },
  { say: 'Find the box with three shapes, where the circle is last.', correct: [['🔺', '🟦', '🔵']], distractors: [[['🔵', '🔺', '🟦']], [['🔺', '🔵', '🟦']], [['🔺', '🟦', '🔵', '🟦']]], grades: [1, 2] },
  { say: 'Find the box where the car is below the plane and above the boat.', correct: [['✈️'], ['🚗'], ['⛵']], distractors: [[['🚗'], ['✈️'], ['⛵']], [['✈️'], ['⛵'], ['🚗']], [['⛵'], ['🚗'], ['✈️']]], grades: [1, 2] },
  { say: 'Find the box with one more apple than pears.', correct: [['🍎', '🍎', '🍎'], ['🍐', '🍐']], distractors: [[['🍎', '🍎'], ['🍐', '🍐']], [['🍎', '🍎', '🍎'], ['🍐']], [['🍎'], ['🍐', '🍐']]], grades: [1, 2] },
  { say: 'Find the box where every animal can fly.', correct: [['🐦', '🦋', '🐝']], distractors: [[['🐦', '🐶', '🐝']], [['🐟', '🦋', '🐝']], [['🐦', '🦋', '🐢']]], grades: [1, 2] },
  { say: 'Find the box with the umbrella between the sun and the cloud.', correct: [['☀️', '☂️', '☁️']], distractors: [[['☂️', '☀️', '☁️']], [['☀️', '☁️', '☂️']], [['☀️', '🎈', '☁️']]] },
  { say: 'Find the box with more cookies in the bottom row than in the top row.', correct: [['🍪'], ['🍪', '🍪', '🍪']], distractors: [[['🍪', '🍪', '🍪'], ['🍪']], [['🍪', '🍪'], ['🍪', '🍪']], [['🍪', '🍪'], ['🍪']]], grades: [1, 2] },
  { say: 'Find the box where the last two pictures are the same.', correct: [['🍓', '🍌', '🍌']], distractors: [[['🍌', '🍌', '🍓']], [['🍓', '🍌', '🍓']], [['🍌', '🍓', '🍌']]], grades: [2] },
  { say: 'Find the box where the first and last pictures match.', correct: [['⚽', '🏀', '⚽']], distractors: [[['⚽', '⚽', '🏀']], [['🏀', '⚽', '⚽']], [['⚽', '🏀', '🏈']]], grades: [2] },
  { say: 'Find the box with four stars in two rows.', correct: [['⭐', '⭐'], ['⭐', '⭐']], distractors: [[['⭐', '⭐', '⭐', '⭐']], [['⭐', '⭐'], ['⭐']], [['⭐', '⭐', '⭐'], ['⭐', '⭐', '⭐']]], grades: [1, 2] },
  { say: 'Find the box with more trees than houses, where the house is first.', correct: [['🏠', '🌳', '🌳']], distractors: [[['🌳', '🏠', '🌳']], [['🏠', '🏠', '🌳']], [['🏠', '🌳']]], grades: [2] },
  { say: 'Find the box where the snail comes right after the turtle.', correct: [['🐢', '🐌', '🐸']], distractors: [[['🐌', '🐢', '🐸']], [['🐢', '🐸', '🐌']], [['🐸', '🐌', '🐢']]], grades: [1, 2] },
  { say: 'Find the box with an even number of balls.', correct: [['⚽', '⚽', '⚽', '⚽']], distractors: [[['⚽', '⚽', '⚽']], [['⚽', '⚽', '⚽', '⚽', '⚽']], [['⚽']]], grades: [2] },
  { say: 'Find the box where the rocket is above the moon and the star is below the moon.', correct: [['🚀'], ['🌙'], ['⭐']], distractors: [[['⭐'], ['🌙'], ['🚀']], [['🌙'], ['🚀'], ['⭐']], [['🚀'], ['⭐'], ['🌙']]], grades: [1, 2] },
]

// ---------- Aural Reasoning ----------

interface AuralItem {
  say: string
  correct: string
  distractors: [string, string, string]
  grades?: Grade[]
}

// Listen, think, pick the picture. The ordering items ("taller than") are pure
// reasoning: colors and jars a child can't know the answer to in advance.
const AURAL: AuralItem[] = [
  { say: 'Which one can you use to dig in the sand and also to carry water?', correct: '🪣', distractors: ['🧹', '🧦', '🪁'] },
  { say: 'The red tower is taller than the blue tower. The blue tower is taller than the green tower. Which tower is the shortest?', correct: '🟩', distractors: ['🟥', '🟦', '🟨'], grades: [1, 2] },
  { say: 'I have four legs and a long trunk. What am I?', correct: '🐘', distractors: ['🦒', '🐴', '🐭'] },
  { say: 'It is cold and snowy, so Ana puts on something warm before going outside. What does Ana put on?', correct: '🧥', distractors: ['🩳', '👙', '🕶️'] },
  { say: 'Which one does not belong with the others: a spoon, a fork, a ball, and chopsticks?', correct: '⚽', distractors: ['🥄', '🍴', '🥢'] },
  { say: 'Which one would you take to the beach on a hot, sunny day?', correct: '🕶️', distractors: ['🧣', '🧤', '⛄'] },
  { say: 'Which one grows from a seed and is good to eat?', correct: '🍅', distractors: ['🪨', '🧸', '🌹'] },
  { say: 'Which animal has feathers but cannot fly?', correct: '🐧', distractors: ['🦅', '🐦', '🐶'], grades: [1, 2] },
  { say: 'First you put on your socks, and then you put these on your feet. What are they?', correct: '👟', distractors: ['🎩', '🧤', '👕'] },
  { say: 'The bear ate more berries than the fox. The fox ate more berries than the rabbit. Which animal ate the most berries?', correct: '🐻', distractors: ['🦊', '🐰', '🐿️'], grades: [1, 2] },
  { say: 'Which one do you need to see in the dark?', correct: '🔦', distractors: ['🧦', '🍎', '🧸'] },
  { say: 'Which fruit is yellow and long?', correct: '🍌', distractors: ['🍋', '🥒', '🍎'] },
  { say: 'Which one has wheels and can carry many people at once?', correct: '🚌', distractors: ['🚲', '⛵', '🛴'] },
  { say: 'It started to rain. Which one keeps you dry?', correct: '☂️', distractors: ['🕶️', '🎈', '🪁'] },
  { say: 'Which one melts when it gets warm?', correct: '⛄', distractors: ['🪨', '🧱', '🥄'] },
  { say: 'Which one is round, bounces, and is used to play a game?', correct: '⚽', distractors: ['🍊', '🎲', '🍩'] },
  { say: 'Which one lives in the water and has fins?', correct: '🐟', distractors: ['🐸', '🦆', '🐢'] },
  { say: 'The blue jar has more marbles than the red jar. The red jar has more marbles than the green jar. Which jar has the fewest marbles?', correct: '🟢', distractors: ['🔵', '🔴', '🟡'], grades: [1, 2] },
  { say: 'Which one would you use to cut paper?', correct: '✂️', distractors: ['✏️', '📏', '🖍️'] },
  { say: 'Which one is not an animal: a dog, a frog, a tree, or a bird?', correct: '🌳', distractors: ['🐶', '🐸', '🐦'] },
  { say: 'The kite is above the tree, and the bird is below the tree. Which one is the highest?', correct: '🪁', distractors: ['🌳', '🐦', '🪨'], grades: [1, 2] },
  { say: 'Which one tells you what time it is?', correct: '⏰', distractors: ['📏', '🔑', '🧭'] },
  { say: 'Which one has no legs at all?', correct: '🐍', distractors: ['🐶', '🐔', '🐜'] },
  { say: 'When the sun goes down and it gets dark, what do you often see in the sky?', correct: '🌙', distractors: ['☀️', '🌈', '🌻'] },
  { say: 'Which one is smaller than a cat?', correct: '🐭', distractors: ['🐘', '🐻', '🐄'] },
  { say: 'Kim put the cup on the table and the book under the table. Which one is on top of the table?', correct: '☕', distractors: ['📕', '⚽', '🧸'], grades: [1, 2] },
  { say: 'Which one would you put in a drink to make it cold?', correct: '🧊', distractors: ['🔥', '☀️', '🍞'] },
  { say: 'Which one is heavier than a chair?', correct: '🚗', distractors: ['🪶', '🎈', '🍃'], grades: [1, 2] },
  { say: 'Which one can swim in a pond and also walk on land?', correct: '🐢', distractors: ['🐟', '🐌', '🦋'], grades: [1, 2] },
  { say: 'After rain, when the sun comes out, what colorful thing might you see in the sky?', correct: '🌈', distractors: ['🌙', '⛄', '🍦'] },
]

// ---------- Arithmetic Reasoning (pictures) ----------

interface ArithmeticItem {
  say: string
  answer: number
  wrong: [number, number, number]
  // Shown as that many pictures (Kindergarten–1st); without it, as numbers.
  emoji?: string
  suffix?: string
  grades: Grade[]
}

const ARITHMETIC: ArithmeticItem[] = [
  { say: 'Sam had two apples and got one more. Which box shows how many apples Sam has now?', emoji: '🍎', answer: 3, wrong: [2, 4, 1], grades: [0, 1] },
  { say: 'There were four birds on a branch. One flew away. Which box shows how many birds are left?', emoji: '🐦', answer: 3, wrong: [4, 5, 2], grades: [0, 1] },
  { say: 'Mia has three balloons. Leo has two balloons. Which box shows how many balloons they have together?', emoji: '🎈', answer: 5, wrong: [3, 4, 1], grades: [0, 1] },
  { say: 'There are five cookies. Ben eats two. Which box shows how many cookies are left?', emoji: '🍪', answer: 3, wrong: [5, 2, 4], grades: [0, 1] },
  { say: 'Each dog has one bone. There are four dogs. Which box shows how many bones there are?', emoji: '🦴', answer: 4, wrong: [3, 5, 1], grades: [0, 1] },
  { say: 'Ana picked one flower, then two more, then one more. Which box shows how many flowers Ana picked?', emoji: '🌸', answer: 4, wrong: [3, 2, 5], grades: [0, 1] },
  { say: 'There are three ducks in the pond. Two more ducks come. Then one duck leaves. Which box shows how many ducks are in the pond now?', emoji: '🦆', answer: 4, wrong: [5, 3, 6], grades: [0, 1] },
  { say: 'Kim had five stars and gave two to a friend. Which box shows how many stars Kim has left?', emoji: '⭐', answer: 3, wrong: [2, 5, 4], grades: [0, 1] },
  { say: 'There are two frogs on a log. Two more frogs jump on. Which box shows how many frogs are on the log now?', emoji: '🐸', answer: 4, wrong: [2, 3, 5], grades: [0, 1] },
  { say: 'Omar has four crayons and loses one. Which box shows how many crayons Omar has now?', emoji: '🖍️', answer: 3, wrong: [4, 5, 2], grades: [0, 1] },
  { say: 'There are six fish in a bowl. Three more fish are added. Which box shows how many fish are in the bowl now?', emoji: '🐟', answer: 9, wrong: [6, 3, 8], grades: [1] },
  { say: 'Omar had ten grapes and ate four. Which box shows how many grapes are left?', emoji: '🍇', answer: 6, wrong: [4, 10, 5], grades: [1] },
  { say: 'There are two plates with three strawberries on each plate. Which box shows how many strawberries there are?', emoji: '🍓', answer: 6, wrong: [5, 3, 2], grades: [1] },
  { say: 'Zoe has seven crayons. Eli has two fewer crayons than Zoe. Which box shows how many crayons Eli has?', emoji: '🖍️', answer: 5, wrong: [7, 9, 2], grades: [1] },
  { say: 'There are eight cupcakes. Half of them have cherries on top. Which box shows how many cupcakes have cherries?', emoji: '🧁', answer: 4, wrong: [8, 2, 6], grades: [1] },
  { say: 'Leo had four toy cars, got three more for a birthday, and then one more from a friend. Which box shows how many toy cars Leo has now?', emoji: '🚗', answer: 8, wrong: [7, 4, 5], grades: [1] },
  { say: 'Nine bees were on a flower. Five flew away. Which box shows how many bees are still on the flower?', emoji: '🐝', answer: 4, wrong: [5, 9, 3], grades: [1] },
  { say: 'Ava has three red apples and four green apples. Ava gives away two apples. Which box shows how many apples Ava has left?', emoji: '🍎', answer: 5, wrong: [7, 4, 6], grades: [1] },
  { say: 'There were ten balloons. Some popped, and now there are six. Which box shows how many balloons popped?', emoji: '🎈', answer: 4, wrong: [6, 10, 5], grades: [1] },
  { say: 'There are twelve children on a bus. At the first stop, five get off and three get on. How many children are on the bus now?', answer: 10, wrong: [9, 14, 7], grades: [2] },
  { say: 'A pack has six juice boxes. How many juice boxes are in three packs?', answer: 18, wrong: [9, 12, 15], grades: [2] },
  { say: 'Maya has fifteen stickers. Sam has eight stickers. How many more stickers does Maya have than Sam?', answer: 7, wrong: [23, 8, 6], grades: [2] },
  { say: 'Four friends share twenty cookies equally. How many cookies does each friend get?', answer: 5, wrong: [4, 16, 24], grades: [2] },
  { say: 'Ben read nine pages yesterday and twice as many pages today. How many pages did Ben read today?', answer: 18, wrong: [9, 11, 27], grades: [2] },
  { say: 'A spider has eight legs. How many legs do two spiders have?', answer: 16, wrong: [10, 8, 18], grades: [2] },
  { say: 'Kim had twenty-five cents and spent ten cents. How much money does Kim have left?', answer: 15, suffix: '¢', wrong: [35, 10, 5], grades: [2] },
  { say: 'There are four rows of chairs with five chairs in each row. How many chairs are there?', answer: 20, wrong: [9, 15, 25], grades: [2] },
  { say: "Eli is seven years old. Eli's sister is three years older. How old will Eli's sister be in two years?", answer: 12, wrong: [10, 9, 13], grades: [2] },
  { say: 'There were eleven ducks. Some swam away, and now there are seven. How many ducks swam away?', answer: 4, wrong: [7, 18, 3], grades: [2] },
  { say: 'Zoe has three bags with four marbles in each bag, and two more marbles in a pocket. How many marbles does Zoe have?', answer: 14, wrong: [12, 9, 10], grades: [2] },
  { say: 'A garden has three rows of carrots with five carrots in each row. How many carrots are in the garden?', answer: 15, wrong: [8, 10, 20], grades: [2] },
  { say: 'Leo had thirty marbles and lost thirteen. How many marbles does Leo have now?', answer: 17, wrong: [43, 13, 16], grades: [2] },
  { say: 'There are sixteen crayons. Ana uses half of them. How many crayons does Ana use?', answer: 8, wrong: [16, 4, 6], grades: [2] },
  { say: 'Each bike has two wheels. How many wheels do nine bikes have?', answer: 18, wrong: [11, 9, 16], grades: [2] },
]

const K_TO_2: Grade[] = [0, 1, 2]

function choices(correct: ContentSpec, wrong: ContentSpec[]) {
  return [correct, ...wrong].map((content, ci) => ({ id: `c${ci}`, content, isCorrect: ci === 0 }))
}

export function buildFollowingDirectionsBank(grade: Grade = 1): Question[] {
  return DIRECTIONS.flatMap((item, i): Question[] => (item.grades ?? K_TO_2).includes(grade) ? [{
    id: `following-directions-${i}`,
    domain: 'verbal',
    subType: 'following-directions',
    difficulty: 1,
    promptAudioText: item.say,
    choices: choices({ kind: 'scene', rows: item.correct }, item.distractors.map((rows) => ({ kind: 'scene', rows }))),
    source: 'authored',
  }] : [])
}

export function buildAuralReasoningBank(grade: Grade = 1): Question[] {
  return AURAL.flatMap((item, i): Question[] => (item.grades ?? K_TO_2).includes(grade) ? [{
    id: `aural-reasoning-${i}`,
    domain: 'verbal',
    subType: 'aural-reasoning',
    difficulty: 1,
    promptAudioText: item.say,
    choices: choices({ kind: 'emoji', value: item.correct }, item.distractors.map((value) => ({ kind: 'emoji', value }))),
    source: 'authored',
  }] : [])
}

export function buildArithmeticPicturesBank(grade: Grade = 1): Question[] {
  const show = (item: ArithmeticItem, n: number): ContentSpec =>
    item.emoji ? { kind: 'group', emoji: item.emoji, count: n } : { kind: 'text', value: `${n}${item.suffix ?? ''}` }
  return ARITHMETIC.flatMap((item, i): Question[] => item.grades.includes(grade) ? [{
    id: `arithmetic-pictures-${i}`,
    domain: 'verbal',
    subType: 'arithmetic-reasoning',
    difficulty: 1,
    promptAudioText: item.say,
    choices: choices(show(item, item.answer), item.wrong.map((n) => show(item, n))),
    source: 'authored',
  }] : [])
}
