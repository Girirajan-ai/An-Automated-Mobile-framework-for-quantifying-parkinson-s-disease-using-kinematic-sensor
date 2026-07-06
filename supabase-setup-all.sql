-- ============================================================
-- PDMS / NeuroTrack — FULL database setup for Supabase
-- Project: oypqvnjtpfrbjqxmncyf
-- Run ONCE: SQL Editor → New query → Paste ALL → Run
-- ============================================================

-- ---------- 1. PROFILES (signup) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  age int,
  gender text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Users view own profile" on public.profiles;
drop policy if exists "Users insert own profile" on public.profiles;
drop policy if exists "Users update own profile" on public.profiles;
drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;

create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- 2. REMOVE OLD TEST TABLES (wrong column names) ----------
-- Old Lovable schema used "user_id". App uses "patient_id".
-- This deletes old test rows only (not auth users).
drop table if exists public.prediction_data cascade;
drop table if exists public.rigidity_data cascade;
drop table if exists public.tremor_data cascade;
drop table if exists public.bradykinesia_data cascade;
drop table if exists public.typing_data cascade;

-- ---------- 3. CREATE TEST TABLES (correct schema) ----------
create table public.bradykinesia_data (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  tap_count int not null,
  reaction_time numeric not null,
  tapping_speed numeric not null,
  interval_consistency numeric not null default 0,
  missed_taps int not null default 0,
  score numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.bradykinesia_data enable row level security;
create policy "Own bradykinesia select" on public.bradykinesia_data for select using (auth.uid() = patient_id);
create policy "Own bradykinesia insert" on public.bradykinesia_data for insert with check (auth.uid() = patient_id);

create table public.tremor_data (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  tremor_frequency numeric not null,
  tremor_amplitude numeric not null,
  angular_velocity_x numeric not null,
  angular_velocity_y numeric not null,
  angular_velocity_z numeric not null,
  motion_variability numeric not null default 0,
  score numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.tremor_data enable row level security;
create policy "Own tremor select" on public.tremor_data for select using (auth.uid() = patient_id);
create policy "Own tremor insert" on public.tremor_data for insert with check (auth.uid() = patient_id);

create table public.rigidity_data (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  movement_score numeric not null,
  range_of_motion numeric not null,
  angular_velocity numeric not null,
  smoothness numeric not null default 0,
  score numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.rigidity_data enable row level security;
create policy "Own rigidity select" on public.rigidity_data for select using (auth.uid() = patient_id);
create policy "Own rigidity insert" on public.rigidity_data for insert with check (auth.uid() = patient_id);

create table public.typing_data (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  wpm numeric not null,
  error_count int not null default 0,
  error_rate numeric not null default 0,
  interval_consistency numeric not null default 0,
  pause_count int not null default 0,
  completion_time_ms numeric not null,
  score numeric not null default 0,
  created_at timestamptz not null default now()
);
alter table public.typing_data enable row level security;
create policy "Own typing select" on public.typing_data for select using (auth.uid() = patient_id);
create policy "Own typing insert" on public.typing_data for insert with check (auth.uid() = patient_id);

create table public.prediction_data (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  bradykinesia_score numeric not null,
  tremor_score numeric not null,
  rigidity_score numeric not null,
  typing_score numeric not null default 0,
  prediction_result text not null,
  severity text not null,
  confidence_percentage numeric not null,
  summary text,
  created_at timestamptz not null default now()
);
alter table public.prediction_data enable row level security;
create policy "Own prediction select" on public.prediction_data for select using (auth.uid() = patient_id);
create policy "Own prediction insert" on public.prediction_data for insert with check (auth.uid() = patient_id);

revoke execute on function public.handle_new_user() from public, anon, authenticated;

notify pgrst, 'reload schema';
