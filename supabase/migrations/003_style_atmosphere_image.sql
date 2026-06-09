-- Migration 003: Add atmosphere_image to design_styles
ALTER TABLE design_styles ADD COLUMN IF NOT EXISTS atmosphere_image text;
