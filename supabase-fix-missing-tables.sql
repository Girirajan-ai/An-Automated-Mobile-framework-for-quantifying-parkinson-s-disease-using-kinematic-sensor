-- ============================================================
-- PDMS — Fix "Could not find the table in the schema"
-- Safe to run multiple times. Does NOT delete existing data.
-- Supabase → SQL Editor → New query → Paste ALL → Run
-- ============================================================

-- Profiles
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
create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Bradykinesia
create table if not exists public.bradykinesia_data (
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
drop policy if exists "Own bradykinesia select" on public.bradykinesia_data;
drop policy if exists "Own bradykinesia insert" on public.bradykinesia_data;
create policy "Own bradykinesia select" on public.bradykinesia_data for select using (auth.uid() = patient_id);
create policy "Own bradykinesia insert" on public.bradykinesia_data for insert with check (auth.uid() = patient_id);

-- Tremor
create table if not exists public.tremor_data (
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
drop policy if exists "Own tremor select" on public.tremor_data;
drop policy if exists "Own tremor insert" on public.tremor_data;
create policy "Own tremor select" on public.tremor_data for select using (auth.uid() = patient_id);
create policy "Own tremor insert" on public.tremor_data for insert with check (auth.uid() = patient_id);

-- Rigidity
create table if not exists public.rigidity_data (
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
drop policy if exists "Own rigidity select" on public.rigidity_data;
drop policy if exists "Own rigidity insert" on public.rigidity_data;
create policy "Own rigidity select" on public.rigidity_data for select using (auth.uid() = patient_id);
create policy "Own rigidity insert" on public.rigidity_data for insert with check (auth.uid() = patient_id);

-- Typing (new 4th test)
create table if not exists public.typing_data (
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
drop policy if exists "Own typing select" on public.typing_data;
drop policy if exists "Own typing insert" on public.typing_data;
create policy "Own typing select" on public.typing_data for select using (auth.uid() = patient_id);
create policy "Own typing insert" on public.typing_data for insert with check (auth.uid() = patient_id);

-- Predictions
create table if not exists public.prediction_data (
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
drop policy if exists "Own prediction select" on public.prediction_data;
drop policy if exists "Own prediction insert" on public.prediction_data;
create policy "Own prediction select" on public.prediction_data for select using (auth.uid() = patient_id);
create policy "Own prediction insert" on public.prediction_data for insert with check (auth.uid() = patient_id);

-- Add typing_score if prediction table existed before typing test was added
alter table public.prediction_data add column if not exists typing_score numeric not null default 0;

-- Refresh Supabase API schema cache
notify pgrst, 'reload schema';
