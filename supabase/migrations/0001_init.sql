-- ThinkSprout: parent accounts, children, practice sessions, invite-only beta.
-- Privacy by design: children are a nickname + grade + avatar only (COPPA);
-- every row belongs to one parent and row-level security keeps families apart.

-- ---------- Tables ----------

create table public.parents (
  id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  -- Invite-only beta: only parents with access can save children/progress.
  beta_access boolean not null default false,
  invite_code text,
  -- When the parent confirmed they're a parent/guardian 18+ and accepted the privacy policy.
  consent_at timestamptz
);

create table public.invite_codes (
  code text primary key check (code = upper(code)),
  max_uses int not null default 1 check (max_uses > 0),
  uses int not null default 0 check (uses >= 0),
  expires_at timestamptz,
  note text,
  created_at timestamptz not null default now()
);

create table public.children (
  parent_id uuid not null references auth.users (id) on delete cascade,
  -- Generated on the device that created the child.
  id text not null,
  name text not null check (char_length(name) between 1 and 40),
  grade smallint not null check (grade in (1, 2)),
  avatar text not null,
  test_date date,
  shown_question_ids jsonb not null default '{}'::jsonb,
  daily_plan_dates text[] not null default '{}',
  -- Set by the device on each edit; sync keeps the newest copy.
  updated_at timestamptz not null,
  -- Removed children are kept as tombstones so the removal reaches every device.
  deleted_at timestamptz,
  primary key (parent_id, id)
);

create table public.sessions (
  parent_id uuid not null,
  id text not null,
  child_id text not null,
  sub_type text not null,
  correct int not null check (correct >= 0),
  total int not null check (total > 0 and correct <= total),
  kind text check (kind in ('practice', 'mock', 'daily')),
  mock_run_id text,
  mock_mode text,
  completed_at timestamptz not null,
  primary key (parent_id, id),
  foreign key (parent_id, child_id) references public.children (parent_id, id) on delete cascade
);

create index sessions_child_idx on public.sessions (parent_id, child_id);

-- ---------- Access helpers ----------

create function public.has_access()
returns boolean
language sql stable security definer set search_path = ''
as $$
  select coalesce((select beta_access from public.parents where id = auth.uid()), false)
$$;

-- ---------- Row-level security ----------

alter table public.parents enable row level security;
alter table public.invite_codes enable row level security;
alter table public.children enable row level security;
alter table public.sessions enable row level security;

-- Parents can see their own record but never change it (no self-granted access).
create policy "parents: read own" on public.parents
  for select to authenticated using (id = (select auth.uid()));

-- invite_codes: no policies at all; only the functions below touch it.

create policy "children: read own" on public.children
  for select to authenticated using (parent_id = (select auth.uid()));
create policy "children: insert own (with access)" on public.children
  for insert to authenticated with check (parent_id = (select auth.uid()) and public.has_access());
create policy "children: update own (with access)" on public.children
  for update to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()) and public.has_access());

create policy "sessions: read own" on public.sessions
  for select to authenticated using (parent_id = (select auth.uid()));
create policy "sessions: insert own (with access)" on public.sessions
  for insert to authenticated with check (parent_id = (select auth.uid()) and public.has_access());
create policy "sessions: update own (with access)" on public.sessions
  for update to authenticated
  using (parent_id = (select auth.uid()))
  with check (parent_id = (select auth.uid()) and public.has_access());
-- "Reset progress" in the parent area clears a child's sessions everywhere.
create policy "sessions: delete own" on public.sessions
  for delete to authenticated using (parent_id = (select auth.uid()));

-- ---------- Sign-up: create the parent record, redeem the invite ----------

create function public.handle_new_user()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  v_code text := upper(trim(new.raw_user_meta_data ->> 'invite_code'));
  v_redeemed boolean := false;
begin
  if v_code is not null and v_code <> '' then
    update public.invite_codes
       set uses = uses + 1
     where code = v_code
       and uses < max_uses
       and (expires_at is null or expires_at > now())
    returning true into v_redeemed;
  end if;

  insert into public.parents (id, beta_access, invite_code, consent_at)
  values (
    new.id,
    coalesce(v_redeemed, false),
    case when v_redeemed then v_code end,
    case when (new.raw_user_meta_data ->> 'consent') = 'true' then now() end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Functions the app calls ----------

-- Lets the sign-up screen say "that code works" before creating the account.
create function public.check_invite(p_code text)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1 from public.invite_codes
     where code = upper(trim(p_code))
       and uses < max_uses
       and (expires_at is null or expires_at > now())
  )
$$;

-- For a signed-in parent who created an account without a (valid) code.
create function public.redeem_invite(p_code text)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare
  v_code text := upper(trim(p_code));
  v_redeemed boolean := false;
begin
  if auth.uid() is null then
    return false;
  end if;
  if (select beta_access from public.parents where id = auth.uid()) then
    return true;
  end if;
  update public.invite_codes
     set uses = uses + 1
   where code = v_code
     and uses < max_uses
     and (expires_at is null or expires_at > now())
  returning true into v_redeemed;
  if coalesce(v_redeemed, false) then
    update public.parents set beta_access = true, invite_code = v_code where id = auth.uid();
  end if;
  return coalesce(v_redeemed, false);
end;
$$;

-- In-app account deletion (required by the App Store): removes the parent's
-- login and, through the cascades above, all of their children and sessions.
create function public.delete_my_account()
returns void
language plpgsql security definer set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'not signed in';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke all on function public.has_access() from public;
revoke all on function public.check_invite(text) from public;
revoke all on function public.redeem_invite(text) from public;
revoke all on function public.delete_my_account() from public;
revoke all on function public.handle_new_user() from public;
-- Supabase grants new functions to anon/authenticated by default; only the
-- intended callers keep access.
revoke execute on function public.has_access() from anon;
revoke execute on function public.redeem_invite(text) from anon;
revoke execute on function public.delete_my_account() from anon;
revoke execute on function public.handle_new_user() from anon, authenticated;
grant execute on function public.has_access() to authenticated;
grant execute on function public.check_invite(text) to anon, authenticated;
grant execute on function public.redeem_invite(text) to authenticated;
grant execute on function public.delete_my_account() to authenticated;
