"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ProductStatus = "draft" | "published" | "archived";

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

export type ProductFormData = {
  name_he: string;
  name_en: string;
  description_he?: string;
  description_en?: string;
  price_per_unit: number;
  cost_price?: number | null;
  min_type: "units" | "amount";
  min_value: number;
  event_type_id?: string | null;
  design_style_id?: string | null;
  images?: string[];
  status: ProductStatus;
};

export async function createProduct(data: ProductFormData) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error, data: created } = await supabase
    .from("products")
    .insert({
      ...data,
      event_type_id: data.event_type_id || null,
      design_style_id: data.design_style_id || null,
      cost_price: data.cost_price || null,
      images: data.images ?? [],
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/he/catalog", "layout");
  revalidatePath("/en/catalog", "layout");
  return { success: true, id: created.id };
}

export async function updateProduct(id: string, data: Partial<ProductFormData>) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("products")
    .update({
      ...data,
      event_type_id: data.event_type_id || null,
      design_style_id: data.design_style_id || null,
      cost_price: data.cost_price || null,
    })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  revalidatePath("/he/catalog", "layout");
  revalidatePath("/en/catalog", "layout");
  return { success: true };
}

export async function archiveProduct(id: string) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase
    .from("products")
    .update({ status: "archived" })
    .eq("id", id);

  if (error) return { error: error.message };

  revalidatePath("/admin/products");
  revalidatePath("/he/catalog", "layout");
  revalidatePath("/en/catalog", "layout");
  return { success: true };
}
