-- Phase 2: privacy-safe usage insight. Not "add analytics" — this reads the
-- same `sessions` rows already collected for the parent's own progress
-- feature, and returns only aggregate weekly counts grouped by sub_type,
-- kind, and grade. No parent_id, child_id, session id, or child name/avatar
-- ever leaves this function; privacy.html's "no third-party analytics or
-- advertising trackers" promise stays true because this is first-party and
-- never leaves the project's own database. The `having` clause suppresses
-- any group with fewer than 3 sessions, so a single family's activity can't
-- be singled out from an otherwise-sparse week/grade/sub_type bucket.
--
-- Security-definer, same pattern as has_access() in 0001_init.sql, so it can
-- read across all parents' rows regardless of caller — but it is NOT granted
-- to anon/authenticated below, so the only way to call it is as the
-- database owner (Supabase SQL editor or the service-role key), i.e. the
-- product owner reviewing aggregate usage. No app code calls this.
create function public.usage_insights()
returns table (
  week date,
  grade smallint,
  sub_type text,
  kind text,
  session_count bigint,
  avg_accuracy numeric
)
language sql stable security definer set search_path = ''
as $$
  select
    date_trunc('week', s.completed_at)::date as week,
    c.grade,
    s.sub_type,
    s.kind,
    count(*) as session_count,
    round(avg(s.correct::numeric / s.total), 3) as avg_accuracy
  from public.sessions s
  join public.children c on c.parent_id = s.parent_id and c.id = s.child_id
  group by 1, 2, 3, 4
  having count(*) >= 3
  order by 1 desc, 2, 3, 4
$$;

revoke all on function public.usage_insights() from public;
revoke execute on function public.usage_insights() from anon, authenticated;
