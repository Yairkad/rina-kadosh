-- ============================================================
-- Migration 010: Insert orders via a SECURITY DEFINER function
-- ============================================================
-- Postgres RLS filters the RETURNING clause of INSERT/UPDATE through
-- the table's SELECT policies too, not just plain SELECT queries.
-- `orders` has no anon SELECT policy (by design — it holds customer
-- PII), so `.insert({...}).select("order_number").single()` from the
-- public checkout inserted the row successfully but got zero rows back
-- from RETURNING, which `.single()` turns into a swallowed error with
-- nothing printed to the console. Migrations 006/007/008 were real
-- fixes but couldn't address this, since it's not a GRANT or trigger
-- problem — it's RLS-on-RETURNING.
--
-- Fix: perform the insert inside a SECURITY DEFINER function (the
-- same pattern already used for is_admin()/validate_coupon/
-- redeem_coupon), which runs with the function owner's privileges and
-- is not subject to the caller's RLS at all. It returns only the
-- order_number scalar — never exposing the orders table itself to
-- anon, so no public SELECT policy is needed.

CREATE OR REPLACE FUNCTION create_order(
  p_customer_name    text,
  p_customer_phone   text,
  p_customer_email   text,
  p_delivery_method  text,
  p_delivery_address text,
  p_delivery_notes   text,
  p_logo_url         text,
  p_special_requests text,
  p_items            jsonb,
  p_total_amount     numeric,
  p_coupon_code      text,
  p_discount_amount  numeric
)
RETURNS text
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_order_number text;
BEGIN
  INSERT INTO orders (
    order_number, customer_name, customer_phone, customer_email,
    delivery_method, delivery_address, delivery_notes, logo_url,
    special_requests, items, total_amount, coupon_code, discount_amount,
    status
  ) VALUES (
    '', p_customer_name, p_customer_phone, p_customer_email,
    p_delivery_method, p_delivery_address, p_delivery_notes, p_logo_url,
    p_special_requests, p_items, p_total_amount, p_coupon_code, p_discount_amount,
    'pending'
  )
  RETURNING order_number INTO v_order_number;

  RETURN v_order_number;
END;
$$;

GRANT EXECUTE ON FUNCTION create_order(
  text, text, text, text, text, text, text, text, jsonb, numeric, text, numeric
) TO anon, authenticated;
