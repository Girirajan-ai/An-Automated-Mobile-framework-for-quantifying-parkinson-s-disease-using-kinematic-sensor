
-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default '',
  age int,
  gender text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Updated_at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger profiles_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

-- Bradykinesia data
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

-- Tremor data
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

-- Rigidity data
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

-- Prediction data
create table public.prediction_data (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references auth.users(id) on delete cascade,
  bradykinesia_score numeric not null,
  tremor_score numeric not null,
  rigidity_score numeric not null,
  prediction_result text not null,
  severity text not null,
  confidence_percentage numeric not null,
  summary text,
  created_at timestamptz not null default now()
);
alter table public.prediction_data enable row level security;
create policy "Own prediction select" on public.prediction_data for select using (auth.uid() = patient_id);
create policy "Own prediction insert" on public.prediction_data for insert with check (auth.uid() = patient_id);
