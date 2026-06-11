-- Migration 005: Clear all demo catalog data
-- Keeps: orders, profiles, raw_materials, audit_logs for orders

DELETE FROM audit_logs WHERE entity_type IN ('product', 'bundle');

TRUNCATE TABLE product_materials;
TRUNCATE TABLE bundles;
TRUNCATE TABLE products;
TRUNCATE TABLE gallery_items;
TRUNCATE TABLE design_styles;
TRUNCATE TABLE event_types;
