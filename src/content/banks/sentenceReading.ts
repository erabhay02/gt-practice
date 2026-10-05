import type { ContentSpec, Grade, Question } from '../types'

const word = (value: string): ContentSpec => ({ kind: 'word', value })

interface RawItem {
  // "___" marks the missing word.
  sentence: string
  correct: string
  distractors: [string, string, string]
  // Default: both 3rd and 4th grade.
  grades?: Grade[]
}

// CogAT Levels 9–10 Sentence Completion: the child reads the sentence and picks
// the word that fits. Wrong answers are real words that don't fit the meaning.
const RAW_ITEMS: RawItem[] = [
  { sentence: 'The puppy was so ___ that it fell asleep right after dinner.', correct: 'tired', distractors: ['hungry', 'loud', 'fast'] },
  { sentence: 'Maria wore her coat because it was ___ outside.', correct: 'cold', distractors: ['sunny', 'warm', 'bright'] },
  { sentence: 'Sam used a ___ to measure how long the table was.', correct: 'ruler', distractors: ['clock', 'scale', 'pencil'] },
  { sentence: 'The baby bird stayed in its ___ until it could fly.', correct: 'nest', distractors: ['egg', 'cage', 'sky'] },
  { sentence: 'Because the soup was too ___, Tom waited for it to cool.', correct: 'hot', distractors: ['cold', 'salty', 'big'] },
  { sentence: 'The library is a quiet place, so please ___ when you talk.', correct: 'whisper', distractors: ['shout', 'sing', 'laugh'] },
  { sentence: 'After running the race, Lily was out of ___.', correct: 'breath', distractors: ['shoes', 'water', 'place'] },
  { sentence: 'The ___ flew south for the winter.', correct: 'geese', distractors: ['bears', 'fish', 'squirrels'] },
  { sentence: 'An umbrella keeps you ___ when it rains.', correct: 'dry', distractors: ['wet', 'warm', 'happy'] },
  { sentence: 'The farmer planted the ___ in the spring.', correct: 'seeds', distractors: ['apples', 'barn', 'harvest'] },
  { sentence: 'Jake was ___ when he found his lost dog.', correct: 'happy', distractors: ['angry', 'bored', 'sleepy'] },
  { sentence: 'The sun rises in the ___ every morning.', correct: 'east', distractors: ['west', 'night', 'ground'] },
  { sentence: 'You should brush your teeth so they stay ___.', correct: 'healthy', distractors: ['sharp', 'yellow', 'loose'] },
  { sentence: 'Ice melts when it gets ___.', correct: 'warm', distractors: ['cold', 'hard', 'dark'] },
  { sentence: 'The opposite of tall is ___.', correct: 'short', distractors: ['big', 'long', 'thin'] },
  { sentence: 'The store was ___, so we could not buy any milk.', correct: 'closed', distractors: ['open', 'busy', 'new'] },
  { sentence: 'Kim looked in the ___ to learn what the word meant.', correct: 'dictionary', distractors: ['newspaper', 'menu', 'calendar'] },
  { sentence: 'Plants need water and ___ to grow.', correct: 'sunlight', distractors: ['darkness', 'salt', 'snow'] },
  { sentence: 'The ball rolled down the ___.', correct: 'hill', distractors: ['ceiling', 'sky', 'tree'] },
  { sentence: 'Our teacher asked us to ___ our names at the top of the page.', correct: 'write', distractors: ['read', 'erase', 'hide'] },
  { sentence: 'A week has seven ___.', correct: 'days', distractors: ['months', 'hours', 'weeks'] },
  { sentence: 'The thirsty dog drank all of the ___ in its bowl.', correct: 'water', distractors: ['food', 'bone', 'toys'] },
  { sentence: 'The firefighters ___ the fire quickly.', correct: 'put out', distractors: ['started', 'lit', 'watched'] },
  { sentence: 'Because it was her birthday, Ana felt very ___.', correct: 'excited', distractors: ['sleepy', 'scared', 'sick'] },
  { sentence: 'The turtle moved ___ across the road.', correct: 'slowly', distractors: ['quickly', 'loudly', 'high'] },
  { sentence: "Ben's shoes were too ___, so his feet hurt.", correct: 'small', distractors: ['new', 'clean', 'blue'] },
  { sentence: 'We could see the stars because the night sky was ___.', correct: 'clear', distractors: ['cloudy', 'bright', 'sunny'] },
  { sentence: 'The baker put the bread in the ___ to bake.', correct: 'oven', distractors: ['fridge', 'sink', 'freezer'] },
  { sentence: 'To stay healthy, you should eat lots of fruits and ___.', correct: 'vegetables', distractors: ['candy', 'cookies', 'soda'] },
  { sentence: 'Dad used a hammer to pound the ___ into the wood.', correct: 'nail', distractors: ['saw', 'glue', 'board'] },
  { sentence: 'The snowman ___ when the sun came out.', correct: 'melted', distractors: ['grew', 'froze', 'danced'] },
  { sentence: 'Please ___ the door so the cat does not get out.', correct: 'close', distractors: ['open', 'paint', 'knock'] },
  { sentence: 'Fish use their gills to ___ under water.', correct: 'breathe', distractors: ['see', 'sleep', 'talk'] },
  { sentence: 'Owls can see well in the dark, so they hunt at ___.', correct: 'night', distractors: ['noon', 'sunrise', 'lunch'] },
  { sentence: 'The drive was very ___, so we packed lots of snacks.', correct: 'long', distractors: ['short', 'quick', 'quiet'] },
  // 4th grade (Level 10): harder words and sentences that turn on "although", "since", "because".
  { sentence: 'The hikers were ___ after climbing the steep mountain all day.', correct: 'exhausted', distractors: ['energetic', 'bored', 'curious'], grades: [4] },
  { sentence: 'Although the test was difficult, Maya felt ___ because she had studied.', correct: 'confident', distractors: ['nervous', 'confused', 'lazy'], grades: [4] },
  { sentence: 'The scientist used a ___ to look at the tiny cells.', correct: 'microscope', distractors: ['telescope', 'thermometer', 'magnet'], grades: [4] },
  { sentence: 'The river was so ___ that we could see the fish at the bottom.', correct: 'clear', distractors: ['deep', 'muddy', 'wide'], grades: [4] },
  { sentence: 'Carlos is very ___; he always shares his snacks with friends.', correct: 'generous', distractors: ['selfish', 'shy', 'forgetful'], grades: [4] },
  { sentence: 'The ancient castle was built hundreds of years ___.', correct: 'ago', distractors: ['later', 'soon', 'ahead'], grades: [4] },
  { sentence: 'Since the bridge was ___, the cars had to take a different road.', correct: 'damaged', distractors: ['new', 'long', 'painted'], grades: [4] },
  { sentence: 'A ___ is a person who writes poems.', correct: 'poet', distractors: ['painter', 'baker', 'pilot'], grades: [4] },
  { sentence: 'The desert gets very little ___, so few plants grow there.', correct: 'rain', distractors: ['sand', 'heat', 'sunlight'], grades: [4] },
  { sentence: 'Our team practiced every day, so we were well ___ for the big game.', correct: 'prepared', distractors: ['unlikely', 'afraid', 'late'], grades: [4] },
  { sentence: 'The audience ___ loudly at the end of the wonderful play.', correct: 'clapped', distractors: ['slept', 'whispered', 'frowned'], grades: [4] },
  { sentence: 'A compass helps you find which ___ you are going.', correct: 'direction', distractors: ['speed', 'time', 'distance'], grades: [4] },
  { sentence: 'The museum guard asked us not to ___ the paintings.', correct: 'touch', distractors: ['see', 'enjoy', 'visit'], grades: [4] },
  { sentence: 'Elephants are ___ animals; they are the largest animals on land.', correct: 'enormous', distractors: ['tiny', 'fast', 'noisy'], grades: [4] },
  { sentence: 'Because Leo was ___, he did not want to speak in front of the class.', correct: 'shy', distractors: ['brave', 'proud', 'tall'], grades: [4] },
  { sentence: 'Water turns into ice when it ___.', correct: 'freezes', distractors: ['boils', 'melts', 'flows'], grades: [4] },
  { sentence: 'The opposite of ancient is ___.', correct: 'modern', distractors: ['old', 'broken', 'famous'], grades: [4] },
  { sentence: 'The detective looked for ___ to solve the mystery.', correct: 'clues', distractors: ['toys', 'snacks', 'friends'], grades: [4] },
  { sentence: 'Bats sleep during the day and are ___ at night.', correct: 'active', distractors: ['asleep', 'hidden', 'still'], grades: [4] },
  { sentence: 'The recipe says to ___ the eggs and sugar together in a bowl.', correct: 'mix', distractors: ['freeze', 'slice', 'bake'], grades: [4] },
  { sentence: 'Mount Everest is the ___ mountain in the world.', correct: 'highest', distractors: ['smallest', 'newest', 'wettest'], grades: [4] },
  { sentence: 'The children were ___ to see a rainbow after the storm.', correct: 'delighted', distractors: ['annoyed', 'bored', 'frightened'], grades: [4] },
  { sentence: 'Even though it was raining, the soccer game was not ___.', correct: 'canceled', distractors: ['played', 'wet', 'long'], grades: [4] },
]

const gradesOf = (item: RawItem): Grade[] => item.grades ?? [3, 4]

export const SENTENCE_READING_PROMPT = 'Read the sentence. Which word fits best in the blank?'

export function buildSentenceReadingBank(grade: Grade = 3): Question[] {
  return RAW_ITEMS.flatMap((item, i): Question[] => gradesOf(item).includes(grade) ? [{
    id: `sentence-reading-${i}`,
    domain: 'verbal',
    subType: 'sentence-completion',
    difficulty: 1,
    promptAudioText: SENTENCE_READING_PROMPT,
    promptVisual: [[{ kind: 'sentence', value: item.sentence }]],
    choices: [item.correct, ...item.distractors].map((value, ci) => ({
      id: `c${ci}`,
      content: word(value),
      isCorrect: ci === 0,
    })),
    source: 'authored',
  }] : [])
}
