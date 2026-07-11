"use server";

import { createClient } from "@/lib/supabase/server";

export type OrderItemInput = {
  id: string;
  is_bundle: boolean;
  quantity: number;
  custom_text?: string;
  custom_image_url?: string;
};

export type SubmitOrderInput = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_method: "pickup" | "delivery";
  delivery_address?: string;
  delivery_notes?: string;
  logo_url?: string;
  special_requests?: string;
  coupon_code?: string;
  items: OrderItemInput[];
};

export async function submitOrder(input: SubmitOrderInput): Promise<{ order_number: string } | { error: string }> {
  if (!input.items.length) return { error: "no_items" };

  const supabase = await createClient();

  const productIds = input.items.filter((i) => !i.is_bundle).map((i) => i.id);
  const bundleIds  = input.items.filter((i) =>  i.is_bundle).map((i) => i.id);

  const [productsRes, bundlesRes] = await Promise.all([
    productIds.length
      ? supabase.from("products").select("id, name_he, price_per_unit").in("id", productIds).eq("status", "published")
      : Promise.resolve({ data: [] as { id: string; name_he: string; price_per_unit: number }[], error: null }),
    bundleIds.length
      ? supabase.from("bundles").select("id, name_he, bundle_price").in("id", bundleIds).eq("status", "published")
      : Promise.resolve({ data: [] as { id: string; name_he: string; bundle_price: number }[], error: null }),
  ]);

  if (productsRes.error) return { error: productsRes.error.message };
  if (bundlesRes.error)  return { error: bundlesRes.error.message };

  // Build a price + name map from server-authoritative DB values
  const priceMap = new Map<string, { name_he: string; price: number }>();
  for (const p of (productsRes.data ?? [])) {
    priceMap.set(p.id, { name_he: p.name_he, price: Number(p.price_per_unit) });
  }
  for (const b of (bundlesRes.data ?? [])) {
    priceMap.set(b.id, { name_he: b.name_he, price: Number(b.bundle_price) });
  }

  // Validate every item exists and is published; compute total server-side
  const orderItems: { product_id: string; name_he: string; quantity: number; price_per_unit: number; is_bundle: boolean }[] = [];
  let totalAmount = 0;

  for (const item of input.items) {
    const server = priceMap.get(item.id);
    if (!server) return { error: `item_not_found:${item.id}` };
    if (item.quantity <= 0) return { error: "invalid_quantity" };

    const lineTotal = Math.round(server.price * item.quantity * 100) / 100;
    totalAmount += lineTotal;
    orderItems.push({
      product_id: item.id,
      name_he:    server.name_he,
      quantity:   item.quantity,
      price_per_unit: server.price,
      is_bundle:  item.is_bundle,
      ...(item.custom_text      && { custom_text:      item.custom_text }),
      ...(item.custom_image_url && { custom_image_url: item.custom_image_url }),
    });
  }

  totalAmount = Math.round(totalAmount * 100) / 100;

  // Redeem the coupon (if any) server-side and authoritatively — never
  // trust a client-sent discount amount. redeem_coupon() re-validates
  // and atomically increments times_used, so a coupon can't be
  // over-redeemed by two simultaneous checkouts.
  let discountAmount = 0;
  let couponCode: string | undefined;

  if (input.coupon_code) {
    const { data: redeemed, error: redeemError } = await supabase
      .rpc("redeem_coupon", { p_code: input.coupon_code })
      .single<{ success: boolean; discount_type: "percent" | "amount" | null; discount_value: number | null; error: string | null }>();

    if (redeemError || !redeemed || !redeemed.success || !redeemed.discount_type || redeemed.discount_value === null) {
      return { error: "invalid_coupon" };
    }

    const rawDiscount = redeemed.discount_type === "percent"
      ? totalAmount * redeemed.discount_value / 100
      : redeemed.discount_value;
    discountAmount = Math.min(Math.round(rawDiscount * 100) / 100, totalAmount);
    couponCode = input.coupon_code.trim().toUpperCase();
  }

  // Insert via a SECURITY DEFINER function rather than a plain
  // .insert().select() — RLS filters the RETURNING clause through
  // SELECT policies too, and anon has none on `orders` (it holds
  // customer PII), so a direct insert+select silently returns zero
  // rows. The function bypasses RLS and returns only the order number.
  const { data: orderNumber, error } = await supabase.rpc("create_order", {
    p_customer_name:    input.customer_name.trim(),
    p_customer_phone:   input.customer_phone.trim(),
    p_customer_email:   input.customer_email.trim().toLowerCase(),
    p_delivery_method:  input.delivery_method,
    p_delivery_address: input.delivery_address || null,
    p_delivery_notes:   input.delivery_notes   || null,
    p_logo_url:         input.logo_url         || null,
    p_special_requests: input.special_requests || null,
    p_items:            orderItems,
    p_total_amount:     Math.round((totalAmount - discountAmount) * 100) / 100,
    p_coupon_code:      couponCode || null,
    p_discount_amount:  discountAmount,
  });

  if (error || !orderNumber) return { error: error?.message || "insert_failed" };

  return { order_number: orderNumber };
}
