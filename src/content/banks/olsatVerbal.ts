import { mulberry32, shuffle } from '../generators/rng'
import type { ContentSpec, Grade, Question } from '../types'

// OLSAT Levels D–F (3rd–6th grade) reading items. Untagged items are for 3rd
// and 4th grade; [5, 6] items are the harder Level E/F tier.
const word = (value: string): ContentSpec => ({ kind: 'word', value })
const BASE: Grade[] = [3, 4]

function choices(correct: string, distractors: string[]) {
  return [correct, ...distractors].map((value, ci) => ({ id: `c${ci}`, content: word(value), isCorrect: ci === 0 }))
}

// ---------- Antonyms ----------

interface AntonymItem {
  word: string
  correct: string
  // One trap is usually a synonym: the classic antonym mistake.
  distractors: [string, string, string]
  grades?: Grade[]
}

const ANTONYMS: AntonymItem[] = [
  { word: 'happy', correct: 'sad', distractors: ['glad', 'funny', 'sleepy'] },
  { word: 'early', correct: 'late', distractors: ['soon', 'first', 'quick'] },
  { word: 'wide', correct: 'narrow', distractors: ['broad', 'long', 'deep'] },
  { word: 'loud', correct: 'quiet', distractors: ['noisy', 'high', 'strong'] },
  { word: 'begin', correct: 'finish', distractors: ['start', 'try', 'open'] },
  { word: 'float', correct: 'sink', distractors: ['drift', 'swim', 'splash'] },
  { word: 'cheap', correct: 'expensive', distractors: ['inexpensive', 'low', 'simple'] },
  { word: 'rough', correct: 'smooth', distractors: ['bumpy', 'hard', 'sharp'] },
  { word: 'arrive', correct: 'leave', distractors: ['come', 'reach', 'wait'] },
  { word: 'brave', correct: 'afraid', distractors: ['bold', 'proud', 'strong'] },
  { word: 'empty', correct: 'full', distractors: ['bare', 'light', 'open'] },
  { word: 'tight', correct: 'loose', distractors: ['snug', 'firm', 'small'] },
  { word: 'never', correct: 'always', distractors: ['rarely', 'sometimes', 'often'] },
  { word: 'remember', correct: 'forget', distractors: ['recall', 'think', 'know'] },
  { word: 'borrow', correct: 'lend', distractors: ['take', 'keep', 'buy'] },
  { word: 'whisper', correct: 'shout', distractors: ['murmur', 'talk', 'sing'] },
  { word: 'asleep', correct: 'awake', distractors: ['resting', 'tired', 'dreaming'] },
  { word: 'dull', correct: 'sharp', distractors: ['blunt', 'plain', 'soft'] },
  { word: 'generous', correct: 'selfish', distractors: ['kind', 'giving', 'rich'] },
  { word: 'increase', correct: 'decrease', distractors: ['grow', 'raise', 'change'] },
  { word: 'polite', correct: 'rude', distractors: ['kind', 'nice', 'quiet'] },
  { word: 'victory', correct: 'defeat', distractors: ['win', 'game', 'prize'] },
  { word: 'shallow', correct: 'deep', distractors: ['low', 'thin', 'wet'] },
  { word: 'accept', correct: 'refuse', distractors: ['take', 'agree', 'offer'] },
  { word: 'frequent', correct: 'rare', distractors: ['often', 'regular', 'quick'] },
  { word: 'gentle', correct: 'rough', distractors: ['soft', 'calm', 'slow'] },
  { word: 'inside', correct: 'outside', distractors: ['within', 'under', 'behind'] },
  { word: 'question', correct: 'answer', distractors: ['ask', 'puzzle', 'test'] },
  { word: 'friend', correct: 'enemy', distractors: ['pal', 'neighbor', 'partner'] },
  { word: 'create', correct: 'destroy', distractors: ['make', 'build', 'draw'] },
  { word: 'include', correct: 'exclude', distractors: ['contain', 'add', 'keep'] },
  { word: 'vanish', correct: 'appear', distractors: ['disappear', 'hide', 'fade'] },
  { word: 'dangerous', correct: 'safe', distractors: ['risky', 'scary', 'wild'] },
  { word: 'ancient', correct: 'modern', distractors: ['old', 'broken', 'famous'] },
  { word: 'majority', correct: 'minority', distractors: ['most', 'many', 'group'] },
  { word: 'partial', correct: 'complete', distractors: ['part', 'half', 'broken'] },
  { word: 'abundant', correct: 'scarce', distractors: ['plentiful', 'large', 'rich'], grades: [5, 6] },
  { word: 'benevolent', correct: 'cruel', distractors: ['kind', 'generous', 'careful'], grades: [5, 6] },
  { word: 'conceal', correct: 'reveal', distractors: ['hide', 'cover', 'store'], grades: [5, 6] },
  { word: 'expand', correct: 'contract', distractors: ['grow', 'stretch', 'swell'], grades: [5, 6] },
  { word: 'reluctant', correct: 'eager', distractors: ['unwilling', 'slow', 'careful'], grades: [5, 6] },
  { word: 'humble', correct: 'arrogant', distractors: ['modest', 'shy', 'poor'], grades: [5, 6] },
  { word: 'temporary', correct: 'permanent', distractors: ['brief', 'short', 'quick'], grades: [5, 6] },
  { word: 'transparent', correct: 'opaque', distractors: ['clear', 'shiny', 'thin'], grades: [5, 6] },
  { word: 'optimistic', correct: 'pessimistic', distractors: ['hopeful', 'cheerful', 'curious'], grades: [5, 6] },
  { word: 'verbose', correct: 'concise', distractors: ['wordy', 'loud', 'clever'], grades: [5, 6] },
  { word: 'ascend', correct: 'descend', distractors: ['climb', 'rise', 'soar'], grades: [5, 6] },
  { word: 'prohibit', correct: 'permit', distractors: ['forbid', 'ban', 'punish'], grades: [5, 6] },
  { word: 'genuine', correct: 'fake', distractors: ['real', 'honest', 'rare'], grades: [5, 6] },
  { word: 'hostile', correct: 'friendly', distractors: ['unfriendly', 'angry', 'fierce'], grades: [5, 6] },
  { word: 'diminish', correct: 'increase', distractors: ['shrink', 'reduce', 'fade'], grades: [5, 6] },
  { word: 'novice', correct: 'expert', distractors: ['beginner', 'student', 'rookie'], grades: [5, 6] },
  { word: 'tranquil', correct: 'chaotic', distractors: ['calm', 'peaceful', 'quiet'], grades: [5, 6] },
  { word: 'frugal', correct: 'wasteful', distractors: ['thrifty', 'careful', 'poor'], grades: [5, 6] },
  { word: 'vague', correct: 'precise', distractors: ['unclear', 'foggy', 'simple'], grades: [5, 6] },
  { word: 'inferior', correct: 'superior', distractors: ['worse', 'lower', 'smaller'], grades: [5, 6] },
  { word: 'praise', correct: 'criticize', distractors: ['compliment', 'admire', 'thank'], grades: [5, 6] },
  { word: 'obscure', correct: 'famous', distractors: ['unknown', 'hidden', 'dim'], grades: [5, 6] },
  { word: 'deliberate', correct: 'accidental', distractors: ['intentional', 'careful', 'slow'], grades: [5, 6] },
  { word: 'sincere', correct: 'deceitful', distractors: ['honest', 'serious', 'earnest'], grades: [5, 6] },
  { word: 'rigid', correct: 'flexible', distractors: ['stiff', 'firm', 'solid'], grades: [5, 6] },
  { word: 'complex', correct: 'simple', distractors: ['complicated', 'difficult', 'tangled'], grades: [5, 6] },
  { word: 'voluntary', correct: 'required', distractors: ['optional', 'willing', 'free'], grades: [5, 6] },
  { word: 'ally', correct: 'opponent', distractors: ['friend', 'partner', 'helper'], grades: [5, 6] },
  { word: 'reckless', correct: 'cautious', distractors: ['careless', 'wild', 'hasty'], grades: [5, 6] },
  { word: 'artificial', correct: 'natural', distractors: ['fake', 'man-made', 'plastic'], grades: [5, 6] },
  { word: 'feeble', correct: 'strong', distractors: ['weak', 'frail', 'tired'], grades: [5, 6] },
  { word: 'maximum', correct: 'minimum', distractors: ['most', 'highest', 'greatest'], grades: [5, 6] },
  { word: 'exterior', correct: 'interior', distractors: ['outside', 'surface', 'outer'], grades: [5, 6] },
  { word: 'drought', correct: 'flood', distractors: ['dryness', 'desert', 'thirst'], grades: [5, 6] },
  { word: 'jubilant', correct: 'miserable', distractors: ['joyful', 'excited', 'proud'], grades: [5, 6] },
]

