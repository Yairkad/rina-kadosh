-- ============================================================
-- Migration 007: Grant anon INSERT on orders
-- ============================================================
-- Migration 001 added the "orders: anon insert" RLS policy, but never
-- granted the underlying table-level INSERT privilege to the anon role.
-- Postgres checks GRANT privileges before RLS is evaluated, so every
-- checkout submission from the public cart failed with
-- "permission denied for table orders" (surfaced to the user as a
-- generic "error submitting order" message). This mirrors the exact
-- gap fixed for gallery_items in migration 004.

GRANT INSERT ON orders TO anon;
