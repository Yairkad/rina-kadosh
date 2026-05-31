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

  const { data: created, error } = await supabase
    .from("orders")
    .insert({
      customer_name:    input.customer_name.trim(),
      customer_phone:   input.customer_phone.trim(),
      customer_email:   input.customer_email.trim().toLowerCase(),
      delivery_method:  input.delivery_method,
      delivery_address: input.delivery_address || null,
      delivery_notes:   input.delivery_notes   || null,
      logo_url:         input.logo_url         || null,
      special_requests: input.special_requests || null,
      items:            orderItems,
      total_amount:     totalAmount,
      status:           "pending",
    })
    .select("order_number")
    .single();

  if (error) return { error: error.message };

  return { order_number: created.order_number };
}
