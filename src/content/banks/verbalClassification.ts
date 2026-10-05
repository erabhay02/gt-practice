import type { ContentSpec, Grade, Question } from '../types'

const word = (value: string): ContentSpec => ({ kind: 'word', value })

interface RawItem {
  example: [string, string, string]
  correct: string
  // At least one trap is "close but not quite": related, but outside the group.
  distractors: [string, string, string]
  category: string
  // Default: both 3rd and 4th grade.
  grades?: Grade[]
}

// CogAT Levels 9–10 Verbal Classification: three words that belong together,
// and the child picks the one word that belongs with them.
const RAW_ITEMS: RawItem[] = [
  { example: ['apple', 'banana', 'grape'], correct: 'cherry', distractors: ['carrot', 'bread', 'seed'], category: 'fruits' },
  { example: ['robin', 'eagle', 'sparrow'], correct: 'owl', distractors: ['bat', 'butterfly', 'airplane'], category: 'birds' },
  { example: ['hammer', 'saw', 'wrench'], correct: 'screwdriver', distractors: ['nail', 'wood', 'toolbox'], category: 'tools' },
  { example: ['red', 'blue', 'yellow'], correct: 'green', distractors: ['paint', 'crayon', 'bright'], category: 'colors' },
  { example: ['piano', 'guitar', 'violin'], correct: 'drum', distractors: ['song', 'music', 'singer'], category: 'musical instruments' },
  { example: ['shirt', 'pants', 'jacket'], correct: 'sweater', distractors: ['closet', 'button', 'cotton'], category: 'clothes' },
  { example: ['Monday', 'Friday', 'Sunday'], correct: 'Tuesday', distractors: ['January', 'week', 'morning'], category: 'days of the week' },
  { example: ['car', 'bus', 'truck'], correct: 'van', distractors: ['road', 'driver', 'wheel'], category: 'vehicles' },
  { example: ['lion', 'tiger', 'leopard'], correct: 'cheetah', distractors: ['wolf', 'zebra', 'jungle'], category: 'big cats' },
  { example: ['circle', 'square', 'triangle'], correct: 'rectangle', distractors: ['corner', 'line', 'ball'], category: 'flat shapes' },
  { example: ['happy', 'glad', 'cheerful'], correct: 'joyful', distractors: ['sad', 'smile', 'party'], category: 'words that mean happy' },
  { example: ['river', 'lake', 'ocean'], correct: 'pond', distractors: ['boat', 'fish', 'sand'], category: 'bodies of water' },
  { example: ['inch', 'foot', 'yard'], correct: 'mile', distractors: ['ruler', 'pound', 'gallon'], category: 'units of length' },
  { example: ['spoon', 'fork', 'knife'], correct: 'chopsticks', distractors: ['plate', 'napkin', 'food'], category: 'things you eat with' },
  { example: ['milk', 'juice', 'water'], correct: 'lemonade', distractors: ['cup', 'bread', 'thirsty'], category: 'drinks' },
  { example: ['January', 'March', 'July'], correct: 'October', distractors: ['Monday', 'summer', 'calendar'], category: 'months' },
  { example: ['doctor', 'teacher', 'firefighter'], correct: 'pilot', distractors: ['hospital', 'school', 'uniform'], category: 'jobs' },
  { example: ['nose', 'eyes', 'mouth'], correct: 'ears', distractors: ['face', 'glasses', 'smell'], category: 'parts of the face' },
  { example: ['penny', 'nickel', 'dime'], correct: 'quarter', distractors: ['wallet', 'bank', 'price'], category: 'coins' },
  { example: ['oak', 'maple', 'pine'], correct: 'birch', distractors: ['leaf', 'forest', 'rose'], category: 'trees' },
  { example: ['rain', 'snow', 'sleet'], correct: 'hail', distractors: ['cloud', 'umbrella', 'cold'], category: 'things that fall from clouds' },
  { example: ['ant', 'beetle', 'fly'], correct: 'bee', distractors: ['spider', 'worm', 'snail'], category: 'insects' },
  { example: ['tulip', 'daisy', 'rose'], correct: 'lily', distractors: ['oak', 'grass', 'vase'], category: 'flowers' },
  { example: ['bake', 'boil', 'fry'], correct: 'roast', distractors: ['oven', 'eat', 'pan'], category: 'ways to cook' },
  { example: ['skip', 'hop', 'jump'], correct: 'leap', distractors: ['sit', 'sleep', 'shoe'], category: 'ways to move' },
  { example: ['Earth', 'Mars', 'Venus'], correct: 'Jupiter', distractors: ['Moon', 'Sun', 'star'], category: 'planets' },
  { example: ['ten', 'twenty', 'thirty'], correct: 'forty', distractors: ['eleven', 'five', 'number'], category: 'counting by tens' },
  { example: ['cold', 'chilly', 'freezing'], correct: 'icy', distractors: ['warm', 'winter', 'snow'], category: 'words for cold' },
  { example: ['cup', 'bowl', 'glass'], correct: 'mug', distractors: ['milk', 'spoon', 'table'], category: 'things that hold food or drink' },
  { example: ['lettuce', 'carrot', 'celery'], correct: 'broccoli', distractors: ['apple', 'rabbit', 'salad'], category: 'vegetables' },
  { example: ['baseball', 'soccer', 'tennis'], correct: 'basketball', distractors: ['bat', 'stadium', 'swimming'], category: 'ball games' },
  { example: ['north', 'south', 'east'], correct: 'west', distractors: ['up', 'left', 'map'], category: 'directions on a compass' },
  { example: ['cow', 'pig', 'goat'], correct: 'sheep', distractors: ['lion', 'barn', 'farmer'], category: 'farm animals' },
  { example: ['shark', 'whale', 'octopus'], correct: 'dolphin', distractors: ['frog', 'beach', 'boat'], category: 'sea animals' },
  { example: ['pencil', 'crayon', 'marker'], correct: 'pen', distractors: ['paper', 'eraser', 'desk'], category: 'things you write or draw with' },
  // 4th grade (Level 10): finer distinctions and less familiar groups.
  { example: ['sad', 'angry', 'afraid'], correct: 'lonely', distractors: ['smile', 'cry', 'happy'], category: 'unpleasant feelings', grades: [4] },
  { example: ['gallon', 'quart', 'pint'], correct: 'cup', distractors: ['pound', 'inch', 'bottle'], category: 'units for liquids', grades: [4] },
  { example: ['author', 'poet', 'novelist'], correct: 'playwright', distractors: ['book', 'reader', 'pencil'], category: 'kinds of writers', grades: [4] },
  { example: ['triangle', 'pentagon', 'hexagon'], correct: 'octagon', distractors: ['circle', 'cube', 'line'], category: 'shapes with straight sides', grades: [4] },
  { example: ['whale', 'dolphin', 'bat'], correct: 'mouse', distractors: ['shark', 'eagle', 'penguin'], category: 'mammals', grades: [4] },
  { example: ['steel', 'copper', 'iron'], correct: 'gold', distractors: ['wood', 'plastic', 'glass'], category: 'metals', grades: [4] },
  { example: ['ancient', 'old', 'aged'], correct: 'elderly', distractors: ['young', 'new', 'history'], category: 'words for old', grades: [4] },
  { example: ['violin', 'cello', 'harp'], correct: 'guitar', distractors: ['drum', 'flute', 'trumpet'], category: 'string instruments', grades: [4] },
  { example: ['kilometer', 'meter', 'centimeter'], correct: 'millimeter', distractors: ['kilogram', 'liter', 'ruler'], category: 'metric units of length', grades: [4] },
  { example: ['hurricane', 'tornado', 'blizzard'], correct: 'thunderstorm', distractors: ['wind', 'weather', 'sunshine'], category: 'storms', grades: [4] },
  { example: ['sphere', 'cube', 'cylinder'], correct: 'cone', distractors: ['circle', 'square', 'triangle'], category: 'solid shapes', grades: [4] },
  { example: ['nephew', 'niece', 'cousin'], correct: 'uncle', distractors: ['friend', 'neighbor', 'teacher'], category: 'relatives', grades: [4] },
  { example: ['Pacific', 'Atlantic', 'Indian'], correct: 'Arctic', distractors: ['Amazon', 'Mississippi', 'Nile'], category: 'oceans', grades: [4] },
  { example: ['hour', 'minute', 'second'], correct: 'day', distractors: ['clock', 'calendar', 'early'], category: 'units of time', grades: [4] },
  { example: ['Texas', 'Ohio', 'Florida'], correct: 'Maine', distractors: ['Canada', 'Dallas', 'America'], category: 'U.S. states', grades: [4] },
  { example: ['swift', 'rapid', 'quick'], correct: 'fast', distractors: ['slow', 'race', 'runner'], category: 'words that mean fast', grades: [4] },
  { example: ['carpenter', 'plumber', 'electrician'], correct: 'mechanic', distractors: ['hammer', 'pipe', 'wire'], category: 'trades', grades: [4] },
  { example: ['lungs', 'heart', 'brain'], correct: 'stomach', distractors: ['blood', 'air', 'doctor'], category: 'organs', grades: [4] },
  { example: ['pebble', 'boulder', 'rock'], correct: 'stone', distractors: ['tree', 'water', 'mountain'], category: 'words for rocks', grades: [4] },
  { example: ['noun', 'verb', 'adjective'], correct: 'adverb', distractors: ['sentence', 'spelling', 'letter'], category: 'parts of speech', grades: [4] },
]

const gradesOf = (item: RawItem): Grade[] => item.grades ?? [3, 4]

export const VERBAL_CLASSIFICATION_PROMPT =
  'The three words in the top row are alike in some way. Which word below goes with them?'

export function buildVerbalClassificationBank(grade: Grade = 3): Question[] {
  return RAW_ITEMS.flatMap((item, i): Question[] => gradesOf(item).includes(grade) ? [{
    id: `verbal-classification-${i}`,
    domain: 'verbal',
    subType: 'verbal-classification',
    difficulty: 1,
    promptAudioText: VERBAL_CLASSIFICATION_PROMPT,
    promptVisual: [item.example.map(word)],
    choices: [item.correct, ...item.distractors].map((value, ci) => ({
      id: `c${ci}`,
      content: word(value),
      isCorrect: ci === 0,
    })),
    explanationAudioText: `They are all ${item.category}.`,
    source: 'authored',
  }] : [])
}
