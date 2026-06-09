"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type GalleryFormData = {
  title_he: string;
  title_en: string;
  images: string[];
  event_type_id: string | null;
  active: boolean;
};

export async function createGalleryItem(data: GalleryFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").insert(data);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
  revalidatePath("/he/gallery");
  revalidatePath("/en/gallery");
}

export async function updateGalleryItem(id: string, data: GalleryFormData) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").update(data).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
  revalidatePath("/he/gallery");
  revalidatePath("/en/gallery");
}

export async function deleteGalleryItem(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("gallery_items").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/gallery");
  revalidatePath("/he/gallery");
  revalidatePath("/en/gallery");
}
