"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ItemStatus = "draft" | "published" | "archived";

async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  if (!profile?.is_admin) return null;
  return supabase;
}

function toSlug(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9֐-׿\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// ─── Event Types ────────────────────────────────────────────────

export async function createEventType(data: {
  name_he: string; name_en: string; display_order: number; status: ItemStatus; image?: string | null;
}) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const slug = toSlug(data.name_en);
  const { error } = await supabase.from("event_types").insert({ ...data, slug });
  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  return { success: true };
}

export async function updateEventType(
  id: string,
  data: { name_he?: string; name_en?: string; display_order?: number; status?: ItemStatus; image?: string | null; }
) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const update: Record<string, unknown> = { ...data };
  if (data.name_en) update.slug = toSlug(data.name_en);

  const { error } = await supabase.from("event_types").update(update).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  return { success: true };
}

export async function deleteEventType(id: string) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("event_types")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  return { success: true };
}

// ─── Design Styles ───────────────────────────────────────────────

export async function createDesignStyle(data: {
  event_type_id: string;
  name_he: string;
  name_en: string;
  display_order: number;
  status: ItemStatus;
}) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const slug = toSlug(data.name_en);
  const { error } = await supabase.from("design_styles").insert({ ...data, slug });
  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  return { success: true };
}

export async function updateDesignStyle(
  id: string,
  data: {
    name_he?: string;
    name_en?: string;
    display_order?: number;
    status?: ItemStatus;
  }
) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const update: Record<string, unknown> = { ...data };
  if (data.name_en) update.slug = toSlug(data.name_en);

  const { error } = await supabase.from("design_styles").update(update).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  return { success: true };
}

export async function quickCreateProduct(data: {
  name_he: string;
  name_en: string;
  price_per_unit: number;
  event_type_id: string;
  design_style_id: string;
}) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase.from("products").insert({
    ...data,
    status: "draft",
    min_type: "units",
    min_value: 1,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  revalidatePath("/admin/products");
  return { success: true };
}

export async function deleteDesignStyle(id: string) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("design_styles")
    .update({ status: "archived" })
    .eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/catalog");
  return { success: true };
}