export const ANTONYM_PROMPT = 'Which word means the opposite of the word in the box?'

export function buildAntonymBank(grade: Grade = 3): Question[] {
  return ANTONYMS.flatMap((item, i): Question[] => (item.grades ?? BASE).includes(grade) ? [{
    id: `antonyms-${i}`,
    domain: 'verbal',
    subType: 'antonyms',
    difficulty: 1,
    promptAudioText: ANTONYM_PROMPT,
    promptVisual: [[word(item.word)]],
    choices: choices(item.correct, item.distractors),
    explanationAudioText: `The opposite of ${item.word} is ${item.correct}.`,
    source: 'authored',
  }] : [])
}

// ---------- Logical Selection ("always has") ----------

interface LogicItem {
  // "___" marks the answer's place.
  sentence: string
  correct: string
  // Traps are things that are often true, but not every time.
  distractors: [string, string, string]
  grades?: Grade[]
}

const LOGIC: LogicItem[] = [
  { sentence: 'A garden always has ___.', correct: 'plants', distractors: ['flowers', 'a fence', 'a gate'] },
  { sentence: 'A book always has ___.', correct: 'pages', distractors: ['pictures', 'a bookmark', 'chapters'] },
  { sentence: 'A bicycle always has ___.', correct: 'wheels', distractors: ['a bell', 'a basket', 'a light'] },
  { sentence: 'A lake always has ___.', correct: 'water', distractors: ['fish', 'boats', 'ice'] },
  { sentence: 'A triangle always has ___.', correct: 'three sides', distractors: ['a right angle', 'equal sides', 'a point at the top'] },
  { sentence: 'A forest always has ___.', correct: 'trees', distractors: ['deer', 'paths', 'rivers'] },
  { sentence: 'A school always has ___.', correct: 'students', distractors: ['a playground', 'buses', 'a gym'] },
  { sentence: 'A pizza always has ___.', correct: 'crust', distractors: ['cheese', 'pepperoni', 'mushrooms'] },
  { sentence: 'A shadow always needs ___.', correct: 'light', distractors: ['the sun', 'a wall', 'a person'] },
  { sentence: 'A game always has ___.', correct: 'rules', distractors: ['a ball', 'a board', 'a winner'] },
  { sentence: 'A store always has ___.', correct: 'things to sell', distractors: ['a parking lot', 'shopping carts', 'a bakery'] },
  { sentence: 'A plant always needs ___.', correct: 'water', distractors: ['a pot', 'a garden', 'flowers'] },
  { sentence: 'A map always shows ___.', correct: 'places', distractors: ['roads', 'cities', 'oceans'] },
  { sentence: 'A sandwich always has ___.', correct: 'bread', distractors: ['meat', 'cheese', 'lettuce'] },
  { sentence: 'A building always has ___.', correct: 'walls', distractors: ['windows', 'an elevator', 'a garden'] },
  { sentence: 'A song always has ___.', correct: 'sounds', distractors: ['words', 'a singer', 'drums'] },
  { sentence: 'A party always has ___.', correct: 'guests', distractors: ['balloons', 'a cake', 'presents'] },
  { sentence: 'A clock always shows ___.', correct: 'the time', distractors: ['the date', 'numbers', 'hands'] },
  { sentence: 'A beach always has ___.', correct: 'water nearby', distractors: ['palm trees', 'seashells', 'lifeguards'] },
  { sentence: 'A family always has ___.', correct: 'people', distractors: ['a dog', 'a house', 'a car'] },
  { sentence: 'A democracy always has ___.', correct: 'voting', distractors: ['a king', 'a president', 'an army'], grades: [5, 6] },
  { sentence: 'A conversation always has ___.', correct: 'two or more people', distractors: ['a telephone', 'an argument', 'a question'], grades: [5, 6] },
  { sentence: 'A mammal always has ___.', correct: 'a backbone', distractors: ['four legs', 'a long tail', 'sharp teeth'], grades: [5, 6] },
  { sentence: 'A desert always has ___.', correct: 'little rain', distractors: ['sand', 'camels', 'cactuses'], grades: [5, 6] },
  { sentence: 'An island always has ___.', correct: 'water around it', distractors: ['palm trees', 'a beach', 'people'], grades: [5, 6] },
  { sentence: 'An election always has ___.', correct: 'candidates', distractors: ['posters', 'debates', 'television ads'], grades: [5, 6] },
  { sentence: 'A recipe always has ___.', correct: 'instructions', distractors: ['sugar', 'an oven', 'pictures'], grades: [5, 6] },
  { sentence: 'A biography always tells about ___.', correct: 'a real person', distractors: ['a famous author', 'a happy ending', 'a king'], grades: [5, 6] },
  { sentence: 'A fraction always has ___.', correct: 'a denominator', distractors: ['a decimal point', 'a whole number part', 'an even numerator'], grades: [5, 6] },
  { sentence: 'A calendar always shows ___.', correct: 'days', distractors: ['holidays', 'birthdays', 'pictures'], grades: [5, 6] },
  { sentence: 'A museum always has ___.', correct: 'a collection', distractors: ['paintings', 'dinosaur bones', 'a gift shop'], grades: [5, 6] },
  { sentence: 'An orchestra always has ___.', correct: 'musicians', distractors: ['a piano', 'singers', 'an audience'], grades: [5, 6] },
  { sentence: 'A volcano always has ___.', correct: 'an opening', distractors: ['flowing lava', 'smoke', 'snow on top'], grades: [5, 6] },
  { sentence: 'A dictionary always has ___.', correct: 'words', distractors: ['pictures', 'a bookmark', 'stories'], grades: [5, 6] },
  { sentence: 'A rectangle always has ___.', correct: 'four right angles', distractors: ['four equal sides', 'two long sides', 'a diagonal'], grades: [5, 6] },
  { sentence: 'A planet always has ___.', correct: 'a path around a star', distractors: ['moons', 'rings', 'oceans'], grades: [5, 6] },
  { sentence: 'A poem always has ___.', correct: 'words', distractors: ['rhymes', 'four lines', 'a title'], grades: [5, 6] },
  { sentence: 'A sentence always has ___.', correct: 'a verb', distractors: ['an adjective', 'a comma', 'a question mark'], grades: [5, 6] },
  { sentence: 'An argument always has ___.', correct: 'different opinions', distractors: ['shouting', 'a winner', 'a judge'], grades: [5, 6] },
  { sentence: 'An experiment always has ___.', correct: 'a question to test', distractors: ['a microscope', 'chemicals', 'goggles'], grades: [5, 6] },
]

