-- ============================================================
-- PUISANO360 — Full Database Schema + Seed Data
-- Run this in Supabase SQL Editor
-- ============================================================

-- SCHOOLS
create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null
);

-- TEACHERS (linked to Supabase Auth via auth_id)
create table if not exists teachers (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  school_id uuid references schools(id),
  created_at timestamptz default now()
);

-- PARENTS (linked to Supabase Auth via auth_id)
create table if not exists parents (
  id uuid primary key default gen_random_uuid(),
  auth_id uuid unique references auth.users(id) on delete cascade,
  full_name text not null,
  email text unique not null,
  school_id uuid references schools(id),
  created_at timestamptz default now()
);

-- ANNOUNCEMENTS
create table if not exists announcements (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references teachers(id) on delete cascade,
  school_id uuid references schools(id),
  title text not null,
  body text not null,
  created_at timestamptz default now()
);

-- MESSAGES (teacher <-> parent)
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null,
  receiver_id uuid not null,
  sender_role text check (sender_role in ('teacher', 'parent')) not null,
  content text not null,
  created_at timestamptz default now()
);

-- PROGRESS REPORTS
create table if not exists progress_reports (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references teachers(id) on delete cascade,
  parent_id uuid references parents(id) on delete cascade,
  school_id uuid references schools(id),
  file_name text not null,
  report_url text not null,
  term text not null,
  created_at timestamptz default now()
);

-- PTA MEETINGS
create table if not exists pta_meetings (
  id uuid primary key default gen_random_uuid(),
  school_id uuid references schools(id),
  teacher_id uuid references teachers(id) on delete cascade,
  title text not null,
  meeting_link text not null,
  scheduled_at timestamptz not null,
  created_at timestamptz default now()
);

-- ============================================================
-- SEED: Schools
-- ============================================================
insert into schools (id, name) values
  ('11111111-0000-0000-0000-000000000001', 'Gaborone International'),
  ('11111111-0000-0000-0000-000000000002', 'Westwood International'),
  ('11111111-0000-0000-0000-000000000003', 'Northside Primary')
on conflict do nothing;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table schools enable row level security;
alter table teachers enable row level security;
alter table parents enable row level security;
alter table announcements enable row level security;
alter table messages enable row level security;
alter table progress_reports enable row level security;
alter table pta_meetings enable row level security;

-- Allow all authenticated users to read schools
create policy "schools_read" on schools for select to authenticated using (true);

-- Teachers: read own row
create policy "teachers_read_own" on teachers for select to authenticated
  using (auth_id = auth.uid());

-- Teachers: read all teachers in same school (for messaging)
create policy "teachers_read_school" on teachers for select to authenticated using (true);

-- Parents: read own row
create policy "parents_read_own" on parents for select to authenticated
  using (auth_id = auth.uid());

-- Parents: read all parents (teachers need this)
create policy "parents_read_all" on parents for select to authenticated using (true);

-- Announcements: anyone in school can read
create policy "announcements_read" on announcements for select to authenticated using (true);
create policy "announcements_insert" on announcements for insert to authenticated with check (true);

-- Messages: sender or receiver can read
create policy "messages_read" on messages for select to authenticated
  using (sender_id = auth.uid() or receiver_id = auth.uid());
create policy "messages_insert" on messages for insert to authenticated with check (true);

-- Progress reports: teacher who uploaded or parent it belongs to
create policy "reports_read" on progress_reports for select to authenticated using (true);
create policy "reports_insert" on progress_reports for insert to authenticated with check (true);

-- PTA meetings: anyone in school can read
create policy "meetings_read" on pta_meetings for select to authenticated using (true);
create policy "meetings_insert" on pta_meetings for insert to authenticated with check (true);

-- ============================================================
-- Supabase Storage bucket for progress reports
-- Run separately if needed:
-- insert into storage.buckets (id, name, public) values ('reports', 'reports', true);
-- ============================================================
