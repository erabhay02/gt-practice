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
  { example: ['sad', 'angry', 'afraid'], correct: 'lonely', distractors: ['smile', 'cry', 'happy'], category: 'unpleasant feelings', grades: [4, 5, 6] },
  { example: ['gallon', 'quart', 'pint'], correct: 'cup', distractors: ['pound', 'inch', 'bottle'], category: 'units for liquids', grades: [4, 5, 6] },
  { example: ['author', 'poet', 'novelist'], correct: 'playwright', distractors: ['book', 'reader', 'pencil'], category: 'kinds of writers', grades: [4, 5, 6] },
  { example: ['triangle', 'pentagon', 'hexagon'], correct: 'octagon', distractors: ['circle', 'cube', 'line'], category: 'shapes with straight sides', grades: [4, 5, 6] },
  { example: ['whale', 'dolphin', 'bat'], correct: 'mouse', distractors: ['shark', 'eagle', 'penguin'], category: 'mammals', grades: [4, 5, 6] },
  { example: ['steel', 'copper', 'iron'], correct: 'gold', distractors: ['wood', 'plastic', 'glass'], category: 'metals', grades: [4, 5, 6] },
  { example: ['ancient', 'old', 'aged'], correct: 'elderly', distractors: ['young', 'new', 'history'], category: 'words for old', grades: [4, 5, 6] },
  { example: ['violin', 'cello', 'harp'], correct: 'guitar', distractors: ['drum', 'flute', 'trumpet'], category: 'string instruments', grades: [4, 5, 6] },
  { example: ['kilometer', 'meter', 'centimeter'], correct: 'millimeter', distractors: ['kilogram', 'liter', 'ruler'], category: 'metric units of length', grades: [4, 5, 6] },
  { example: ['hurricane', 'tornado', 'blizzard'], correct: 'thunderstorm', distractors: ['wind', 'weather', 'sunshine'], category: 'storms', grades: [4, 5, 6] },
  { example: ['sphere', 'cube', 'cylinder'], correct: 'cone', distractors: ['circle', 'square', 'triangle'], category: 'solid shapes', grades: [4, 5, 6] },
  { example: ['nephew', 'niece', 'cousin'], correct: 'uncle', distractors: ['friend', 'neighbor', 'teacher'], category: 'relatives', grades: [4, 5, 6] },
  { example: ['Pacific', 'Atlantic', 'Indian'], correct: 'Arctic', distractors: ['Amazon', 'Mississippi', 'Nile'], category: 'oceans', grades: [4, 5, 6] },
  { example: ['hour', 'minute', 'second'], correct: 'day', distractors: ['clock', 'calendar', 'early'], category: 'units of time', grades: [4, 5, 6] },
  { example: ['Texas', 'Ohio', 'Florida'], correct: 'Maine', distractors: ['Canada', 'Dallas', 'America'], category: 'U.S. states', grades: [4, 5, 6] },
  { example: ['swift', 'rapid', 'quick'], correct: 'fast', distractors: ['slow', 'race', 'runner'], category: 'words that mean fast', grades: [4, 5, 6] },
  { example: ['carpenter', 'plumber', 'electrician'], correct: 'mechanic', distractors: ['hammer', 'pipe', 'wire'], category: 'trades', grades: [4, 5, 6] },
  { example: ['lungs', 'heart', 'brain'], correct: 'stomach', distractors: ['blood', 'air', 'doctor'], category: 'organs', grades: [4, 5, 6] },
  { example: ['pebble', 'boulder', 'rock'], correct: 'stone', distractors: ['tree', 'water', 'mountain'], category: 'words for rocks', grades: [4, 5, 6] },
  { example: ['noun', 'verb', 'adjective'], correct: 'adverb', distractors: ['sentence', 'spelling', 'letter'], category: 'parts of speech', grades: [4, 5, 6] },
  // New batch (2026-10-10) — appended at the true end so existing items keep their
  // index-based ids. promptAudioText is the constant VERBAL_CLASSIFICATION_PROMPT
  // here (not per-item), so this bank needs no new audio clips.
  { example: ['snake', 'lizard', 'turtle'], correct: 'crocodile', distractors: ['frog', 'fish', 'spider'], category: 'reptiles' },
  { example: ['oven', 'toaster', 'blender'], correct: 'microwave', distractors: ['plate', 'fork', 'napkin'], category: 'kitchen appliances' },
  { example: ['chess', 'checkers', 'Monopoly'], correct: 'Scrabble', distractors: ['soccer', 'puzzle', 'cards'], category: 'board games' },
  { example: ['Asia', 'Africa', 'Europe'], correct: 'Australia', distractors: ['Egypt', 'China', 'London'], category: 'continents' },
  // 4th grade only: finer distinctions, matching this file's existing grades:[4] bar.
  { example: ['solar', 'wind', 'hydro'], correct: 'geothermal', distractors: ['coal', 'oil', 'gas'], category: 'renewable energy sources', grades: [4, 5, 6] },
  { example: ['comma', 'period', 'question mark'], correct: 'semicolon', distractors: ['letter', 'word', 'sentence'], category: 'punctuation marks', grades: [4, 5, 6] },
  // Second new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { example: ['cake', 'pie', 'cookie'], correct: 'brownie', distractors: ['bread', 'salad', 'soup'], category: 'desserts' },
  { example: ['rain', 'snow', 'sunshine'], correct: 'fog', distractors: ['umbrella', 'coat', 'cloud'], category: 'kinds of weather' },
  { example: ['circle', 'oval', 'crescent'], correct: 'ellipse', distractors: ['square', 'triangle', 'star'], category: 'shapes with curves' },
  { example: ['math', 'science', 'reading'], correct: 'art', distractors: ['recess', 'lunch', 'homework'], category: 'school subjects' },
  // 4th grade only: finer distinctions, matching this file's existing grades:[4] bar.
  { example: ['metaphor', 'simile', 'hyperbole'], correct: 'personification', distractors: ['noun', 'paragraph', 'sentence'], category: 'figurative language', grades: [4, 5, 6] },
  { example: ['biology', 'chemistry', 'physics'], correct: 'astronomy', distractors: ['math', 'history', 'art'], category: 'branches of science', grades: [4, 5, 6] },
  // Third new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { example: ['canoe', 'kayak', 'sailboat'], correct: 'yacht', distractors: ['car', 'bicycle', 'train'], category: 'types of boats' },
  { example: ['bagel', 'baguette', 'pretzel'], correct: 'roll', distractors: ['cake', 'pie', 'cookie'], category: 'kinds of bread' },
  { example: ['poker', 'solitaire', 'Uno'], correct: 'Rummy', distractors: ['chess', 'soccer', 'tag'], category: 'card games' },
  { example: ['wheat', 'corn', 'soybeans'], correct: 'rice', distractors: ['rose', 'oak', 'cactus'], category: 'farm crops' },
  // 4th grade only: finer distinctions, matching this file's existing grades:[4] bar.
  { example: ['democracy', 'monarchy', 'dictatorship'], correct: 'republic', distractors: ['country', 'president', 'law'], category: 'types of government', grades: [4, 5, 6] },
  { example: ['rotation', 'reflection', 'translation'], correct: 'dilation', distractors: ['angle', 'line', 'point'], category: 'geometric transformations', grades: [4, 5, 6] },
  // Fourth new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { example: ['spaghetti', 'macaroni', 'penne'], correct: 'fettuccine', distractors: ['bread', 'rice', 'pizza'], category: 'kinds of pasta' },
  { example: ['poodle', 'beagle', 'bulldog'], correct: 'terrier', distractors: ['cat', 'rabbit', 'hamster'], category: 'dog breeds' },
  { example: ['diamond', 'ruby', 'emerald'], correct: 'sapphire', distractors: ['rock', 'sand', 'pebble'], category: 'precious gems' },
  { example: ['Thanksgiving', 'Halloween', 'Christmas'], correct: 'Easter', distractors: ['Monday', 'summer', 'birthday'], category: 'U.S. holidays' },
  // 4th grade only: finer distinctions, matching this file's existing grades:[4] bar.
  { example: ['mystery', 'fantasy', 'romance'], correct: 'biography', distractors: ['chapter', 'author', 'library'], category: 'literary genres', grades: [4, 5, 6] },
  { example: ['oxygen', 'hydrogen', 'carbon'], correct: 'nitrogen', distractors: ['water', 'air', 'salt'], category: 'chemical elements', grades: [4, 5, 6] },
  // Fifth new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { example: ['ant', 'bee', 'termite'], correct: 'wasp', distractors: ['spider', 'worm', 'snail'], category: 'insects that live in colonies' },
  { example: ['whisper', 'mumble', 'murmur'], correct: 'mutter', distractors: ['shout', 'yell', 'scream'], category: 'words for speaking quietly' },
  { example: ['swim', 'sail', 'paddle'], correct: 'row', distractors: ['walk', 'drive', 'climb'], category: 'ways to travel across water' },
  { example: ['ruler', 'scale', 'thermometer'], correct: 'gauge', distractors: ['hammer', 'pencil', 'spoon'], category: 'tools for measuring' },
  { example: ['guitar', 'violin', 'harp'], correct: 'banjo', distractors: ['drum', 'trumpet', 'flute'], category: 'instruments with strings' },
  // 4th grade only: finer distinctions, matching this file's existing grades:[4] bar.
  { example: ['crust', 'mantle', 'core'], correct: 'atmosphere', distractors: ['ocean', 'volcano', 'mountain'], category: "layers of the Earth's structure", grades: [4, 5, 6] },
  { example: ['ounce', 'pound', 'ton'], correct: 'gram', distractors: ['inch', 'gallon', 'mile'], category: 'units of weight', grades: [4, 5, 6] },
  // Sixth new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  // This batch brings verbal-classification to the plan's "roughly double" target.
  { example: ['spatula', 'whisk', 'ladle'], correct: 'tongs', distractors: ['plate', 'napkin', 'table'], category: 'kitchen tools' },
  { example: ['ballet', 'tap', 'salsa'], correct: 'ballroom', distractors: ['gymnastics', 'yoga', 'swimming'], category: 'types of dances' },
  { example: ['barn', 'silo', 'coop'], correct: 'stable', distractors: ['school', 'store', 'hospital'], category: 'farm buildings' },
  { example: ['skiing', 'sledding', 'ice skating'], correct: 'snowboarding', distractors: ['swimming', 'surfing', 'sunbathing'], category: 'winter activities' },
  { example: ['root', 'stem', 'leaf'], correct: 'petal', distractors: ['rock', 'sand', 'cloud'], category: 'parts of a plant' },
  { example: ['stool', 'recliner', 'rocking chair'], correct: 'armchair', distractors: ['table', 'lamp', 'rug'], category: 'kinds of chairs' },
  { example: ['huge', 'enormous', 'gigantic'], correct: 'massive', distractors: ['tiny', 'small', 'little'], category: 'words for big' },
  { example: ['tiny', 'little', 'petite'], correct: 'miniature', distractors: ['huge', 'large', 'giant'], category: 'words for small' },
  { example: ['parrot', 'monkey', 'toucan'], correct: 'jaguar', distractors: ['polar bear', 'penguin', 'walrus'], category: 'tropical animals' },
  { example: ['backpack', 'notebook', 'pencil case'], correct: 'binder', distractors: ['couch', 'oven', 'car'], category: 'school supplies' },
  { example: ['tomato soup', 'chicken soup', 'vegetable soup'], correct: 'minestrone', distractors: ['sandwich', 'salad', 'pizza'], category: 'kinds of soup' },
  { example: ['puppy', 'kitten', 'chick'], correct: 'calf', distractors: ['dog', 'cat', 'hen'], category: 'baby animals' },
  { example: ['furious', 'irritated', 'annoyed'], correct: 'enraged', distractors: ['happy', 'calm', 'joyful'], category: 'words meaning angry' },
  { example: ['zebra', 'tiger', 'candy cane'], correct: 'barber pole', distractors: ['apple', 'ball', 'box'], category: 'things that are striped' },
  { example: ['Chicago', 'Boston', 'Seattle'], correct: 'Denver', distractors: ['California', 'Texas', 'America'], category: 'U.S. cities' },
  { example: ['beanie', 'baseball cap', 'sombrero'], correct: 'beret', distractors: ['shoe', 'glove', 'scarf'], category: 'kinds of hats' },
  { example: ['red', 'orange', 'yellow'], correct: 'green', distractors: ['black', 'white', 'gray'], category: 'colors of the rainbow' },
  // 4th grade only: finer distinctions, matching this file's existing grades:[4] bar.
  { example: ['cumulus', 'cirrus', 'stratus'], correct: 'nimbus', distractors: ['fog', 'rain', 'wind'], category: 'types of clouds', grades: [4, 5, 6] },
  { example: ['kinetic', 'potential', 'thermal'], correct: 'chemical', distractors: ['battery', 'fire', 'heat'], category: 'types of energy', grades: [4, 5, 6] },
  { example: ['chapter', 'index', 'glossary'], correct: 'appendix', distractors: ['movie', 'song', 'painting'], category: 'parts of a book', grades: [4, 5, 6] },
  { example: ['granite', 'marble', 'limestone'], correct: 'sandstone', distractors: ['diamond', 'gold', 'silver'], category: 'types of rock', grades: [4, 5, 6] },
  { example: ['Egyptian', 'Roman', 'Greek'], correct: 'Mayan', distractors: ['modern', 'future', 'recent'], category: 'ancient civilizations', grades: [4, 5, 6] },
  { example: ['suspension', 'arch', 'beam'], correct: 'truss', distractors: ['tunnel', 'road', 'highway'], category: 'types of bridges', grades: [4, 5, 6] },
  { example: ['cactus', 'agave', 'yucca'], correct: 'succulent', distractors: ['fern', 'moss', 'lily'], category: 'desert plants', grades: [4, 5, 6] },
  // Phase 3 (2026-10-10): CogAT Levels 11/12 (5th/6th grade) start here — a
  // notch past the 4th-grade knowledge-classification tier above, same
  // cumulative, append-only pattern as verbalAnalogy.ts.
  { example: ['onomatopoeia', 'alliteration', 'idiom'], correct: 'allusion', distractors: ['noun', 'verb', 'adjective'], category: 'figures of speech', grades: [5, 6] },
  { example: ['theocracy', 'oligarchy', 'communism'], correct: 'federalism', distractors: ['election', 'senate', 'mayor'], category: 'systems of government', grades: [5, 6] },
  { example: ['protagonist', 'antagonist', 'narrator'], correct: 'foil', distractors: ['setting', 'plot', 'theme'], category: 'roles a character can play in a story', grades: [5, 6] },
  { example: ['equilateral', 'isosceles', 'scalene'], correct: 'right', distractors: ['circle', 'square', 'hexagon'], category: 'types of triangles', grades: [5, 6] },
  { example: ['mitosis', 'meiosis', 'binary fission'], correct: 'budding', distractors: ['photosynthesis', 'respiration', 'digestion'], category: 'ways cells or organisms reproduce', grades: [5, 6] },
  { example: ['stalactite', 'stalagmite', 'sinkhole'], correct: 'cavern', distractors: ['volcano', 'glacier', 'canyon'], category: 'cave formations', grades: [5, 6] },
  { example: ['supply', 'demand', 'inflation'], correct: 'recession', distractors: ['store', 'bank', 'money'], category: 'economic terms', grades: [5, 6] },
  { example: ['solid', 'liquid', 'gas'], correct: 'plasma', distractors: ['water', 'ice', 'steam'], category: 'states of matter', grades: [5, 6] },
  { example: ['peninsula', 'isthmus', 'archipelago'], correct: 'atoll', distractors: ['mountain', 'valley', 'plateau'], category: 'landforms shaped by water', grades: [5, 6] },
  { example: ['allegory', 'satire', 'parody'], correct: 'fable', distractors: ['essay', 'biography', 'textbook'], category: 'literary forms', grades: [5, 6] },
  { example: ['Congress', 'Senate', 'House of Representatives'], correct: 'Parliament', distractors: ['President', 'Court', 'Governor'], category: 'legislative bodies', grades: [5, 6] },
  { example: ['insectivore', 'herbivore', 'carnivore'], correct: 'omnivore', distractors: ['predator', 'prey', 'scavenger'], category: 'types of animal diets', grades: [5, 6] },
]

const gradesOf = (item: RawItem): Grade[] => item.grades ?? [3, 4, 5, 6]

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
