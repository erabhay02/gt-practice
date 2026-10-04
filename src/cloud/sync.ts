import { useProfilesStore } from '../state/profilesStore'
import { useProgressStore, EMPTY_PROGRESS, type ProfileProgress } from '../state/progressStore'
import { mergeAll, mergeDates, mergeSessions, mergeShown, type ChildRow, type LocalState, type SessionRow } from './merge'
import { supabase } from './supabase'

const PAGE = 1000

async function fetchAll<T>(table: 'children' | 'sessions'): Promise<T[]> {
  const rows: T[] = []
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await supabase().from(table).select('*').range(from, from + PAGE - 1)
    if (error) throw error
    rows.push(...(data as T[]))
    if (!data || data.length < PAGE) return rows
  }
}

function snapshot(): LocalState {
  const { profiles, deletedIds } = useProfilesStore.getState()
  return { profiles, deletedIds, byProfile: useProgressStore.getState().byProfile }
}

const unionProgress = (a: ProfileProgress, b: ProfileProgress): ProfileProgress => ({
  sessions: mergeSessions(a.sessions, b.sessions),
  shownQuestionIds: mergeShown(a.shownQuestionIds, b.shownQuestionIds),
  dailyPlanDates: mergeDates(a.dailyPlanDates, b.dailyPlanDates),
})

/**
 * Writes the merged result back to the local stores without losing anything
 * the child did while the sync was running (progress is re-unioned; children
 * edited or removed meanwhile keep the local change for the next sync).
 */
let applying = false
/** True while sync itself is writing to the stores (those writes shouldn't trigger another sync). */
export const syncIsApplying = () => applying

function applyLocally(before: LocalState, merged: LocalState) {
  applying = true
  try {
    applyMerged(before, merged)
  } finally {
    applying = false
  }
}

function applyMerged(before: LocalState, merged: LocalState) {
  const current = snapshot()
  const editedMeanwhile = new Map(
    current.profiles
      .filter((p) => p.updatedAt > (before.profiles.find((b) => b.id === p.id)?.updatedAt ?? ''))
      .map((p) => [p.id, p]),
  )
  const removedMeanwhile = current.deletedIds.filter((id) => !before.deletedIds.includes(id))

  const profiles = [
    ...merged.profiles.filter((p) => !removedMeanwhile.includes(p.id)).map((p) => editedMeanwhile.get(p.id) ?? p),
    ...[...editedMeanwhile.values()].filter((p) => !merged.profiles.some((m) => m.id === p.id) && !before.profiles.some((b) => b.id === p.id)),
  ]
  useProfilesStore.getState().replaceProfiles(profiles, removedMeanwhile)

  const store = useProgressStore.getState()
  for (const p of profiles) {
    store.replaceProgress(p.id, unionProgress(merged.byProfile[p.id] ?? EMPTY_PROGRESS, current.byProfile[p.id] ?? EMPTY_PROGRESS))
  }
}

let running: Promise<void> | null = null
let again = false

/** Pull, merge and push. Concurrent calls are coalesced into one follow-up run. */
export function syncNow(): Promise<void> {
  if (running) {
    again = true
    return running
  }
  running = (async () => {
    try {
      do {
        again = false
        await syncOnce()
      } while (again)
    } finally {
      running = null
    }
  })()
  return running
}

async function syncOnce() {
  const { data } = await supabase().auth.getSession()
  const uid = data.session?.user.id
  if (!uid) return

  const before = snapshot()
  const [children, sessions] = await Promise.all([fetchAll<ChildRow>('children'), fetchAll<SessionRow>('sessions')])
  const merged = mergeAll(before, { children, sessions }, new Date().toISOString())

  if (merged.push.children.length) {
    const { error } = await supabase()
      .from('children')
      .upsert(merged.push.children.map((c) => ({ ...c, parent_id: uid })), { onConflict: 'parent_id,id' })
    if (error) throw error
  }
  for (let i = 0; i < merged.push.sessions.length; i += 500) {
    const chunk = merged.push.sessions.slice(i, i + 500).map((s) => ({ ...s, parent_id: uid }))
    const { error } = await supabase().from('sessions').upsert(chunk, { onConflict: 'parent_id,id', ignoreDuplicates: true })
    if (error) throw error
  }
  // A removed child's practice history doesn't need to stay on the server.
  const removed = merged.push.children.filter((c) => c.deleted_at).map((c) => c.id)
  if (removed.length) {
    const { error } = await supabase().from('sessions').delete().in('child_id', removed)
    if (error) throw error
  }

  applyLocally(before, merged)
}

/** "Reset progress" for one child, on every device (needs a connection). */
export async function resetChildEverywhere(childId: string): Promise<void> {
  const { error: e1 } = await supabase().from('sessions').delete().eq('child_id', childId)
  if (e1) throw e1
  const { error: e2 } = await supabase()
    .from('children')
    .update({ shown_question_ids: {}, daily_plan_dates: [], updated_at: new Date().toISOString() })
    .eq('id', childId)
  if (e2) throw e2
  useProgressStore.getState().resetProfile(childId)
}
