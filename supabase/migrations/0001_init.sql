create extension if not exists pgcrypto;

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz default now()
);

create table if not exists businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  timezone text not null default 'Asia/Colombo',
  created_at timestamptz default now()
);

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  name text not null,
  duration_minutes int not null,
  price_cents int not null default 0,
  is_active bool not null default true,
  created_at timestamptz default now()
);

create table if not exists availability_rules (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  weekday int not null check (weekday between 0 and 6),
  start_time text not null,
  end_time text not null,
  breaks jsonb not null default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists availability_exceptions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  date date not null,
  is_closed bool not null default false,
  start_time text,
  end_time text,
  breaks jsonb not null default '[]'::jsonb
);

create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references businesses(id) on delete cascade,
  service_id uuid references services(id),
  customer_name text not null,
  customer_email text not null,
  start_at timestamptz not null,
  end_at timestamptz not null,
  status text not null check (status in ('confirmed','cancelled')),
  note text,
  created_at timestamptz default now()
);

create index if not exists idx_bookings_business_start on bookings (business_id, start_at);
create index if not exists idx_services_business on services (business_id);
create index if not exists idx_rules_business_weekday on availability_rules (business_id, weekday);
create index if not exists idx_exceptions_business_date on availability_exceptions (business_id, date);
