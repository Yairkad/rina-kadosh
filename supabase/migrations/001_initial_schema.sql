-- ============================================================
-- Migration 001: Initial Schema — Rina Kadosh
-- ============================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- ============================================================
-- TABLES
-- ============================================================

-- profiles (linked to auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id         uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      text NOT NULL,
  is_admin   boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- event_types
CREATE TABLE IF NOT EXISTS event_types (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he             text NOT NULL,
  name_en             text NOT NULL,
  slug                text UNIQUE NOT NULL,
  image               text,
  display_order       integer DEFAULT 0,
  status              text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title_he        text,
  seo_title_en        text,
  seo_description_he  text,
  seo_description_en  text,
  og_image            text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- design_styles
CREATE TABLE IF NOT EXISTS design_styles (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type_id       uuid NOT NULL REFERENCES event_types(id) ON DELETE CASCADE,
  name_he             text NOT NULL,
  name_en             text NOT NULL,
  slug                text NOT NULL,
  display_order       integer DEFAULT 0,
  status              text DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title_he        text,
  seo_title_en        text,
  seo_description_he  text,
  seo_description_en  text,
  og_image            text,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now(),
  UNIQUE(event_type_id, slug)
);

-- products
CREATE TABLE IF NOT EXISTS products (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he             text NOT NULL,
  name_en             text NOT NULL,
  description_he      text,
  description_en      text,
  price_per_unit      numeric(10,2) NOT NULL,
  cost_price          numeric(10,2),
  min_type            text CHECK (min_type IN ('units', 'amount')),
  min_value           numeric(10,2),
  event_type_id       uuid REFERENCES event_types(id),
  design_style_id     uuid REFERENCES design_styles(id),
  images              text[] DEFAULT '{}',
  related_products    uuid[] DEFAULT '{}',
  status              text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  seo_title_he        text,
  seo_title_en        text,
  seo_description_he  text,
  seo_description_en  text,
  og_image            text,
  deleted_at          timestamptz,
  created_at          timestamptz DEFAULT now(),
  updated_at          timestamptz DEFAULT now()
);

-- bundles
CREATE TABLE IF NOT EXISTS bundles (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_he         text NOT NULL,
  name_en         text NOT NULL,
  description_he  text,
  description_en  text,
  images          text[] DEFAULT '{}',
  items           jsonb NOT NULL DEFAULT '[]',
  bundle_price    numeric(10,2) NOT NULL,
  original_price  numeric(10,2),
  event_type_id   uuid REFERENCES event_types(id),
  design_style_id uuid REFERENCES design_styles(id),
  status          text DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  created_at      timestamptz DEFAULT now(),
  updated_at      timestamptz DEFAULT now()
);

-- orders
CREATE TABLE IF NOT EXISTS orders (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number     text UNIQUE NOT NULL,
  customer_name    text NOT NULL,
  customer_phone   text NOT NULL,
  customer_email   text NOT NULL,
  logo_url         text,
  special_requests text,
  items            jsonb NOT NULL DEFAULT '[]',
  total_amount     numeric(10,2),
  delivery_method  text DEFAULT 'pickup' CHECK (delivery_method IN ('pickup', 'delivery')),
  delivery_address text,
  delivery_notes   text,
  status           text DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'in_production', 'ready', 'delivered', 'cancelled')),
  admin_notes      text,
  deleted_at       timestamptz,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

-- gallery_items
CREATE TABLE IF NOT EXISTS gallery_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title_he      text,
  title_en      text,
  images        text[] NOT NULL DEFAULT '{}',
  event_type_id uuid REFERENCES event_types(id),
  active        boolean DEFAULT true,
  created_at    timestamptz DEFAULT now()
);

-- audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL CHECK (entity_type IN ('order', 'product', 'bundle')),
  entity_id   uuid NOT NULL,
  action      text NOT NULL CHECK (action IN ('status_change', 'edit', 'delete', 'create')),
  old_data    jsonb,
  new_data    jsonb,
  created_by  uuid REFERENCES profiles(id),
  created_at  timestamptz DEFAULT now()
);

