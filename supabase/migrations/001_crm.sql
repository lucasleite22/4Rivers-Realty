-- ============================================================
-- 4River Realty CRM — Migration 001
-- ============================================================

-- Extensions
create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================

create type user_role as enum ('super_admin', 'agent');
create type lead_type as enum ('buyer', 'seller', 'investor');
create type lead_origin as enum ('Website', 'Referral', 'Zillow', 'Realtor.com', 'Instagram', 'Other');
create type lead_status as enum (
  'new_lead', 'contacted', 'showing', 'offer_made',
  'under_contract', 'closed_won', 'closed_lost'
);
create type activity_type as enum ('call', 'email', 'showing', 'offer', 'note');
create type property_type as enum ('horse_farm', 'ranch', 'residential', 'commercial', 'land');
create type property_status as enum ('active', 'sold', 'under_contract');

-- ============================================================
-- TABLES
-- ============================================================

-- Users (mirrors auth.users with extra profile fields)
create table users (
  id          uuid primary key default uuid_generate_v4(),
  email       text not null unique,
  name        text not null,
  role        user_role not null default 'agent',
  active      boolean not null default true,
  created_at  timestamptz not null default now()
);

-- Leads
create table leads (
  id                uuid primary key default uuid_generate_v4(),
  name              text not null,
  email             text,
  phone             text,
  type              lead_type not null default 'buyer',
  origin            lead_origin not null default 'Website',
  property_interest text,
  budget_usd        numeric(12, 2),
  acreage_desired   numeric(8, 2),
  county_preferred  text,
  status            lead_status not null default 'new_lead',
  featured          boolean not null default false,
  notes             text,
  assigned_to       uuid references users(id) on delete set null,
  last_contact_at   timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Lead Activities
create table lead_activities (
  id            uuid primary key default uuid_generate_v4(),
  lead_id       uuid not null references leads(id) on delete cascade,
  user_id       uuid not null references users(id) on delete restrict,
  type          activity_type not null,
  notes         text,
  activity_date timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- Properties
create table properties (
  id          uuid primary key default uuid_generate_v4(),
  title       text not null,
  type        property_type not null default 'land',
  price_usd   numeric(14, 2),
  acreage     numeric(10, 2),
  county      text,
  city        text,
  address     text,
  description text,
  status      property_status not null default 'active',
  featured    boolean not null default false,
  stables     integer default 0,
  arenas      integer default 0,
  pastures    integer default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Property Images
create table property_images (
  id          uuid primary key default uuid_generate_v4(),
  property_id uuid not null references properties(id) on delete cascade,
  url         text not null,
  is_cover    boolean not null default false,
  sort_order  integer not null default 0
);

-- ============================================================
-- INDEXES
-- ============================================================

create index leads_status_idx        on leads(status);
create index leads_assigned_to_idx   on leads(assigned_to);
create index leads_created_at_idx    on leads(created_at desc);
create index leads_last_contact_idx  on leads(last_contact_at);
create index activities_lead_id_idx  on lead_activities(lead_id);
create index activities_user_id_idx  on lead_activities(user_id);
create index properties_status_idx   on properties(status);
create index properties_type_idx     on properties(type);
create index property_images_prop_idx on property_images(property_id);

-- ============================================================
-- UPDATED_AT TRIGGER
-- ============================================================

create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

create trigger properties_updated_at
  before update on properties
  for each row execute function set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table users           enable row level security;
alter table leads           enable row level security;
alter table lead_activities enable row level security;
alter table properties      enable row level security;
alter table property_images enable row level security;

-- Helper function: get role of the current user from our users table
create or replace function current_user_role()
returns text language sql stable security definer as $$
  select role::text from users where id = auth.uid();
$$;

-- ---- USERS ----
-- Authenticated users can read
create policy "users_select" on users
  for select to authenticated using (true);

-- Only super_admin can insert/update/delete
create policy "users_insert" on users
  for insert to authenticated
  with check (current_user_role() = 'super_admin');

create policy "users_update" on users
  for update to authenticated
  using (current_user_role() = 'super_admin');

create policy "users_delete" on users
  for delete to authenticated
  using (current_user_role() = 'super_admin');

-- ---- LEADS ----
create policy "leads_select" on leads
  for select to authenticated using (true);

create policy "leads_insert" on leads
  for insert to authenticated
  with check (current_user_role() in ('agent', 'super_admin'));

create policy "leads_update" on leads
  for update to authenticated
  using (current_user_role() in ('agent', 'super_admin'));

create policy "leads_delete" on leads
  for delete to authenticated
  using (current_user_role() = 'super_admin');

-- ---- LEAD ACTIVITIES ----
create policy "activities_select" on lead_activities
  for select to authenticated using (true);

create policy "activities_insert" on lead_activities
  for insert to authenticated
  with check (current_user_role() in ('agent', 'super_admin'));

create policy "activities_update" on lead_activities
  for update to authenticated
  using (current_user_role() in ('agent', 'super_admin'));

create policy "activities_delete" on lead_activities
  for delete to authenticated
  using (current_user_role() = 'super_admin');

-- ---- PROPERTIES ----
create policy "properties_select" on properties
  for select to authenticated using (true);

create policy "properties_insert" on properties
  for insert to authenticated
  with check (current_user_role() = 'super_admin');

create policy "properties_update" on properties
  for update to authenticated
  using (current_user_role() = 'super_admin');

create policy "properties_delete" on properties
  for delete to authenticated
  using (current_user_role() = 'super_admin');

-- ---- PROPERTY IMAGES ----
create policy "property_images_select" on property_images
  for select to authenticated using (true);

create policy "property_images_insert" on property_images
  for insert to authenticated
  with check (current_user_role() = 'super_admin');

create policy "property_images_update" on property_images
  for update to authenticated
  using (current_user_role() = 'super_admin');

create policy "property_images_delete" on property_images
  for delete to authenticated
  using (current_user_role() = 'super_admin');

-- ============================================================
-- SEED: default super_admin (update after first auth signup)
-- ============================================================
-- INSERT INTO users (id, email, name, role) VALUES
--   ('<auth-user-uuid>', 'admin@4riverrealty.com', 'Admin', 'super_admin');
