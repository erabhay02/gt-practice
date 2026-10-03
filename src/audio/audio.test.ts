/// <reference types="node" />
import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import clipIds from './clips.json'
import { clipId } from './clipId'
import { allSpokenTexts } from './promptCatalog'

describe('recorded question audio', () => {
  const texts = allSpokenTexts()

  it('has a recording for every sentence the app can read aloud', () => {
    const recorded = new Set(clipIds)
    const missing = texts.filter((t) => !recorded.has(clipId(t)))
    expect(missing, 'run: npx tsx scripts/collect-prompts.ts, then scripts/generate_audio.py').toEqual([])
  })

  it('every listed recording exists as a file', () => {
    for (const id of clipIds) expect(existsSync(`public/audio/${id}.m4a`), id).toBe(true)
  })

  it('clip ids are unique per sentence', () => {
    expect(new Set(texts.map(clipId)).size).toBe(texts.length)
  })
})
