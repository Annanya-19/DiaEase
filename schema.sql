-- USERS (PROFILE TABLE)
-- =========================
create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  email text unique not null,
  name text,
  diabetes_type text check (diabetes_type in ('type1', 'type2', 'gestational', 'prediabetes')),
  takes_insulin boolean default false,
  meals_per_day integer,
  activity_level text check (activity_level in ('sedentary', 'light', 'moderate', 'active')),
  typical_carb_intake text check (typical_carb_intake in ('low', 'medium', 'high')),
  experiences_hypoglycemia boolean default false,
  preferred_unit text default 'mmol/L' check (preferred_unit in ('mmol/L', 'mg/dL')),
  alert_preference text default 'push' check (alert_preference in ('push', 'sms')),
  emergency_contact_name text,
  emergency_contact_phone text
);

-- =========================
-- SESSIONS
-- =========================
create table if not exists sessions (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  glucose numeric not null,
  insulin_dose numeric,
  insulin_type text,
  hours_ago_insulin numeric,
  meal_preset text,
  carb_grams numeric,
  activity text,
  trend text,
  risk_score numeric,
  predicted_glucose numeric,
  alert_level text,
  iob numeric,
  user_id uuid references auth.users(id) on delete cascade
);

-- =========================
-- ALERT EVENTS
-- =========================
create table if not exists alert_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  alert_level text,
  message text,
  tier integer,
  created_at timestamptz default now()
);

-- =========================
-- PASSPORTS
-- =========================
create table if not exists passports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  passport_data jsonb,
  url_slug text unique,
  created_at timestamptz default now(),
  user_id uuid references auth.users(id) on delete cascade
);

-- =========================
-- INDEXES
-- =========================
create index if not exists idx_sessions_user_id on sessions(user_id);
create index if not exists idx_alerts_session_id on alert_events(session_id);
create index if not exists idx_passports_user_id on passports(user_id);

-- =========================
-- AUTO CREATE USER PROFILE
-- =========================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into users (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure handle_new_user();

-- =========================
-- ENABLE RLS
-- =========================
alter table users enable row level security;
alter table sessions enable row level security;
alter table alert_events enable row level security;
alter table passports enable row level security;

-- =========================
-- RLS POLICIES
-- =========================

-- USERS
create policy "Users can manage own profile"
on users
for all
using (auth.uid() = id)
with check (auth.uid() = id);

-- SESSIONS
create policy "Users can manage own sessions"
on sessions
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- ALERT EVENTS
create policy "Users can access own alerts"
on alert_events
for all
using (
  exists (
    select 1 from sessions
    where sessions.id = alert_events.session_id
    and sessions.user_id = auth.uid()
  )
);

-- PASSPORTS
create policy "Users can manage own passports"
on passports
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
