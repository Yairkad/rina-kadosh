-- ============================================================
-- Migration 011: Grant authenticated access on coupons
-- ============================================================
-- Same bug class as gallery_items (004) and orders (007): migration
-- 009 created RLS policy "coupons: admin all" for authenticated, but
-- never granted the underlying table-level privileges. Postgres
-- checks GRANT before RLS, so every admin attempt to create/edit a
-- coupon failed with "permission denied for table coupons". RLS
-- (is_admin()) remains the real authorization check — this GRANT only
-- allows the operation to be attempted.

GRANT SELECT, INSERT, UPDATE, DELETE ON coupons TO authenticated;