-- ============================================================
-- TRIGGERS: updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_event_types_updated_at
  BEFORE UPDATE ON event_types
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_design_styles_updated_at
  BEFORE UPDATE ON design_styles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_bundles_updated_at
  BEFORE UPDATE ON bundles
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================================
-- ORDER NUMBER GENERATION: RK-YYYYMMDD-XXX
-- ============================================================

CREATE SEQUENCE IF NOT EXISTS order_daily_seq;

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_str text;
  today_count integer;
BEGIN
  today_str := to_char(now(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO today_count
  FROM orders
  WHERE created_at::date = CURRENT_DATE
    AND id != NEW.id;
  NEW.order_number := 'RK-' || today_str || '-' || LPAD(today_count::text, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();

-- ============================================================
-- AUTO-CREATE PROFILE ON NEW AUTH USER
-- ============================================================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER trg_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- INDEXES
-- ============================================================

-- Slug lookups
CREATE INDEX IF NOT EXISTS idx_event_types_slug ON event_types(slug);
CREATE INDEX IF NOT EXISTS idx_design_styles_slug ON design_styles(event_type_id, slug);

-- Status filtering
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_bundles_status ON bundles(status);

-- Catalog filtering
CREATE INDEX IF NOT EXISTS idx_products_event_style ON products(event_type_id, design_style_id);
CREATE INDEX IF NOT EXISTS idx_bundles_event_style ON bundles(event_type_id, design_style_id);

-- Order number & date
CREATE INDEX IF NOT EXISTS idx_orders_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);

-- Trigram (Hebrew search)
CREATE INDEX IF NOT EXISTS idx_products_name_he_trgm ON products USING gin(name_he gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_products_name_en_trgm ON products USING gin(name_en gin_trgm_ops);

-- Audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_types    ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_styles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE bundles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs     ENABLE ROW LEVEL SECURITY;

-- Helper: is current user admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- profiles
CREATE POLICY "profiles: admin full access" ON profiles
  FOR ALL TO authenticated USING (is_admin());

CREATE POLICY "profiles: own row read" ON profiles
  FOR SELECT TO authenticated USING (id = auth.uid());

-- event_types (public read, admin write)
CREATE POLICY "event_types: public read published" ON event_types
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "event_types: admin all" ON event_types
  FOR ALL TO authenticated USING (is_admin());

-- design_styles (public read, admin write)
CREATE POLICY "design_styles: public read published" ON design_styles
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "design_styles: admin all" ON design_styles
  FOR ALL TO authenticated USING (is_admin());

-- products (public read published, admin all, soft delete filter)
CREATE POLICY "products: public read published" ON products
  FOR SELECT TO anon, authenticated
  USING (status = 'published' AND deleted_at IS NULL);

CREATE POLICY "products: admin all" ON products
  FOR ALL TO authenticated USING (is_admin());

-- bundles (public read published, admin all)
CREATE POLICY "bundles: public read published" ON bundles
  FOR SELECT TO anon, authenticated USING (status = 'published');

CREATE POLICY "bundles: admin all" ON bundles
  FOR ALL TO authenticated USING (is_admin());

-- orders (anon insert only, admin all, owner can read own)
CREATE POLICY "orders: anon insert" ON orders
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "orders: admin all" ON orders
  FOR ALL TO authenticated USING (is_admin());

-- gallery_items (public read active, admin all)
CREATE POLICY "gallery_items: public read active" ON gallery_items
  FOR SELECT TO anon, authenticated USING (active = true);

CREATE POLICY "gallery_items: admin all" ON gallery_items
  FOR ALL TO authenticated USING (is_admin());

-- audit_logs (admin only)
CREATE POLICY "audit_logs: admin all" ON audit_logs
  FOR ALL TO authenticated USING (is_admin());
