export function normalizeSpokenText(text: string): string {
  return text.trim().replace(/\s+/g, ' ')
}

/** Stable file name for a sentence's recording (FNV-1a hash of the normalized text). */
export function clipId(text: string): string {
  const s = normalizeSpokenText(text)
  let h = 0x811c9dc5
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}
