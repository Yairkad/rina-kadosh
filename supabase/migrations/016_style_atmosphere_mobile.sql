-- Migration 016: Add atmosphere_image_mobile to design_styles
-- Optional mobile-specific override for the atmosphere hero on
-- /catalog/[event]/[style] — falls back to atmosphere_image when unset.
ALTER TABLE design_styles ADD COLUMN IF NOT EXISTS atmosphere_image_mobile text;
