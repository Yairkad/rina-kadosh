-- ============================================================
-- Migration 006: Allow anonymous customers to upload order logos
-- ============================================================
-- The public checkout flow (app/[locale]/(public)/cart/page.tsx) uploads
-- to the "logos" bucket as the `anon` role (customers are not authenticated).
-- No storage.objects policy existed for that bucket/role, so every upload
-- was rejected by RLS with a 400 from the Storage API.

insert into storage.buckets (id, name, public)
values ('logos', 'logos', true)
on conflict (id) do update set public = true;

drop policy if exists "logos: anon upload" on storage.objects;
create policy "logos: anon upload" on storage.objects
  for insert to anon
  with check (bucket_id = 'logos');

drop policy if exists "logos: public read" on storage.objects;
create policy "logos: public read" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'logos');

drop policy if exists "logos: admin all" on storage.objects;
create policy "logos: admin all" on storage.objects
  for all to authenticated
  using (bucket_id = 'logos' and is_admin());
