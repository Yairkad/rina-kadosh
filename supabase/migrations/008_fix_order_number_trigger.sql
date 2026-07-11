-- ============================================================
-- Migration 008: Fix order_number trigger not firing for NULL
-- ============================================================
-- trg_orders_order_number only fired WHEN (NEW.order_number = ''),
-- which is NULL (not true) in SQL when order_number is NULL. The
-- admin manual-order action explicitly inserts order_number: "" so it
-- always matched and worked, but the public checkout action
-- (app/actions/submit-order.ts) never set order_number at all — it
-- defaulted to NULL, the trigger never ran, and the orders.order_number
-- NOT NULL constraint rejected every public checkout submission.
--
-- Fixed on both sides: the trigger now also matches NULL, and
-- submit-order.ts explicitly inserts order_number: "" to match the
-- already-working admin pattern.

DROP TRIGGER IF EXISTS trg_orders_order_number ON orders;
CREATE TRIGGER trg_orders_order_number
  BEFORE INSERT ON orders
  FOR EACH ROW
  WHEN (NEW.order_number IS NULL OR NEW.order_number = '')
  EXECUTE FUNCTION generate_order_number();
