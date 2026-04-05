create table sessions (
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
  iob numeric
);

create table alert_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  alert_level text,
  message text,
  tier integer,
  created_at timestamptz default now()
);

create table passports (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  passport_data jsonb,
  url_slug text unique,
  created_at timestamptz default now()
);