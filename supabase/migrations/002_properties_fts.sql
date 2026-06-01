-- ============================================================
-- 4River Realty — Migration 002: Property Full-Text Search
--                              + Public Portal Policies
--                              + Storage Bucket
-- ============================================================

-- ── 1. Full-text search vector column ────────────────────────

alter table properties
  add column if not exists search_vector tsvector;

-- Backfill existing rows
update properties
set search_vector = to_tsvector(
  'english',
  coalesce(title, '')       || ' ' ||
  coalesce(description, '') || ' ' ||
  coalesce(city, '')        || ' ' ||
  coalesce(county, '')
);

-- ── 2. Trigger: keep search_vector in sync ────────────────────

create or replace function properties_search_vector_update()
returns trigger language plpgsql as $$
begin
  new.search_vector := to_tsvector(
    'english',
    coalesce(new.title, '')       || ' ' ||
    coalesce(new.description, '') || ' ' ||
    coalesce(new.city, '')        || ' ' ||
    coalesce(new.county, '')
  );
  return new;
end;
$$;

drop trigger if exists properties_search_vector_trigger on properties;

create trigger properties_search_vector_trigger
  before insert or update on properties
  for each row execute function properties_search_vector_update();

-- ── 3. GIN index for fast FTS ─────────────────────────────────

create index if not exists properties_search_vector_idx
  on properties using gin(search_vector);

-- Additional indexes useful for portal filters
create index if not exists properties_featured_idx
  on properties(featured) where featured = true;

create index if not exists properties_price_idx
  on properties(price_usd);

create index if not exists properties_acreage_idx
  on properties(acreage);

create index if not exists properties_county_idx
  on properties(county);

-- ── 4. Public read policies (anon + authenticated) ────────────
--
--  The CRM migration (001) added policies for authenticated users.
--  Here we add anon-accessible policies so the public portal
--  can list/view active properties without a session.

-- Properties: public can read active rows
create policy "properties_public_select" on properties
  for select to anon
  using (status = 'active');

-- Property Images: public can read images of active properties
create policy "property_images_public_select" on property_images
  for select to anon
  using (
    exists (
      select 1 from properties p
      where p.id = property_images.property_id
        and p.status = 'active'
    )
  );

-- ── 5. Supabase Storage: property-images bucket ───────────────
--
--  Run this block once via the Supabase Dashboard SQL editor
--  OR via the Storage API. The SQL approach uses the storage schema.

insert into storage.buckets (id, name, public)
values ('property-images', 'property-images', true)
on conflict (id) do nothing;

-- Allow public (anon) to read all objects in the bucket
create policy "property_images_storage_public_read"
  on storage.objects for select to anon
  using (bucket_id = 'property-images');

-- Allow authenticated admins to upload
create policy "property_images_storage_admin_insert"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'property-images'
    and (current_user_role() = 'super_admin')
  );

-- Allow authenticated admins to delete
create policy "property_images_storage_admin_delete"
  on storage.objects for delete to authenticated
  using (
    bucket_id = 'property-images'
    and (current_user_role() = 'super_admin')
  );
