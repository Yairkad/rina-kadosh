"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type ManualOrderItem = {
  id: string;
  name_he: string;
  quantity: number;
  price_per_unit: number;
  is_bundle: boolean;
};

export type ManualOrderData = {
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  delivery_method: "pickup" | "delivery";
  delivery_address?: string;
  delivery_notes?: string;
  logo_url?: string;
  special_requests?: string;
  admin_notes?: string;
  items: ManualOrderItem[];
  total_amount: number;
};

export async function createManualOrder(data: ManualOrderData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) return { error: "Forbidden" };

  const { error, data: created } = await supabase
    .from("orders")
    .insert({
      ...data,
      order_number: "",
      status: "confirmed",
      delivery_address: data.delivery_address || null,
      delivery_notes: data.delivery_notes || null,
      logo_url: data.logo_url || null,
      special_requests: data.special_requests || null,
      admin_notes: data.admin_notes || null,
    })
    .select("id, order_number")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");
  return { success: true, id: created.id, order_number: created.order_number };
}