export const LOGIC_PROMPT = 'Read the sentence. Which answer makes it true every time?'

export function buildLogicalSelectionBank(grade: Grade = 3): Question[] {
  return LOGIC.flatMap((item, i): Question[] => (item.grades ?? BASE).includes(grade) ? [{
    id: `logical-selection-${i}`,
    domain: 'verbal',
    subType: 'logical-selection',
    difficulty: 1,
    promptAudioText: LOGIC_PROMPT,
    promptVisual: [[{ kind: 'sentence', value: item.sentence }]],
    choices: choices(item.correct, item.distractors),
    source: 'authored',
  }] : [])
}

// ---------- Sentence Arrangement ----------

interface ArrangementItem {
  // Written normally; the answer is its last word.
  sentence: string
  // Other words from the sentence that cannot sensibly come last.
  distractors: [string, string, string]
  // Keep the first word's capital letter (a name like "Maya").
  properFirst?: boolean
  grades?: Grade[]
}

// Sentences whose last word is fixed: no phrase like "every morning" that
// could move to the end and make a different, equally good sentence.
const ARRANGEMENTS: ArrangementItem[] = [
  { sentence: 'My sister plays the piano.', distractors: ['sister', 'plays', 'my'] },
  { sentence: 'The baker sells fresh bread.', distractors: ['baker', 'sells', 'fresh'] },
  { sentence: 'Cows give us milk.', distractors: ['cows', 'give', 'us'] },
  { sentence: 'The farmer feeds the hungry pigs.', distractors: ['farmer', 'feeds', 'hungry'] },
  { sentence: 'Bees make sweet honey.', distractors: ['bees', 'make', 'sweet'] },
  { sentence: 'The pilot flies the airplane.', distractors: ['pilot', 'flies', 'the'] },
  { sentence: 'Our teacher reads us a story.', distractors: ['teacher', 'reads', 'us'] },
  { sentence: 'The cat drinks warm milk.', distractors: ['cat', 'drinks', 'warm'] },
  { sentence: 'The mail carrier delivers our letters.', distractors: ['carrier', 'delivers', 'our'] },
  { sentence: 'A spider spins a sticky web.', distractors: ['spider', 'spins', 'sticky'] },
  { sentence: 'The children built a tall snowman.', distractors: ['children', 'built', 'tall'] },
  { sentence: 'Grandma knitted a warm scarf.', distractors: ['Grandma', 'knitted', 'warm'], properFirst: true },
  { sentence: 'The dentist cleaned my teeth.', distractors: ['dentist', 'cleaned', 'my'] },
  { sentence: 'The chef cooked a delicious meal.', distractors: ['chef', 'cooked', 'delicious'] },
  { sentence: 'The wind blew the leaves.', distractors: ['wind', 'blew', 'the'] },
  { sentence: 'The puppy chewed my new shoe.', distractors: ['puppy', 'chewed', 'new'] },
  { sentence: 'The artist painted a beautiful picture.', distractors: ['artist', 'painted', 'beautiful'] },
  { sentence: 'Maya planted bright yellow flowers.', distractors: ['Maya', 'planted', 'yellow'], properFirst: true },
  { sentence: 'The scientist studied the strange rock.', distractors: ['scientist', 'studied', 'strange'] },
  { sentence: 'My brother fixed the broken bike.', distractors: ['brother', 'fixed', 'broken'] },
  { sentence: 'The owl hunts small mice.', distractors: ['owl', 'hunts', 'small'] },
  { sentence: 'Our class visited the science museum.', distractors: ['class', 'visited', 'science'] },
  { sentence: 'The plumber repaired the leaky pipe.', distractors: ['plumber', 'repaired', 'leaky'] },
  { sentence: 'Leo carried the heavy box.', distractors: ['Leo', 'carried', 'heavy'], properFirst: true },
  { sentence: 'The waves crashed against the rocks.', distractors: ['waves', 'crashed', 'against'] },
  { sentence: 'The curious explorer discovered an ancient hidden city.', distractors: ['explorer', 'discovered', 'ancient'], grades: [5, 6] },
  { sentence: 'Our science teacher explained how volcanoes erupt.', distractors: ['teacher', 'explained', 'volcanoes'], grades: [5, 6] },
  { sentence: 'The talented musician composed a beautiful symphony.', distractors: ['musician', 'composed', 'beautiful'], grades: [5, 6] },
  { sentence: 'The committee reviewed every application.', distractors: ['committee', 'reviewed', 'every'], grades: [5, 6] },
  { sentence: 'The archaeologist uncovered fragile pottery.', distractors: ['archaeologist', 'uncovered', 'fragile'], grades: [5, 6] },
  { sentence: 'Heavy rain flooded the narrow streets.', distractors: ['rain', 'flooded', 'narrow'], grades: [5, 6] },
  { sentence: 'The detective examined the mysterious footprints.', distractors: ['detective', 'examined', 'mysterious'], grades: [5, 6] },
  { sentence: 'The ancient Egyptians built enormous pyramids.', distractors: ['Egyptians', 'built', 'enormous'], grades: [5, 6] },
  { sentence: 'The marathon runner crossed the finish line.', distractors: ['runner', 'crossed', 'finish'], grades: [5, 6] },
  { sentence: 'Engineers designed a stronger bridge.', distractors: ['engineers', 'designed', 'stronger'], grades: [5, 6] },
  { sentence: 'The author signed copies of the new novel.', distractors: ['author', 'signed', 'copies'], grades: [5, 6] },
  { sentence: 'The orchestra performed a lively concert.', distractors: ['orchestra', 'performed', 'lively'], grades: [5, 6] },
  { sentence: 'The astronaut repaired the damaged satellite.', distractors: ['astronaut', 'repaired', 'damaged'], grades: [5, 6] },
  { sentence: 'Volunteers cleaned the polluted beach.', distractors: ['volunteers', 'cleaned', 'polluted'], grades: [5, 6] },
  { sentence: 'The judge announced the final verdict.', distractors: ['judge', 'announced', 'final'], grades: [5, 6] },
  { sentence: 'Scientists observed a distant comet.', distractors: ['scientists', 'observed', 'distant'], grades: [5, 6] },
  { sentence: 'The reporter wrote a detailed article.', distractors: ['reporter', 'wrote', 'detailed'], grades: [5, 6] },
  { sentence: 'The architect sketched an unusual building.', distractors: ['architect', 'sketched', 'unusual'], grades: [5, 6] },
  { sentence: 'The beekeeper inspected the wooden hives.', distractors: ['beekeeper', 'inspected', 'wooden'], grades: [5, 6] },
  { sentence: 'The mayor opened the new library.', distractors: ['mayor', 'opened', 'new'], grades: [5, 6] },
  { sentence: 'Glaciers carved deep valleys.', distractors: ['glaciers', 'carved', 'deep'], grades: [5, 6] },
]

