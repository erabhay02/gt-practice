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
  { pair: ['clock', 'time'], start: 'thermometer', correct: 'temperature', distractors: ['weather', 'hot', 'glass'], relation: 'tool : what it measures', grades: [4, 5, 6] },
  { pair: ['ruler', 'length'], start: 'scale', correct: 'weight', distractors: ['heavy', 'fish', 'measure'], relation: 'tool : what it measures', grades: [4, 5, 6] },
  { pair: ['square', 'cube'], start: 'circle', correct: 'sphere', distractors: ['round', 'triangle', 'ring'], relation: 'flat shape : solid shape', grades: [4, 5, 6] },
  { pair: ['hour', 'minute'], start: 'minute', correct: 'second', distractors: ['clock', 'hour', 'time'], relation: 'unit : next smaller unit', grades: [4, 5, 6] },
  { pair: ['begin', 'start'], start: 'finish', correct: 'end', distractors: ['stop', 'first', 'start'], relation: 'same meaning', grades: [4, 5, 6] },
  { pair: ['inch', 'foot'], start: 'centimeter', correct: 'meter', distractors: ['ruler', 'mile', 'millimeter'], relation: 'small unit : bigger unit', grades: [4, 5, 6] },
  { pair: ['author', 'novel'], start: 'composer', correct: 'symphony', distractors: ['piano', 'orchestra', 'singer'], relation: 'creator : work', grades: [4, 5, 6] },
  { pair: ['year', 'month'], start: 'week', correct: 'day', distractors: ['hour', 'calendar', 'month'], relation: 'whole : part', grades: [4, 5, 6] },
  { pair: ['ice', 'water'], start: 'water', correct: 'steam', distractors: ['ocean', 'rain', 'cold'], relation: 'what it becomes when heated', grades: [4, 5, 6] },
  { pair: ['polite', 'rude'], start: 'honest', correct: 'dishonest', distractors: ['truthful', 'kind', 'rude'], relation: 'opposites', grades: [4, 5, 6] },
  { pair: ['telescope', 'stars'], start: 'microscope', correct: 'germs', distractors: ['glass', 'lens', 'planets'], relation: 'tool : what you look at', grades: [4, 5, 6] },
  { pair: ['architect', 'building'], start: 'chef', correct: 'meal', distractors: ['kitchen', 'apron', 'restaurant'], relation: 'maker : what they make', grades: [4, 5, 6] },
  { pair: ['drought', 'water'], start: 'famine', correct: 'food', distractors: ['hunger', 'rain', 'farm'], relation: 'shortage : of what', grades: [4, 5, 6] },
  { pair: ['cub', 'bear'], start: 'foal', correct: 'horse', distractors: ['saddle', 'barn', 'cow'], relation: 'baby animal : grown animal', grades: [4, 5, 6] },
  { pair: ['grape', 'raisin'], start: 'plum', correct: 'prune', distractors: ['peach', 'juice', 'purple'], relation: 'fruit : dried fruit', grades: [4, 5, 6] },
  { pair: ['add', 'subtract'], start: 'multiply', correct: 'divide', distractors: ['plus', 'times', 'sum'], relation: 'opposite operations', grades: [4, 5, 6] },
  { pair: ['old', 'new'], start: 'ancient', correct: 'modern', distractors: ['history', 'past', 'antique'], relation: 'opposites', grades: [4, 5, 6] },
  { pair: ['good', 'excellent'], start: 'bad', correct: 'terrible', distractors: ['okay', 'sad', 'excellent'], relation: 'a word : a stronger word', grades: [4, 5, 6] },
  { pair: ['sculptor', 'statue'], start: 'poet', correct: 'poem', distractors: ['rhyme', 'reader', 'book'], relation: 'creator : work', grades: [4, 5, 6] },
  { pair: ['rare', 'common'], start: 'scarce', correct: 'plentiful', distractors: ['few', 'empty', 'rare'], relation: 'opposites', grades: [4, 5, 6] },
  // New batch (2026-10-10) — appended at the true end so existing items keep their
  // index-based ids. promptAudioText is the constant VERBAL_ANALOGY_PROMPT here (not
  // per-item), so unlike sentenceCompletion.ts, this bank needs no new audio clips.
  { pair: ['cow', 'moo'], start: 'duck', correct: 'quack', distractors: ['honk', 'bark', 'squawk'], relation: 'animal : its sound' },
  { pair: ['chick', 'chicken'], start: 'lamb', correct: 'sheep', distractors: ['wool', 'goat', 'puppy'], relation: 'baby animal : grown animal' },
  { pair: ['up', 'down'], start: 'left', correct: 'right', distractors: ['east', 'center', 'down'], relation: 'opposites' },
  { pair: ['hammer', 'pound'], start: 'broom', correct: 'sweep', distractors: ['dust', 'clean', 'pound'], relation: 'tool : what it does' },
  { pair: ['petal', 'flower'], start: 'branch', correct: 'tree', distractors: ['leaf', 'root', 'petal'], relation: 'part : whole' },
  { pair: ['painter', 'brush'], start: 'writer', correct: 'pen', distractors: ['paper', 'book', 'brush'], relation: 'worker : tool they use' },
  // 4th grade only: less familiar words, matching this file's existing grades:[4] bar.
  { pair: ['joey', 'kangaroo'], start: 'cygnet', correct: 'swan', distractors: ['duck', 'goose', 'joey'], relation: 'baby animal : grown animal', grades: [4, 5, 6] },
  { pair: ['carnivore', 'meat'], start: 'herbivore', correct: 'plants', distractors: ['animals', 'grass', 'meat'], relation: 'diet type : what it eats', grades: [4, 5, 6] },
  // Second new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { pair: ['teacher', 'classroom'], start: 'actor', correct: 'stage', distractors: ['audience', 'script', 'movie'], relation: 'worker : workplace' },
  { pair: ['knife', 'slice'], start: 'needle', correct: 'sew', distractors: ['thread', 'prick', 'fabric'], relation: 'tool : what it does' },
  { pair: ['bicycle', 'pedal'], start: 'car', correct: 'drive', distractors: ['wheel', 'road', 'gas'], relation: 'vehicle : how you move it' },
  { pair: ['light', 'dark'], start: 'full', correct: 'empty', distractors: ['hungry', 'half', 'dark'], relation: 'opposites' },
  { pair: ['stem', 'flower'], start: 'trunk', correct: 'tree', distractors: ['branch', 'root', 'leaf'], relation: 'part : whole' },
  { pair: ['sour', 'lemon'], start: 'sweet', correct: 'candy', distractors: ['sugar', 'cake', 'lemon'], relation: 'taste : example' },
  { pair: ['rooster', 'crow'], start: 'owl', correct: 'hoot', distractors: ['screech', 'howl', 'crow'], relation: 'animal : its sound' },
  // 4th grade only: less familiar words, matching this file's existing grades:[4] bar.
  { pair: ['fragile', 'break'], start: 'durable', correct: 'last', distractors: ['break', 'bend', 'shatter'], relation: 'trait : what happens', grades: [4, 5, 6] },
  { pair: ['predator', 'hunts'], start: 'prey', correct: 'flees', distractors: ['hunts', 'hides', 'sleeps'], relation: 'role : what it does', grades: [4, 5, 6] },
  { pair: ['vast', 'huge'], start: 'minuscule', correct: 'tiny', distractors: ['huge', 'large', 'tall'], relation: 'same meaning', grades: [4, 5, 6] },
  // Third new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { pair: ['scissors', 'cut'], start: 'spoon', correct: 'stir', distractors: ['bowl', 'soup', 'cut'], relation: 'tool : what it does' },
  { pair: ['apple', 'red'], start: 'banana', correct: 'yellow', distractors: ['green', 'peel', 'red'], relation: 'fruit : color' },
  { pair: ['warm', 'hot'], start: 'cool', correct: 'cold', distractors: ['mild', 'freezing', 'hot'], relation: 'a word : a stronger word' },
  { pair: ['spring', 'flowers'], start: 'fall', correct: 'leaves', distractors: ['snow', 'sun', 'flowers'], relation: 'season : what you see' },
  { pair: ['teacher', 'students'], start: 'shepherd', correct: 'sheep', distractors: ['wolf', 'farm', 'students'], relation: 'leader : group they lead' },
  { pair: ['curious', 'ask'], start: 'scared', correct: 'hide', distractors: ['laugh', 'sleep', 'ask'], relation: 'feeling : what you do' },
  // 4th grade only: less familiar words, matching this file's existing grades:[4] bar.
  { pair: ['bland', 'spicy'], start: 'dim', correct: 'bright', distractors: ['dark', 'light', 'spicy'], relation: 'opposites', grades: [4, 5, 6] },
  { pair: ['migrate', 'travel'], start: 'hibernate', correct: 'sleep', distractors: ['travel', 'eat', 'build'], relation: 'animal behavior : simple meaning', grades: [4, 5, 6] },
  // Fourth new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { pair: ['sandpaper', 'rough'], start: 'silk', correct: 'smooth', distractors: ['soft', 'shiny', 'rough'], relation: 'texture' },
  { pair: ['library', 'quiet'], start: 'playground', correct: 'loud', distractors: ['fun', 'outside', 'quiet'], relation: 'place : how it sounds' },
  { pair: ['sun', 'star'], start: 'earth', correct: 'planet', distractors: ['moon', 'space', 'star'], relation: 'thing : what it is' },
  { pair: ['boil', 'steam'], start: 'freeze', correct: 'ice', distractors: ['cold', 'water', 'steam'], relation: 'action : result' },
  { pair: ['artist', 'paint'], start: 'musician', correct: 'play', distractors: ['sing', 'note', 'paint'], relation: 'person : what they do with their art' },
  { pair: ['whale', 'mammal'], start: 'shark', correct: 'fish', distractors: ['ocean', 'mammal', 'swim'], relation: 'animal : type of animal' },
  // 4th grade only: less familiar words, matching this file's existing grades:[4] bar.
  { pair: ['abundant', 'scarce'], start: 'generous', correct: 'stingy', distractors: ['kind', 'scarce', 'rich'], relation: 'opposites', grades: [4, 5, 6] },
  { pair: ['author', 'write'], start: 'sculptor', correct: 'carve', distractors: ['write', 'paint', 'build'], relation: 'person : what they do', grades: [4, 5, 6] },
  // Fifth new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { pair: ['clean', 'spotless'], start: 'dirty', correct: 'filthy', distractors: ['messy', 'spotless', 'muddy'], relation: 'a word : a stronger word' },
  { pair: ['north', 'south'], start: 'east', correct: 'west', distractors: ['up', 'down', 'south'], relation: 'opposites' },
  { pair: ['sing', 'song'], start: 'dance', correct: 'routine', distractors: ['music', 'step', 'song'], relation: 'action : the thing made' },
  { pair: ['wolf', 'pack'], start: 'fish', correct: 'school', distractors: ['pond', 'pack', 'fin'], relation: 'animal : group name' },
  { pair: ['brick', 'wall'], start: 'thread', correct: 'fabric', distractors: ['needle', 'wall', 'sew'], relation: 'small piece : what it builds' },
  { pair: ['kind', 'mean'], start: 'brave', correct: 'cowardly', distractors: ['scared', 'mean', 'strong'], relation: 'opposites' },
  { pair: ['waiter', 'restaurant'], start: 'cashier', correct: 'store', distractors: ['money', 'customer', 'restaurant'], relation: 'worker : workplace' },
  // 4th grade only: less familiar words, matching this file's existing grades:[4] bar.
  { pair: ['gain', 'lose'], start: 'increase', correct: 'decrease', distractors: ['lose', 'grow', 'rise'], relation: 'opposites', grades: [4, 5, 6] },
  { pair: ['famine', 'hunger'], start: 'drought', correct: 'thirst', distractors: ['hunger', 'flood', 'rain'], relation: 'shortage : what it causes', grades: [4, 5, 6] },
  { pair: ['verdict', 'judge'], start: 'diagnosis', correct: 'doctor', distractors: ['judge', 'patient', 'medicine'], relation: 'decision : who makes it', grades: [4, 5, 6] },
  // Sixth new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  // This batch brings verbal-analogy to the plan's "roughly double" target.
  { pair: ['bee', 'sting'], start: 'dog', correct: 'bite', distractors: ['bark', 'wag', 'run'], relation: 'animal : how it defends itself' },
  { pair: ['pencil', 'write'], start: 'eraser', correct: 'erase', distractors: ['paper', 'mistake', 'pencil'], relation: 'tool : what it does' },
  { pair: ['winter', 'cold'], start: 'summer', correct: 'hot', distractors: ['warm', 'spring', 'cold'], relation: 'season : temperature' },
  { pair: ['puppy', 'bark'], start: 'kitten', correct: 'meow', distractors: ['purr', 'hiss', 'bark'], relation: 'animal : its sound' },
  { pair: ['short', 'long'], start: 'thin', correct: 'thick', distractors: ['wide', 'fat', 'long'], relation: 'opposites' },
  { pair: ['pilot', 'fly'], start: 'driver', correct: 'drive', distractors: ['car', 'road', 'fly'], relation: 'person : what they do' },
  { pair: ['moon', 'night'], start: 'sun', correct: 'day', distractors: ['star', 'sky', 'night'], relation: 'seen : when' },
  { pair: ['rose', 'thorns'], start: 'cactus', correct: 'spikes', distractors: ['flower', 'desert', 'thorns'], relation: 'plant : how it protects itself' },
  { pair: ['bicycle', '2'], start: 'tricycle', correct: '3', distractors: ['4', '1', '2'], relation: 'vehicle : number of wheels' },
  { pair: ['hammer', 'pound'], start: 'saw', correct: 'cut', distractors: ['wood', 'sharp', 'pound'], relation: 'tool : what it does' },
  { pair: ['baby', 'crawl'], start: 'toddler', correct: 'walk', distractors: ['run', 'crawl', 'talk'], relation: 'age stage : how they move' },
  { pair: ['rain', 'wet'], start: 'sun', correct: 'dry', distractors: ['hot', 'bright', 'wet'], relation: 'weather : what it makes things' },
  { pair: ['garden', 'flowers'], start: 'orchard', correct: 'apples', distractors: ['vegetables', 'grass', 'flowers'], relation: 'place : what grows there' },
  { pair: ['happy', 'smile'], start: 'sad', correct: 'frown', distractors: ['laugh', 'cry', 'smile'], relation: 'feeling : facial expression' },
  { pair: ['king', 'crown'], start: 'knight', correct: 'armor', distractors: ['sword', 'castle', 'crown'], relation: 'person : what they wear' },
  { pair: ['ant', 'small'], start: 'elephant', correct: 'large', distractors: ['gray', 'heavy', 'small'], relation: 'animal : its size' },
  { pair: ['stove', 'hot'], start: 'freezer', correct: 'cold', distractors: ['ice', 'kitchen', 'hot'], relation: 'appliance : temperature' },
  { pair: ['leaf', 'green'], start: 'snow', correct: 'white', distractors: ['cold', 'ice', 'green'], relation: 'thing : its color' },
  { pair: ['book', 'read'], start: 'movie', correct: 'watch', distractors: ['see', 'screen', 'read'], relation: 'thing : how you enjoy it' },
  { pair: ['fish', 'gills'], start: 'human', correct: 'lungs', distractors: ['skin', 'fins', 'gills'], relation: 'animal : how it breathes' },
  // 4th grade only: less familiar words, matching this file's existing grades:[4] bar.
  { pair: ['triumph', 'victory'], start: 'defeat', correct: 'loss', distractors: ['victory', 'win', 'draw'], relation: 'same meaning', grades: [4, 5, 6] },
  { pair: ['ocean', 'vast'], start: 'puddle', correct: 'tiny', distractors: ['wet', 'vast', 'blue'], relation: 'thing : its size', grades: [4, 5, 6] },
  { pair: ['composer', 'symphony'], start: 'architect', correct: 'building', distractors: ['symphony', 'music', 'blueprint'], relation: 'creator : work', grades: [4, 5, 6] },
  { pair: ['generous', 'selfish'], start: 'honest', correct: 'deceitful', distractors: ['selfish', 'kind', 'truthful'], relation: 'opposites', grades: [4, 5, 6] },
  { pair: ['century', '100'], start: 'decade', correct: '10', distractors: ['100', '1', '1000'], relation: 'unit : number of years', grades: [4, 5, 6] },
  { pair: ['extinct', 'gone'], start: 'endangered', correct: 'threatened', distractors: ['gone', 'safe', 'common'], relation: 'same meaning', grades: [4, 5, 6] },
  { pair: ['telescope', 'far'], start: 'microscope', correct: 'small', distractors: ['far', 'close', 'large'], relation: 'tool : what it helps you see', grades: [4, 5, 6] },
  // Phase 3 (2026-10-10): CogAT Levels 11/12 (5th/6th grade) start here. These
  // items are genuinely harder than the 4th-grade tier above (more abstract
  // vocabulary and relations), not just a relabeled copy of it — grade 5/6
  // see this set ON TOP OF everything above, same cumulative pattern as how
  // grade 4 already layers on top of grade 3.
  { pair: ['meticulous', 'careful'], start: 'audacious', correct: 'bold', distractors: ['careful', 'cautious', 'humble'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['altruistic', 'selfless'], start: 'miserly', correct: 'stingy', distractors: ['selfless', 'generous', 'wealthy'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['ephemeral', 'temporary'], start: 'perpetual', correct: 'endless', distractors: ['temporary', 'brief', 'rare'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['credible', 'believable'], start: 'dubious', correct: 'doubtful', distractors: ['believable', 'certain', 'honest'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['candid', 'deceptive'], start: 'humble', correct: 'arrogant', distractors: ['deceptive', 'shy', 'proud'], relation: 'opposites', grades: [5, 6] },
  { pair: ['diligent', 'lazy'], start: 'punctual', correct: 'tardy', distractors: ['lazy', 'quick', 'early'], relation: 'opposites', grades: [5, 6] },
  { pair: ['scalpel', 'surgeon'], start: 'gavel', correct: 'judge', distractors: ['surgeon', 'lawyer', 'jury'], relation: 'tool : who uses it', grades: [5, 6] },
  { pair: ['chapter', 'novel'], start: 'movement', correct: 'symphony', distractors: ['novel', 'song', 'note'], relation: 'part : whole', grades: [5, 6] },
  { pair: ['negligence', 'accident'], start: 'vaccination', correct: 'immunity', distractors: ['accident', 'sickness', 'medicine'], relation: 'cause : effect', grades: [5, 6] },
  { pair: ['annoyed', 'furious'], start: 'content', correct: 'ecstatic', distractors: ['furious', 'sad', 'calm'], relation: 'mild : intense', grades: [5, 6] },
  { pair: ['transparent', 'clear'], start: 'translucent', correct: 'hazy', distractors: ['clear', 'thin', 'colorful'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['verbose', 'wordy'], start: 'terse', correct: 'concise', distractors: ['wordy', 'rude', 'loud'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['choreographer', 'dance'], start: 'screenwriter', correct: 'movie', distractors: ['dance', 'actor', 'camera'], relation: 'creator : work', grades: [5, 6] },
  { pair: ['dozen', '12'], start: 'score', correct: '20', distractors: ['12', '50', '100'], relation: 'unit : number', grades: [5, 6] },
  { pair: ['odometer', 'distance'], start: 'speedometer', correct: 'speed', distractors: ['distance', 'time', 'direction'], relation: 'tool : what it measures', grades: [5, 6] },
  // Second grade-5/6 batch (2026-10-10) — deepening the Level 11/12 tier.
  { pair: ['resilient', 'tough'], start: 'fragile', correct: 'delicate', distractors: ['tough', 'strong', 'heavy'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['frank', 'honest'], start: 'furtive', correct: 'secretive', distractors: ['honest', 'open', 'bold'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['optimistic', 'pessimistic'], start: 'victory', correct: 'defeat', distractors: ['pessimistic', 'celebration', 'triumph'], relation: 'opposites', grades: [5, 6] },
  { pair: ['verse', 'poem'], start: 'scene', correct: 'play', distractors: ['poem', 'actor', 'stage'], relation: 'part : whole', grades: [5, 6] },
  { pair: ['limb', 'tree'], start: 'tributary', correct: 'river', distractors: ['tree', 'stream', 'lake'], relation: 'part : whole', grades: [5, 6] },
  { pair: ['bow', 'violinist'], start: 'baton', correct: 'conductor', distractors: ['violinist', 'pianist', 'drummer'], relation: 'tool : who uses it', grades: [5, 6] },
  { pair: ['whisk', 'chef'], start: 'chisel', correct: 'sculptor', distractors: ['chef', 'painter', 'writer'], relation: 'tool : who uses it', grades: [5, 6] },
  { pair: ['playwright', 'play'], start: 'lyricist', correct: 'song', distractors: ['play', 'poem', 'novel'], relation: 'creator : work', grades: [5, 6] },
  { pair: ['erosion', 'canyon'], start: 'pressure', correct: 'diamond', distractors: ['canyon', 'heat', 'rock'], relation: 'cause : effect', grades: [5, 6] },
  { pair: ['bacteria', 'infection'], start: 'virus', correct: 'disease', distractors: ['infection', 'medicine', 'fever'], relation: 'cause : effect', grades: [5, 6] },
  { pair: ['warm', 'scorching'], start: 'cool', correct: 'frigid', distractors: ['scorching', 'mild', 'chilly'], relation: 'mild : intense', grades: [5, 6] },
  { pair: ['irritated', 'enraged'], start: 'pleased', correct: 'elated', distractors: ['enraged', 'sad', 'calm'], relation: 'mild : intense', grades: [5, 6] },
  { pair: ['fortnight', '14'], start: 'millennium', correct: '1000', distractors: ['14', '100', '10'], relation: 'unit : number', grades: [5, 6] },
  { pair: ['barometer', 'pressure'], start: 'anemometer', correct: 'wind speed', distractors: ['pressure', 'temperature', 'humidity'], relation: 'tool : what it measures', grades: [5, 6] },
  { pair: ['astute', 'perceptive'], start: 'reticent', correct: 'reserved', distractors: ['perceptive', 'talkative', 'bold'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['gregarious', 'reserved'], start: 'affluent', correct: 'destitute', distractors: ['reserved', 'wealthy', 'generous'], relation: 'opposites', grades: [5, 6] },
  { pair: ['adamant', 'stubborn'], start: 'docile', correct: 'obedient', distractors: ['stubborn', 'wild', 'clever'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['droplet', 'rain'], start: 'grain', correct: 'sand', distractors: ['rain', 'rock', 'soil'], relation: 'part : whole', grades: [5, 6] },
  { pair: ['compass', 'sailor'], start: 'map', correct: 'explorer', distractors: ['sailor', 'pilot', 'farmer'], relation: 'tool : who uses it', grades: [5, 6] },
  { pair: ['inventor', 'patent'], start: 'author', correct: 'manuscript', distractors: ['patent', 'painting', 'recipe'], relation: 'creator : work', grades: [5, 6] },
  { pair: ['deforestation', 'flooding'], start: 'overfishing', correct: 'extinction', distractors: ['flooding', 'pollution', 'drought'], relation: 'cause : effect', grades: [5, 6] },
  { pair: ['lenient', 'strict'], start: 'timid', correct: 'bold', distractors: ['strict', 'shy', 'careful'], relation: 'opposites', grades: [5, 6] },
  { pair: ['vivid', 'brilliant'], start: 'bleak', correct: 'dreary', distractors: ['brilliant', 'bright', 'happy'], relation: 'same meaning', grades: [5, 6] },
  { pair: ['seismograph', 'earthquakes'], start: 'Geiger counter', correct: 'radiation', distractors: ['earthquakes', 'temperature', 'pressure'], relation: 'tool : what it measures', grades: [5, 6] },
  { pair: ['episode', 'series'], start: 'chapter', correct: 'book', distractors: ['series', 'movie', 'song'], relation: 'part : whole', grades: [5, 6] },
]

const gradesOf = (item: RawItem): Grade[] => item.grades ?? [3, 4, 5, 6]

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
