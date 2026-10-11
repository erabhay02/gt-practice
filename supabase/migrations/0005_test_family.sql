-- Phase 6: which school test each child practices for (CogAT, NNAT3 or OLSAT).
-- Existing children keep practicing CogAT. Older app builds don't send this
-- column, so an upsert from them leaves the stored value unchanged.
alter table public.children
  add column test_family text not null default 'cogat'
  check (test_family in ('cogat', 'nnat3', 'olsat'));
