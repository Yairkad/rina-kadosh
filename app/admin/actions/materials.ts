"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return null;
  return supabase;
}

export async function createMaterial(data: {
  name_he: string; unit: string; stock_quantity: number;
  low_stock_threshold: number; cost_per_unit: number; supplier_notes?: string;
}) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };
  const { error } = await supabase.from("raw_materials").insert(data);
  if (error) return { error: error.message };
  revalidatePath("/admin/materials");
  return { success: true };
}

export async function updateMaterial(id: string, data: {
  name_he?: string; unit?: string; stock_quantity?: number;
  low_stock_threshold?: number; cost_per_unit?: number; supplier_notes?: string;
}) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };
  const { error } = await supabase.from("raw_materials").update(data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/materials");
  revalidatePath("/admin/dashboard");
  return { success: true };
}

export async function deleteMaterial(id: string) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };
  const { error } = await supabase.from("raw_materials").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/materials");
  return { success: true };
}

export async function addStockQuantity(id: string, amount: number) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };
  const { data: mat } = await supabase.from("raw_materials").select("stock_quantity").eq("id", id).single();
  if (!mat) return { error: "Not found" };
  const { error } = await supabase.from("raw_materials")
    .update({ stock_quantity: Number(mat.stock_quantity) + amount })
    .eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/materials");
  return { success: true };
}

// BOM
export async function saveBOM(productId: string, items: { material_id: string; quantity_per_unit: number }[]) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };
  // replace all BOM rows for this product
  await supabase.from("product_materials").delete().eq("product_id", productId);
  if (items.length > 0) {
    const { error } = await supabase.from("product_materials").insert(
      items.map((i) => ({ product_id: productId, material_id: i.material_id, quantity_per_unit: i.quantity_per_unit }))
    );
    if (error) return { error: error.message };
  }
  revalidatePath("/admin/products");
  revalidatePath("/admin/materials");
  return { success: true };
}

// Deduct materials for an order (called when status → in_production)
export async function deductMaterialsForOrder(orderId: string) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { data: order } = await supabase
    .from("orders")
    .select("items")
    .eq("id", orderId)
    .single();

  if (!order) return { error: "Order not found" };

  const orderItems = order.items as { product_id?: string; quantity: number; is_bundle: boolean }[];
  const productIds = orderItems.filter((i) => !i.is_bundle && i.product_id).map((i) => i.product_id!);

  if (productIds.length === 0) return { success: true };

  const { data: bom } = await supabase
    .from("product_materials")
    .select("product_id, material_id, quantity_per_unit")
    .in("product_id", productIds);

  if (!bom || bom.length === 0) return { success: true };

  // Aggregate deductions per material
  const deductions = new Map<string, number>();
  for (const item of orderItems) {
    if (!item.product_id || item.is_bundle) continue;
    const productBOM = bom.filter((b) => b.product_id === item.product_id);
    for (const b of productBOM) {
      const prev = deductions.get(b.material_id) ?? 0;
      deductions.set(b.material_id, prev + Number(b.quantity_per_unit) * item.quantity);
    }
  }

  // Apply deductions
  for (const [materialId, amount] of Array.from(deductions)) {
    const { data: mat } = await supabase.from("raw_materials").select("stock_quantity").eq("id", materialId).single();
    if (!mat) continue;
    await supabase.from("raw_materials")
      .update({ stock_quantity: Math.max(0, Number(mat.stock_quantity) - amount) })
      .eq("id", materialId);
  }

  revalidatePath("/admin/materials");
  revalidatePath("/admin/dashboard");
  return { success: true };
}
