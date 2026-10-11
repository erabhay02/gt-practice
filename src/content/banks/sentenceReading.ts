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
  { sentence: 'The hikers were ___ after climbing the steep mountain all day.', correct: 'exhausted', distractors: ['energetic', 'bored', 'curious'], grades: [4, 5, 6] },
  { sentence: 'Although the test was difficult, Maya felt ___ because she had studied.', correct: 'confident', distractors: ['nervous', 'confused', 'lazy'], grades: [4, 5, 6] },
  { sentence: 'The scientist used a ___ to look at the tiny cells.', correct: 'microscope', distractors: ['telescope', 'thermometer', 'magnet'], grades: [4, 5, 6] },
  { sentence: 'The river was so ___ that we could see the fish at the bottom.', correct: 'clear', distractors: ['deep', 'muddy', 'wide'], grades: [4, 5, 6] },
  { sentence: 'Carlos is very ___; he always shares his snacks with friends.', correct: 'generous', distractors: ['selfish', 'shy', 'forgetful'], grades: [4, 5, 6] },
  { sentence: 'The ancient castle was built hundreds of years ___.', correct: 'ago', distractors: ['later', 'soon', 'ahead'], grades: [4, 5, 6] },
  { sentence: 'Since the bridge was ___, the cars had to take a different road.', correct: 'damaged', distractors: ['new', 'long', 'painted'], grades: [4, 5, 6] },
  { sentence: 'A ___ is a person who writes poems.', correct: 'poet', distractors: ['painter', 'baker', 'pilot'], grades: [4, 5, 6] },
  { sentence: 'The desert gets very little ___, so few plants grow there.', correct: 'rain', distractors: ['sand', 'heat', 'sunlight'], grades: [4, 5, 6] },
  { sentence: 'Our team practiced every day, so we were well ___ for the big game.', correct: 'prepared', distractors: ['unlikely', 'afraid', 'late'], grades: [4, 5, 6] },
  { sentence: 'The audience ___ loudly at the end of the wonderful play.', correct: 'clapped', distractors: ['slept', 'whispered', 'frowned'], grades: [4, 5, 6] },
  { sentence: 'A compass helps you find which ___ you are going.', correct: 'direction', distractors: ['speed', 'time', 'distance'], grades: [4, 5, 6] },
  { sentence: 'The museum guard asked us not to ___ the paintings.', correct: 'touch', distractors: ['see', 'enjoy', 'visit'], grades: [4, 5, 6] },
  { sentence: 'Elephants are ___ animals; they are the largest animals on land.', correct: 'enormous', distractors: ['tiny', 'fast', 'noisy'], grades: [4, 5, 6] },
  { sentence: 'Because Leo was ___, he did not want to speak in front of the class.', correct: 'shy', distractors: ['brave', 'proud', 'tall'], grades: [4, 5, 6] },
  { sentence: 'Water turns into ice when it ___.', correct: 'freezes', distractors: ['boils', 'melts', 'flows'], grades: [4, 5, 6] },
  { sentence: 'The opposite of ancient is ___.', correct: 'modern', distractors: ['old', 'broken', 'famous'], grades: [4, 5, 6] },
  { sentence: 'The detective looked for ___ to solve the mystery.', correct: 'clues', distractors: ['toys', 'snacks', 'friends'], grades: [4, 5, 6] },
  { sentence: 'Bats sleep during the day and are ___ at night.', correct: 'active', distractors: ['asleep', 'hidden', 'still'], grades: [4, 5, 6] },
  { sentence: 'The recipe says to ___ the eggs and sugar together in a bowl.', correct: 'mix', distractors: ['freeze', 'slice', 'bake'], grades: [4, 5, 6] },
  { sentence: 'Mount Everest is the ___ mountain in the world.', correct: 'highest', distractors: ['smallest', 'newest', 'wettest'], grades: [4, 5, 6] },
  { sentence: 'The children were ___ to see a rainbow after the storm.', correct: 'delighted', distractors: ['annoyed', 'bored', 'frightened'], grades: [4, 5, 6] },
  { sentence: 'Even though it was raining, the soccer game was not ___.', correct: 'canceled', distractors: ['played', 'wet', 'long'], grades: [4, 5, 6] },
  // New batch (2026-10-10) — appended at the true end so existing items keep their
  // index-based ids. promptAudioText is the constant SENTENCE_READING_PROMPT here
  // (not per-item) — the sentence itself is read by the child, not the app — so
  // this bank needs no new audio clips.
  { sentence: 'The campers put out the ___ before they went to sleep.', correct: 'fire', distractors: ['tent', 'lantern', 'sleeping bag'] },
  { sentence: 'Maya was so ___ after the long hike that she wanted a drink of water.', correct: 'thirsty', distractors: ['proud', 'confused', 'late'] },
  { sentence: 'The ___ barked loudly when a stranger walked by the house.', correct: 'dog', distractors: ['cat', 'bird', 'fish'] },
  { sentence: 'Before crossing the street, always look both ___.', correct: 'ways', distractors: ['hands', 'feet', 'eyes'] },
  // 4th grade only: "although/since/because" sentences, matching this file's existing bar.
  { sentence: 'Although she was nervous, Priya ___ her hand to answer the question.', correct: 'raised', distractors: ['hid', 'lowered', 'shook'], grades: [4, 5, 6] },
  { sentence: 'Since the library was ___, the students studied in complete silence.', correct: 'quiet', distractors: ['crowded', 'sunny', 'new'], grades: [4, 5, 6] },
  // Second new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { sentence: 'The chef added a pinch of ___ to make the soup taste better.', correct: 'salt', distractors: ['sugar', 'flour', 'ice'] },
  { sentence: 'The kitten was too ___ to jump onto the tall shelf.', correct: 'small', distractors: ['brave', 'hungry', 'loud'] },
  { sentence: 'Grandma knitted a warm ___ for the baby to wear in winter.', correct: 'sweater', distractors: ['swimsuit', 'sandals', 'sunglasses'] },
  { sentence: 'The teacher asked the class to ___ their hands before speaking.', correct: 'raise', distractors: ['clap', 'wash', 'shake'] },
  // 4th grade only: "although/since/because" sentences, matching this file's existing bar.
  { sentence: 'Because the experiment required precision, the scientist measured each ___ carefully.', correct: 'ingredient', distractors: ['friend', 'color', 'song'], grades: [4, 5, 6] },
  { sentence: 'The marathon runner felt ___ after finishing the twenty-six mile race.', correct: 'triumphant', distractors: ['nervous', 'confused', 'sleepy'], grades: [4, 5, 6] },
  // Third new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { sentence: 'The baby elephant stayed close to its ___ for protection.', correct: 'mother', distractors: ['friend', 'teacher', 'neighbor'] },
  { sentence: 'Jake forgot his umbrella, so he got completely ___ in the storm.', correct: 'soaked', distractors: ['warm', 'tired', 'happy'] },
  { sentence: 'The chef sharpened the ___ before slicing the vegetables.', correct: 'knife', distractors: ['spoon', 'napkin', 'plate'] },
  { sentence: 'Our class visited the ___ to see lions, tigers, and bears.', correct: 'zoo', distractors: ['library', 'hospital', 'bakery'] },
  // 4th grade only: "although/since/because" sentences, matching this file's existing bar.
  { sentence: 'Because the bridge was closed for repairs, drivers had to find an ___ route.', correct: 'alternate', distractors: ['ancient', 'empty', 'narrow'], grades: [4, 5, 6] },
  { sentence: "The scientist's ___ was proven correct after months of careful research.", correct: 'hypothesis', distractors: ['lunch', 'vacation', 'car'], grades: [4, 5, 6] },
  // Fourth new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { sentence: 'The little girl was ___ to open her birthday presents.', correct: 'eager', distractors: ['tired', 'worried', 'angry'] },
  { sentence: 'The old bridge looked ___, so the workers decided to repair it.', correct: 'broken', distractors: ['new', 'painted', 'tall'] },
  { sentence: 'During the ___, everyone had to stay inside because of the storm.', correct: 'hurricane', distractors: ['party', 'picnic', 'parade'] },
  { sentence: 'The puppy wagged its ___ happily when its owner came home.', correct: 'tail', distractors: ['ears', 'paws', 'nose'] },
  // 4th grade only: "although/since/because" sentences, matching this file's existing bar.
  { sentence: 'Since the museum exhibit was so ___, visitors wanted to learn more.', correct: 'fascinating', distractors: ['boring', 'empty', 'loud'], grades: [4, 5, 6] },
  { sentence: 'Although the math problem seemed ___, Sam solved it after a few tries.', correct: 'difficult', distractors: ['easy', 'short', 'colorful'], grades: [4, 5, 6] },
  // Fifth new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  { sentence: 'The spider spun a ___ to catch its dinner.', correct: 'web', distractors: ['nest', 'shell', 'den'] },
  { sentence: 'Before the race began, all the runners lined up at the ___.', correct: 'start', distractors: ['finish', 'middle', 'top'] },
  { sentence: 'The clown made the children ___ with his funny tricks.', correct: 'laugh', distractors: ['cry', 'shiver', 'yawn'] },
  { sentence: 'The farmer woke up at ___ to milk the cows.', correct: 'dawn', distractors: ['midnight', 'noon', 'dusk'] },
  // 4th grade only: "although/since/because" sentences, matching this file's existing bar.
  { sentence: 'Since the volcano had been ___ for years, scientists were surprised when it erupted.', correct: 'dormant', distractors: ['active', 'famous', 'small'], grades: [4, 5, 6] },
  { sentence: 'Although the novel was ___, Leo finished all five hundred pages in a week.', correct: 'lengthy', distractors: ['short', 'boring', 'cheap'], grades: [4, 5, 6] },
  // Sixth new batch (2026-10-10, Phase 1 continued) — same append-only rule as above.
  // This batch brings sentence-reading to the plan's "roughly double" target.
  { sentence: 'The firefighter climbed the ___ to reach the top floor.', correct: 'ladder', distractors: ['chair', 'table', 'bed'] },
  { sentence: 'The sun was so ___ that everyone wore sunglasses.', correct: 'bright', distractors: ['dark', 'quiet', 'cold'] },
  { sentence: 'The baker pulled a fresh loaf of ___ out of the oven.', correct: 'bread', distractors: ['ice', 'rocks', 'shoes'] },
  { sentence: 'After the long flight, the passengers were ___ to stretch their legs.', correct: 'eager', distractors: ['sad', 'angry', 'confused'] },
  { sentence: 'The squirrel buried the ___ to save for winter.', correct: 'acorn', distractors: ['rock', 'leaf', 'twig'] },
  { sentence: 'The lifeguard watched the swimmers to keep them ___.', correct: 'safe', distractors: ['wet', 'tired', 'loud'] },
  { sentence: 'The artist mixed blue and yellow paint to make ___.', correct: 'green', distractors: ['purple', 'orange', 'brown'] },
  { sentence: 'The thunder was so loud that the baby started to ___.', correct: 'cry', distractors: ['laugh', 'sing', 'dance'] },
  { sentence: 'The farmer fed ___ to the chickens every morning.', correct: 'corn', distractors: ['rocks', 'water bottles', 'shoes'] },
  { sentence: 'Because the ice was so thin, the skaters stayed near the ___.', correct: 'edge', distractors: ['middle', 'bottom', 'top'] },
  { sentence: 'The pirates searched the island for buried ___.', correct: 'treasure', distractors: ['homework', 'laundry', 'vegetables'] },
  { sentence: 'The astronaut put on a special ___ before walking in space.', correct: 'suit', distractors: ['hat', 'shoe', 'glove'] },
  { sentence: 'The orchestra played beautiful music as the audience listened in ___.', correct: 'silence', distractors: ['traffic', 'rain', 'chaos'] },
  { sentence: 'The gardener watered the plants every ___ to help them grow.', correct: 'day', distractors: ['rock', 'chair', 'shoe'] },
  { sentence: 'The magician pulled a rabbit out of his ___.', correct: 'hat', distractors: ['shoe', 'pocket', 'sleeve'] },
  { sentence: 'When the power went out, the family lit some ___ to see in the dark.', correct: 'candles', distractors: ['windows', 'mirrors', 'pillows'] },
  { sentence: 'The soccer player kicked the ball into the ___.', correct: 'goal', distractors: ['sky', 'crowd', 'bench'] },
  { sentence: "The baby bird couldn't fly yet, so it stayed in the ___.", correct: 'nest', distractors: ['pond', 'cave', 'garage'] },
  { sentence: 'The teacher wrote the homework assignment on the ___.', correct: 'board', distractors: ['ceiling', 'window', 'floor'] },
  { sentence: 'The chef wore a tall white ___ while cooking.', correct: 'hat', distractors: ['scarf', 'belt', 'glove'] },
  // 4th grade only: "although/since/because" sentences, matching this file's existing bar.
  { sentence: 'Since the river had ___ after the heavy rain, the town had to evacuate.', correct: 'flooded', distractors: ['dried', 'frozen', 'sparkled'], grades: [4, 5, 6] },
  { sentence: 'Although Mia practiced the piano every day, she remained ___ before the recital.', correct: 'nervous', distractors: ['bored', 'confident', 'careless'], grades: [4, 5, 6] },
  { sentence: 'Because the ancient manuscript was so ___, historians handled it very carefully.', correct: 'fragile', distractors: ['heavy', 'colorful', 'cheap'], grades: [4, 5, 6] },
  { sentence: 'The explorer felt a sense of ___ upon discovering the hidden cave.', correct: 'wonder', distractors: ['boredom', 'anger', 'hunger'], grades: [4, 5, 6] },
  { sentence: 'Since the negotiations had ___, both sides finally reached an agreement.', correct: 'succeeded', distractors: ['failed', 'started', 'ended'], grades: [4, 5, 6] },
  { sentence: 'The committee will ___ the proposal before making a final decision.', correct: 'review', distractors: ['forget', 'ignore', 'destroy'], grades: [4, 5, 6] },
  { sentence: 'Although the climb was ___, the hikers reached the summit by sunset.', correct: 'strenuous', distractors: ['easy', 'short', 'flat'], grades: [4, 5, 6] },
  { sentence: 'The archaeologist carefully brushed away the dirt to reveal an ancient ___.', correct: 'artifact', distractors: ['pizza', 'bicycle', 'television'], grades: [4, 5, 6] },
  // Phase 3 (2026-10-10): CogAT Levels 11/12 (5th/6th grade) start here — a
  // notch past the 4th-grade tier above (more subordinate-clause sentence
  // structures and more advanced vocabulary), same cumulative, append-only
  // pattern as verbalAnalogy.ts and verbalClassification.ts.
  { sentence: "Despite the committee's ___ efforts, the outdated policy remained unchanged for another decade.", correct: 'persistent', distractors: ['brief', 'careless', 'silent'], grades: [5, 6] },
  { sentence: "The scientist's hypothesis was ultimately ___ by the overwhelming data from the experiment.", correct: 'validated', distractors: ['invented', 'ignored', 'disguised'], grades: [5, 6] },
  { sentence: 'The ___ silence in the abandoned house sent a chill down her spine.', correct: 'eerie', distractors: ['cheerful', 'noisy', 'warm'], grades: [5, 6] },
  { sentence: 'Because the evidence was entirely ___, the jury had no trouble reaching a verdict.', correct: 'conclusive', distractors: ['confusing', 'missing', 'biased'], grades: [5, 6] },
  { sentence: 'The ___ diplomat managed to resolve the dispute without a single harsh word.', correct: 'tactful', distractors: ['rude', 'loud', 'careless'], grades: [5, 6] },
  { sentence: 'After months of drought, the ___ fields finally received the rain they desperately needed.', correct: 'parched', distractors: ['flooded', 'frozen', 'fertile'], grades: [5, 6] },
  { sentence: "The professor's lecture was so ___ that several students struggled to follow the argument.", correct: 'convoluted', distractors: ['simple', 'short', 'cheerful'], grades: [5, 6] },
  { sentence: "The ___ critic praised every detail of the young artist's debut exhibition.", correct: 'effusive', distractors: ['harsh', 'silent', 'confused'], grades: [5, 6] },
  { sentence: 'Although the ancient bridge looked ___, engineers confirmed it could still bear heavy traffic.', correct: 'dilapidated', distractors: ['brand-new', 'colorful', 'narrow'], grades: [5, 6] },
  { sentence: "The CEO's ___ decision to cut costs ultimately saved the struggling company.", correct: 'shrewd', distractors: ['reckless', 'random', 'forgetful'], grades: [5, 6] },
  { sentence: 'The twins were so ___ that even their own mother sometimes confused them.', correct: 'identical', distractors: ['different', 'tall', 'loud'], grades: [5, 6] },
  { sentence: 'Her ___ explanation left no room for doubt about what had actually happened.', correct: 'lucid', distractors: ['vague', 'angry', 'brief'], grades: [5, 6] },
  // Second grade-5/6 batch (2026-10-10) — deepening the Level 11/12 tier.
  { sentence: "Although the detective had little evidence, her ___ reasoning led her straight to the culprit.", correct: 'astute', distractors: ['careless', 'random', 'slow'], grades: [5, 6] },
  { sentence: 'The ___ aroma of fresh bread drifted through the entire neighborhood.', correct: 'fragrant', distractors: ['faint', 'sour', 'bitter'], grades: [5, 6] },
  { sentence: 'Since the medicine was so ___, the child refused to take another dose.', correct: 'bitter', distractors: ['sweet', 'cold', 'warm'], grades: [5, 6] },
  { sentence: 'The ___ applause lasted for several minutes after the breathtaking performance.', correct: 'thunderous', distractors: ['brief', 'quiet', 'awkward'], grades: [5, 6] },
  { sentence: 'Because the trail was so ___, only experienced hikers attempted the climb.', correct: 'treacherous', distractors: ['flat', 'short', 'sunny'], grades: [5, 6] },
  { sentence: 'The ___ negotiator refused to budge on a single point during the entire meeting.', correct: 'obstinate', distractors: ['flexible', 'friendly', 'nervous'], grades: [5, 6] },
  { sentence: 'Her ___ smile revealed exactly how pleased she was with the surprising news.', correct: 'radiant', distractors: ['faint', 'worried', 'tired'], grades: [5, 6] },
  { sentence: "The museum's newest exhibit features several ___ artifacts recovered from the shipwreck.", correct: 'priceless', distractors: ['ordinary', 'plastic', 'modern'], grades: [5, 6] },
  { sentence: 'Although the plan seemed ___ at first, it ultimately failed to account for the weather.', correct: 'flawless', distractors: ['hopeless', 'simple', 'obvious'], grades: [5, 6] },
  { sentence: 'The students were asked to summarize the ___ plot of the six-hundred-page novel.', correct: 'intricate', distractors: ['boring', 'short', 'blank'], grades: [5, 6] },
  { sentence: 'The ___ crowd grew louder with every passing minute before the concert began.', correct: 'restless', distractors: ['sleepy', 'silent', 'empty'], grades: [5, 6] },
  { sentence: 'Despite repeated warnings, the stubborn sailor refused to ___ the storm and sailed anyway.', correct: 'heed', distractors: ['create', 'paint', 'measure'], grades: [5, 6] },
  { sentence: "The ancient castle's walls were ___ with moss after centuries of rain.", correct: 'encrusted', distractors: ['painted', 'built', 'erased'], grades: [5, 6] },
  { sentence: 'The witness gave a ___ account of the accident, recalling every small detail.', correct: 'meticulous', distractors: ['vague', 'short', 'confused'], grades: [5, 6] },
  { sentence: "Because the company's profits had ___ for three straight years, investors grew worried.", correct: 'declined', distractors: ['soared', 'doubled', 'remained'], grades: [5, 6] },
  { sentence: "The orchestra's ___ performance brought the entire audience to its feet.", correct: 'mesmerizing', distractors: ['forgettable', 'quiet', 'short'], grades: [5, 6] },
  { sentence: 'Although she tried to remain calm, her hands were visibly ___ during the interview.', correct: 'trembling', distractors: ['steady', 'warm', 'relaxed'], grades: [5, 6] },
  { sentence: "The old sailor's face was ___ from decades spent working beneath the sun.", correct: 'weathered', distractors: ['smooth', 'pale', 'youthful'], grades: [5, 6] },
  { sentence: "The teacher's ___ feedback helped the students understand exactly where they had gone wrong.", correct: 'constructive', distractors: ['harsh', 'vague', 'silent'], grades: [5, 6] },
  { sentence: 'Even the most ___ critics admitted the film\'s special effects were extraordinary.', correct: 'skeptical', distractors: ['friendly', 'careless', 'young'], grades: [5, 6] },
  { sentence: "The ___ scent of the forest after the rain reminded her of her grandmother's garden.", correct: 'earthy', distractors: ['metallic', 'sour', 'sharp'], grades: [5, 6] },
  { sentence: 'His ___ argument eventually convinced even the most doubtful members of the board.', correct: 'compelling', distractors: ['weak', 'confusing', 'short'], grades: [5, 6] },
  { sentence: 'The ___ silence that followed the announcement made everyone uneasy.', correct: 'stunned', distractors: ['comfortable', 'joyful', 'brief'], grades: [5, 6] },
  { sentence: 'Because the old warehouse had become so ___ over the years, the city finally condemned it.', correct: 'unstable', distractors: ['colorful', 'spacious', 'modern'], grades: [5, 6] },
  { sentence: 'The ___ scientist spent thirty years perfecting a single theory before publishing it.', correct: 'tenacious', distractors: ['careless', 'impatient', 'forgetful'], grades: [5, 6] },
  // Third grade-5/6 batch (2026-10-10) — Phase 3 depth: logic words
  // (unless, rather than, although) where only one choice keeps the sentence consistent.
  { sentence: 'Unless the bakery receives more flour, it will have to ___ some of its bread orders.', correct: 'cancel', distractors: ['bake', 'double', 'deliver'], grades: [5, 6] },
  { sentence: 'The town was ___ by the storm; nearly every street was blocked by fallen trees.', correct: 'devastated', distractors: ['improved', 'delighted', 'ignored'], grades: [5, 6] },
  { sentence: 'Because the evidence was only ___, the judge asked for more proof before deciding.', correct: 'partial', distractors: ['complete', 'obvious', 'final'], grades: [5, 6] },
  { sentence: 'The chef ___ the soup several times, adding a pinch of salt until the flavor was just right.', correct: 'tasted', distractors: ['froze', 'spilled', 'hid'], grades: [5, 6] },
  { sentence: 'Rather than ___ the argument, the two friends calmly talked through their disagreement.', correct: 'escalate', distractors: ['settle', 'resolve', 'end'], grades: [5, 6] },
  { sentence: 'The once-thriving village became ___ after the factory closed and families moved away.', correct: 'deserted', distractors: ['crowded', 'prosperous', 'noisy'], grades: [5, 6] },
  { sentence: 'Since the instructions were ___, nobody could figure out how to assemble the bookshelf.', correct: 'ambiguous', distractors: ['clear', 'detailed', 'helpful'], grades: [5, 6] },
  { sentence: "The athlete's ___ training schedule left little time for anything else.", correct: 'rigorous', distractors: ['relaxed', 'occasional', 'optional'], grades: [5, 6] },
  { sentence: 'To ___ the spread of the illness, everyone was asked to wash their hands often.', correct: 'prevent', distractors: ['encourage', 'celebrate', 'measure'], grades: [5, 6] },
  { sentence: 'The documentary was ___; it presented facts from many viewpoints without taking sides.', correct: 'impartial', distractors: ['biased', 'fictional', 'unfinished'], grades: [5, 6] },
  { sentence: 'Although the puppy looked ___, it was actually full of energy once it woke up.', correct: 'sleepy', distractors: ['playful', 'lively', 'excited'], grades: [5, 6] },
  { sentence: 'The ___ of the rare bird drew birdwatchers from hundreds of miles away.', correct: 'sighting', distractors: ['absence', 'silence', 'departure'], grades: [5, 6] },
  { sentence: 'The ___ student asked so many questions that the teacher stayed after class to answer them.', correct: 'inquisitive', distractors: ['indifferent', 'sleepy', 'silent'], grades: [5, 6] },
  { sentence: 'The two countries signed a ___ promising to protect the river they share.', correct: 'treaty', distractors: ['recipe', 'novel', 'receipt'], grades: [5, 6] },
  { sentence: 'Because the ice on the pond was ___, the ranger warned skaters to stay off it.', correct: 'thin', distractors: ['thick', 'solid', 'frozen'], grades: [5, 6] },
  { sentence: 'Too much sunlight can ___ the colors of a painting over time.', correct: 'fade', distractors: ['brighten', 'paint', 'frame'], grades: [5, 6] },
  { sentence: 'A ___ is a word that means the same as another word.', correct: 'synonym', distractors: ['antonym', 'homophone', 'verb'], grades: [5, 6] },
  { sentence: 'Scientists ___ fossils to learn how animals lived millions of years ago.', correct: 'study', distractors: ['forget', 'prevent', 'imitate'], grades: [5, 6] },
  { sentence: 'The hikers ___ their water carefully because the next stream was miles away.', correct: 'rationed', distractors: ['wasted', 'spilled', 'splashed'], grades: [5, 6] },
  { sentence: "The movie's ending was so ___ that most viewers guessed it long before it happened.", correct: 'predictable', distractors: ['shocking', 'mysterious', 'confusing'], grades: [5, 6] },
  { sentence: 'Because the speaker mumbled, the audience could barely ___ what was said.', correct: 'understand', distractors: ['enjoy', 'write', 'forget'], grades: [5, 6] },
  { sentence: 'The ___ plant needed only a little water, which made it perfect for the dry climate.', correct: 'hardy', distractors: ['delicate', 'thirsty', 'tropical'], grades: [5, 6] },
  { sentence: 'The museum ___ a new wing to display its growing collection of dinosaur fossils.', correct: 'constructed', distractors: ['demolished', 'ignored', 'borrowed'], grades: [5, 6] },
  { sentence: 'With each ___ step, the mountaineers moved closer to the snowy summit.', correct: 'careful', distractors: ['backward', 'sleepy', 'absent'], grades: [5, 6] },
  { sentence: "The mayor's speech was ___; it lasted only two minutes but covered every important point.", correct: 'concise', distractors: ['rambling', 'endless', 'confusing'], grades: [5, 6] },
  { sentence: 'Because the team ___ the old record, their names were added to the trophy.', correct: 'broke', distractors: ['missed', 'forgot', 'lost'], grades: [5, 6] },
  { sentence: 'The ___ melody was so catchy that everyone was humming it for days.', correct: 'memorable', distractors: ['forgettable', 'silent', 'unpleasant'], grades: [5, 6] },
  { sentence: 'The farmers were ___ that the long drought would finally end, but the clouds brought no rain.', correct: 'hopeful', distractors: ['relieved', 'unaware', 'furious'], grades: [5, 6] },
  { sentence: 'Since the forecast predicted a ___, the coastal towns filled sandbags and boarded up windows.', correct: 'hurricane', distractors: ['sunny day', 'light breeze', 'rainbow'], grades: [5, 6] },
  { sentence: "The young violinist's ___ was clear as soon as the first note filled the hall.", correct: 'talent', distractors: ['boredom', 'absence', 'laziness'], grades: [5, 6] },
  { sentence: 'Where the two rivers ___, they form one wide, slow-moving channel.', correct: 'meet', distractors: ['dry', 'freeze', 'begin'], grades: [5, 6] },
  { sentence: 'Although the old map was ___, the explorers could still make out the trail to the waterfall.', correct: 'faded', distractors: ['new', 'accurate', 'colorful'], grades: [5, 6] },
  { sentence: 'The scientist repeated the experiment to make sure the results were ___.', correct: 'reliable', distractors: ['accidental', 'forgotten', 'imaginary'], grades: [5, 6] },
  { sentence: 'The cat moved ___ across the room, careful not to wake the sleeping dog.', correct: 'stealthily', distractors: ['noisily', 'clumsily', 'proudly'], grades: [5, 6] },
  { sentence: 'The students ___ their ideas on the whiteboard before choosing a topic for the project.', correct: 'brainstormed', distractors: ['forgot', 'hid', 'ignored'], grades: [5, 6] },
  { sentence: 'Because the bridge could hold only a ___ amount of weight, large trucks were not allowed to cross.', correct: 'limited', distractors: ['unlimited', 'enormous', 'growing'], grades: [5, 6] },
  { sentence: 'The ___ volunteers worked through the night to rescue animals from the flood.', correct: 'dedicated', distractors: ['reluctant', 'lazy', 'absent'], grades: [5, 6] },
  { sentence: "The editor's close ___ to detail meant that no mistake went unnoticed.", correct: 'attention', distractors: ['objection', 'resistance', 'distance'], grades: [5, 6] },
]

// Untagged items are the Level 9/10 baseline: 5th–6th grade (Levels 11/12)
// get the harder [4, 5, 6] and [5, 6] tiers instead, so a 5th grader isn't
// mostly served 3rd-grade words like "puppy : dog".
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
