-- ============================================================
-- Migration 014: Add display_order to products (drag-to-reorder within a category)
-- ============================================================

ALTER TABLE products ADD COLUMN IF NOT EXISTS display_order integer DEFAULT 0;

-- Backfill existing rows so current listing order (newest first) is preserved
-- as the initial drag order, grouped per design_style.
WITH ranked AS (
  SELECT id,
         ROW_NUMBER() OVER (
           PARTITION BY design_style_id
           ORDER BY created_at DESC
         ) - 1 AS rn
  FROM products
)
UPDATE products
SET display_order = ranked.rn
FROM ranked
WHERE products.id = ranked.id;

CREATE INDEX IF NOT EXISTS idx_products_display_order ON products(design_style_id, display_order);
