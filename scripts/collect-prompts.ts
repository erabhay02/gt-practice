// Writes scripts/prompts.json: every sentence the app reads aloud, with its clip id.
// Run: npx tsx scripts/collect-prompts.ts
import { writeFileSync } from 'node:fs'
import { clipId } from '../src/audio/clipId'
import { allSpokenTexts } from '../src/audio/promptCatalog'

const prompts = allSpokenTexts().map((text) => ({ id: clipId(text), text }))
writeFileSync(new URL('./prompts.json', import.meta.url), JSON.stringify(prompts, null, 2) + '\n')
console.log(`${prompts.length} sentences written to scripts/prompts.json`)
