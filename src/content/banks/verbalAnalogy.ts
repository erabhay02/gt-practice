import type { ContentSpec, Grade, Question } from '../types'

const word = (value: string): ContentSpec => ({ kind: 'word', value })
const arrow: ContentSpec = { kind: 'text', value: '→' }

interface RawItem {
  // a is to b as c is to `correct`.
  pair: [string, string]
  start: string
  correct: string
  // Traps: words that go with the third word the wrong way, or a copy of b.
  distractors: [string, string, string]
  relation: string
  // Default: both 3rd and 4th grade.
  grades?: Grade[]
}

// CogAT Levels 9–10 Verbal Analogies: the child reads three words and picks the
// fourth. Every item has exactly one answer that fits the same relation.
const RAW_ITEMS: RawItem[] = [
  { pair: ['puppy', 'dog'], start: 'kitten', correct: 'cat', distractors: ['milk', 'mouse', 'puppy'], relation: 'baby animal : grown animal' },
  { pair: ['bird', 'nest'], start: 'bee', correct: 'hive', distractors: ['honey', 'flower', 'nest'], relation: 'animal : its home' },
  { pair: ['hot', 'cold'], start: 'up', correct: 'down', distractors: ['high', 'top', 'cold'], relation: 'opposites' },
  { pair: ['glove', 'hand'], start: 'sock', correct: 'foot', distractors: ['shoe', 'toe', 'hand'], relation: 'worn on' },
  { pair: ['pen', 'write'], start: 'scissors', correct: 'cut', distractors: ['paper', 'sharp', 'write'], relation: 'tool : what it does' },
  { pair: ['fish', 'swim'], start: 'bird', correct: 'fly', distractors: ['feather', 'nest', 'swim'], relation: 'animal : how it moves' },
  { pair: ['cow', 'milk'], start: 'hen', correct: 'eggs', distractors: ['chick', 'farm', 'feathers'], relation: 'animal : food it gives us' },
  { pair: ['day', 'night'], start: 'summer', correct: 'winter', distractors: ['sun', 'spring', 'hot'], relation: 'opposites' },
  { pair: ['tree', 'forest'], start: 'book', correct: 'library', distractors: ['page', 'read', 'shelf'], relation: 'one : place with many' },
  { pair: ['doctor', 'hospital'], start: 'teacher', correct: 'school', distractors: ['student', 'lesson', 'hospital'], relation: 'worker : workplace' },
  { pair: ['baker', 'bread'], start: 'farmer', correct: 'crops', distractors: ['tractor', 'barn', 'overalls'], relation: 'worker : what they produce' },
  { pair: ['eye', 'see'], start: 'ear', correct: 'hear', distractors: ['nose', 'sound', 'see'], relation: 'body part : what it does' },
  { pair: ['big', 'huge'], start: 'small', correct: 'tiny', distractors: ['short', 'huge', 'size'], relation: 'a word : a stronger word' },
  { pair: ['caterpillar', 'butterfly'], start: 'tadpole', correct: 'frog', distractors: ['fish', 'pond', 'egg'], relation: 'young : grown' },
  { pair: ['water', 'drink'], start: 'food', correct: 'eat', distractors: ['cook', 'plate', 'hungry'], relation: 'thing : what you do with it' },
  { pair: ['wheel', 'car'], start: 'wing', correct: 'airplane', distractors: ['sky', 'pilot', 'fly'], relation: 'part : whole' },
  { pair: ['author', 'book'], start: 'painter', correct: 'painting', distractors: ['brush', 'color', 'museum'], relation: 'maker : what they make' },
  { pair: ['ice', 'cold'], start: 'fire', correct: 'hot', distractors: ['smoke', 'wood', 'cold'], relation: 'thing : how it feels' },
  { pair: ['three', 'triangle'], start: 'four', correct: 'square', distractors: ['circle', 'three', 'corner'], relation: 'number of sides : shape' },
  { pair: ['mouse', 'squeak'], start: 'lion', correct: 'roar', distractors: ['bark', 'mane', 'jungle'], relation: 'animal : its sound' },
  { pair: ['kitten', 'cat'], start: 'calf', correct: 'cow', distractors: ['horse', 'milk', 'farm'], relation: 'baby animal : grown animal' },
  { pair: ['pilot', 'airplane'], start: 'captain', correct: 'ship', distractors: ['sailor', 'ocean', 'anchor'], relation: 'person : what they steer' },
  { pair: ['apple', 'fruit'], start: 'carrot', correct: 'vegetable', distractors: ['orange', 'rabbit', 'root'], relation: 'thing : group it belongs to' },
  { pair: ['morning', 'breakfast'], start: 'evening', correct: 'dinner', distractors: ['night', 'moon', 'lunch'], relation: 'time of day : meal' },
  { pair: ['sun', 'day'], start: 'moon', correct: 'night', distractors: ['star', 'sky', 'day'], relation: 'seen in the sky : when' },
  { pair: ['chef', 'kitchen'], start: 'nurse', correct: 'hospital', distractors: ['doctor', 'medicine', 'kitchen'], relation: 'worker : workplace' },
  { pair: ['finger', 'hand'], start: 'toe', correct: 'foot', distractors: ['nail', 'shoe', 'leg'], relation: 'part : whole' },
  { pair: ['sheep', 'wool'], start: 'bee', correct: 'honey', distractors: ['hive', 'sting', 'flower'], relation: 'animal : what we get from it' },
  { pair: ['happy', 'sad'], start: 'rich', correct: 'poor', distractors: ['money', 'gold', 'happy'], relation: 'opposites' },
  { pair: ['open', 'close'], start: 'push', correct: 'pull', distractors: ['shove', 'door', 'push'], relation: 'opposites' },
  { pair: ['begin', 'end'], start: 'first', correct: 'last', distractors: ['start', 'second', 'one'], relation: 'opposites' },
  { pair: ['whisper', 'shout'], start: 'walk', correct: 'run', distractors: ['jog', 'legs', 'talk'], relation: 'gentle : strong' },
  { pair: ['leaf', 'tree'], start: 'petal', correct: 'flower', distractors: ['stem', 'bee', 'garden'], relation: 'part : whole' },
  { pair: ['slow', 'snail'], start: 'fast', correct: 'cheetah', distractors: ['turtle', 'run', 'race'], relation: 'trait : animal known for it' },
  { pair: ['thirsty', 'drink'], start: 'tired', correct: 'sleep', distractors: ['bed', 'yawn', 'eat'], relation: 'feeling : what you need' },
  { pair: ['seed', 'tree'], start: 'egg', correct: 'chicken', distractors: ['nest', 'shell', 'yolk'], relation: 'start : what it grows into' },
  { pair: ['cold', 'freezer'], start: 'hot', correct: 'oven', distractors: ['ice', 'fridge', 'plate'], relation: 'temperature : appliance' },
  { pair: ['pedal', 'bicycle'], start: 'oar', correct: 'boat', distractors: ['water', 'fish', 'anchor'], relation: 'what moves it : vehicle' },
  { pair: ['library', 'books'], start: 'museum', correct: 'paintings', distractors: ['tickets', 'guide', 'old'], relation: 'place : what it holds' },
  { pair: ['lamp', 'light'], start: 'heater', correct: 'warmth', distractors: ['cold', 'fire', 'winter'], relation: 'object : what it gives' },
  { pair: ['student', 'learn'], start: 'teacher', correct: 'teach', distractors: ['school', 'class', 'learn'], relation: 'person : what they do' },
  { pair: ['bee', 'buzz'], start: 'snake', correct: 'hiss', distractors: ['slither', 'scales', 'bite'], relation: 'animal : its sound' },
  { pair: ['hammer', 'nail'], start: 'screwdriver', correct: 'screw', distractors: ['wrench', 'tool', 'saw'], relation: 'tool : what it drives' },
  { pair: ['dentist', 'teeth'], start: 'barber', correct: 'hair', distractors: ['scissors', 'comb', 'salon'], relation: 'worker : what they care for' },
  { pair: ['fin', 'fish'], start: 'wing', correct: 'bird', distractors: ['fly', 'egg', 'nest'], relation: 'body part : animal' },
  { pair: ['page', 'book'], start: 'slice', correct: 'bread', distractors: ['butter', 'knife', 'toast'], relation: 'piece : whole' },
  { pair: ['smile', 'happy'], start: 'frown', correct: 'sad', distractors: ['face', 'mouth', 'glad'], relation: 'look : feeling' },
  { pair: ['king', 'queen'], start: 'prince', correct: 'princess', distractors: ['castle', 'crown', 'king'], relation: 'male : female' },
  { pair: ['cocoon', 'butterfly'], start: 'egg', correct: 'chick', distractors: ['nest', 'shell', 'hen'], relation: 'what it comes out of : baby' },
  { pair: ['wet', 'dry'], start: 'loud', correct: 'quiet', distractors: ['noisy', 'ears', 'dry'], relation: 'opposites' },
  { pair: ['bark', 'dog'], start: 'meow', correct: 'cat', distractors: ['mouse', 'purr', 'pet'], relation: 'sound : animal' },
  // 4th grade (Level 10): less familiar words and more abstract connections.
  { pair: ['clock', 'time'], start: 'thermometer', correct: 'temperature', distractors: ['weather', 'hot', 'glass'], relation: 'tool : what it measures', grades: [4] },
  { pair: ['ruler', 'length'], start: 'scale', correct: 'weight', distractors: ['heavy', 'fish', 'measure'], relation: 'tool : what it measures', grades: [4] },
  { pair: ['square', 'cube'], start: 'circle', correct: 'sphere', distractors: ['round', 'triangle', 'ring'], relation: 'flat shape : solid shape', grades: [4] },
  { pair: ['hour', 'minute'], start: 'minute', correct: 'second', distractors: ['clock', 'hour', 'time'], relation: 'unit : next smaller unit', grades: [4] },
  { pair: ['begin', 'start'], start: 'finish', correct: 'end', distractors: ['stop', 'first', 'start'], relation: 'same meaning', grades: [4] },
  { pair: ['inch', 'foot'], start: 'centimeter', correct: 'meter', distractors: ['ruler', 'mile', 'millimeter'], relation: 'small unit : bigger unit', grades: [4] },
  { pair: ['author', 'novel'], start: 'composer', correct: 'symphony', distractors: ['piano', 'orchestra', 'singer'], relation: 'creator : work', grades: [4] },
  { pair: ['year', 'month'], start: 'week', correct: 'day', distractors: ['hour', 'calendar', 'month'], relation: 'whole : part', grades: [4] },
  { pair: ['ice', 'water'], start: 'water', correct: 'steam', distractors: ['ocean', 'rain', 'cold'], relation: 'what it becomes when heated', grades: [4] },
  { pair: ['polite', 'rude'], start: 'honest', correct: 'dishonest', distractors: ['truthful', 'kind', 'rude'], relation: 'opposites', grades: [4] },
  { pair: ['telescope', 'stars'], start: 'microscope', correct: 'germs', distractors: ['glass', 'lens', 'planets'], relation: 'tool : what you look at', grades: [4] },
  { pair: ['architect', 'building'], start: 'chef', correct: 'meal', distractors: ['kitchen', 'apron', 'restaurant'], relation: 'maker : what they make', grades: [4] },
  { pair: ['drought', 'water'], start: 'famine', correct: 'food', distractors: ['hunger', 'rain', 'farm'], relation: 'shortage : of what', grades: [4] },
  { pair: ['cub', 'bear'], start: 'foal', correct: 'horse', distractors: ['saddle', 'barn', 'cow'], relation: 'baby animal : grown animal', grades: [4] },
  { pair: ['grape', 'raisin'], start: 'plum', correct: 'prune', distractors: ['peach', 'juice', 'purple'], relation: 'fruit : dried fruit', grades: [4] },
  { pair: ['add', 'subtract'], start: 'multiply', correct: 'divide', distractors: ['plus', 'times', 'sum'], relation: 'opposite operations', grades: [4] },
  { pair: ['old', 'new'], start: 'ancient', correct: 'modern', distractors: ['history', 'past', 'antique'], relation: 'opposites', grades: [4] },
  { pair: ['good', 'excellent'], start: 'bad', correct: 'terrible', distractors: ['okay', 'sad', 'excellent'], relation: 'a word : a stronger word', grades: [4] },
  { pair: ['sculptor', 'statue'], start: 'poet', correct: 'poem', distractors: ['rhyme', 'reader', 'book'], relation: 'creator : work', grades: [4] },
  { pair: ['rare', 'common'], start: 'scarce', correct: 'plentiful', distractors: ['few', 'empty', 'rare'], relation: 'opposites', grades: [4] },
]

const gradesOf = (item: RawItem): Grade[] => item.grades ?? [3, 4]

export const VERBAL_ANALOGY_PROMPT =
  'The first two words go together in some way. Which word goes with the third word in the same way?'

export function buildVerbalAnalogyBank(grade: Grade = 3): Question[] {
  return RAW_ITEMS.flatMap((item, i): Question[] => gradesOf(item).includes(grade) ? [{
    id: `verbal-analogy-${i}`,
    domain: 'verbal',
    subType: 'verbal-analogy',
    difficulty: 1,
    promptAudioText: VERBAL_ANALOGY_PROMPT,
    promptVisual: [
      [word(item.pair[0]), arrow, word(item.pair[1])],
      [word(item.start), arrow, { kind: 'blank' }],
    ],
    choices: [item.correct, ...item.distractors].map((value, ci) => ({
      id: `c${ci}`,
      content: word(value),
      isCorrect: ci === 0,
    })),
    explanationAudioText: `How they go together: ${item.relation}.`,
    source: 'authored',
  }] : [])
}
