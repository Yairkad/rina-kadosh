"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getAdminClient() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return null;
  return supabase;
}

export type BundleItem = {
  product_id: string;
  name_he: string;
  quantity: number;
  price_per_unit: number;
};

export type BundleFormData = {
  name_he: string;
  name_en: string;
  description_he?: string;
  description_en?: string;
  items: BundleItem[];
  bundle_price: number;
  original_price?: number | null;
  event_type_id?: string | null;
  design_style_id?: string | null;
  images?: string[];
  status: "draft" | "published" | "archived";
};

export async function createBundle(data: BundleFormData) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error, data: created } = await supabase
    .from("bundles")
    .insert({
      ...data,
      event_type_id: data.event_type_id || null,
      design_style_id: data.design_style_id || null,
      original_price: data.original_price || null,
      images: data.images ?? [],
    })
    .select("id").single();

  if (error) return { error: error.message };

  revalidatePath("/admin/bundles");
  return { success: true, id: created.id };
}

export async function updateBundle(id: string, data: Partial<BundleFormData>) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase.from("bundles").update({
    ...data,
    event_type_id: data.event_type_id || null,
    design_style_id: data.design_style_id || null,
    original_price: data.original_price || null,
  }).eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/bundles");
  revalidatePath(`/admin/bundles/${id}`);
  return { success: true };
}

export async function archiveBundle(id: string) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("bundles").update({ status: "archived" }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/bundles");
  return { success: true };
}
