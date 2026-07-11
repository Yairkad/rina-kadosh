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

export type CouponData = {
  code: string;
  discount_type: "percent" | "amount";
  discount_value: number;
  max_uses: number | null;
  valid_from: string | null;
  valid_until: string | null;
  active: boolean;
};

export async function createCoupon(data: CouponData) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };
  const { error } = await supabase.from("coupons").insert({ ...data, code: data.code.trim().toUpperCase() });
  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function updateCoupon(id: string, data: Partial<CouponData>) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };
  const payload = { ...data, ...(data.code ? { code: data.code.trim().toUpperCase() } : {}) };
  const { error } = await supabase.from("coupons").update(payload).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}

export async function deleteCoupon(id: string) {
  const supabase = await getAdminClient();
  if (!supabase) return { error: "Unauthorized" };
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/coupons");
  return { success: true };
}
