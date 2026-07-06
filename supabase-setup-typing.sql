-- Add typing test support to an existing PDMS Supabase project.
-- Prefer supabase-fix-missing-tables.sql (creates ALL missing tables safely).
-- Run in SQL Editor if you only need the typing table added.

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

alter table public.prediction_data add column if not exists typing_score numeric not null default 0;

notify pgrst, 'reload schema';
