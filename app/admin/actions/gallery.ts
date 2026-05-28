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

export type GalleryFormData = {
  title_he?: string;
  title_en?: string;
  images: string[];
  event_type_id?: string | null;
  active: boolean;
};

export async function createGalleryItem(data: GalleryFormData) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase.from("gallery_items").insert({
    ...data,
    event_type_id: data.event_type_id || null,
  });
  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function updateGalleryItem(id: string, data: Partial<GalleryFormData>) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase.from("gallery_items").update({
    ...data,
    event_type_id: data.event_type_id || null,
  }).eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  return { success: true };
}

export async function deleteGalleryItem(id: string) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };

  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/gallery");
  return { success: true };
}
