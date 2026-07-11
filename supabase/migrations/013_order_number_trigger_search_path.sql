-- ============================================================
-- Migration 013: Pin search_path on generate_order_number()
-- ============================================================
-- Migration 012 fixed search_path on validate_coupon/redeem_coupon/
-- create_order, but "relation \"orders\" does not exist" persisted —
-- confirmed via pg_proc inspection that create_order() itself is
-- correctly public.orders-qualified. The remaining unqualified
-- reference is generate_order_number() (from migration 001), the
-- BEFORE INSERT trigger function that fires as part of the same
-- INSERT INTO public.orders executed inside create_order(). It was
-- never touched by 012 and still does `FROM orders` unqualified.

CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
  today_str text;
  today_count integer;
BEGIN
  today_str := to_char(now(), 'YYYYMMDD');
  SELECT COUNT(*) + 1 INTO today_count
  FROM public.orders
  WHERE created_at::date = CURRENT_DATE
    AND id != NEW.id;
  NEW.order_number := 'RK-' || today_str || '-' || LPAD(today_count::text, 3, '0');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;
