-- Migration 002: Add atmosphere_image to event_types
ALTER TABLE event_types ADD COLUMN IF NOT EXISTS atmosphere_image text;