/** The sentence's words, punctuation dropped, in a fixed mixed-up order. */
export function scrambledWords(item: ArrangementItem, index: number): { words: string[]; last: string } {
  const words = item.sentence.replace(/[.,!?]/g, '').split(' ')
  if (!item.properFirst) words[0] = words[0].toLowerCase()
  const last = words[words.length - 1]
  const rng = mulberry32(index + 1)
  // Never leave the answer at the end or the first word in front.
  for (;;) {
    const mixed = shuffle(rng, words)
    if (mixed[mixed.length - 1] !== last && mixed[0] !== words[0]) return { words: mixed, last }
  }
}

export const ARRANGEMENT_PROMPT = 'Put the words in order to make the best sentence. Which word would come last?'

export function buildSentenceArrangementBank(grade: Grade = 3): Question[] {
  return ARRANGEMENTS.flatMap((item, i): Question[] => {
    if (!(item.grades ?? BASE).includes(grade)) return []
    const { words, last } = scrambledWords(item, i)
    return [{
      id: `sentence-arrangement-${i}`,
      domain: 'verbal',
      subType: 'sentence-arrangement',
      difficulty: 1,
      promptAudioText: ARRANGEMENT_PROMPT,
      promptVisual: [words.map(word)],
      choices: choices(last, item.distractors),
      explanationAudioText: `The sentence is: ${item.sentence}`,
      source: 'authored',
    }]
  })
}
