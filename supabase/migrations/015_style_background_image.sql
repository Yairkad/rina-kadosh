-- Migration 015: Add background_image to design_styles
-- Custom background behind the product/bundle grid on /catalog/[event]/[style],
-- separate from atmosphere_image (the hero banner above it). Falls back to the
-- shared marble texture when unset.
ALTER TABLE design_styles ADD COLUMN IF NOT EXISTS background_image text;
