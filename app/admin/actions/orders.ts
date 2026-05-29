"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { deductMaterialsForOrder } from "@/app/admin/actions/materials";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "ready"
  | "delivered"
  | "cancelled";

export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  adminNotes?: string
) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, id")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Forbidden" };

  const { data: current } = await supabase
    .from("orders")
    .select("status")
    .eq("id", orderId)
    .single();

  const updatePayload: Record<string, unknown> = { status: newStatus };
  if (adminNotes !== undefined) updatePayload.admin_notes = adminNotes;

  const { error } = await supabase
    .from("orders")
    .update(updatePayload)
    .eq("id", orderId);

  if (error) return { error: error.message };

  await supabase.from("audit_logs").insert({
    entity_type: "order",
    entity_id: orderId,
    action: "status_change",
    old_data: { status: current?.status },
    new_data: { status: newStatus },
    created_by: profile.id,
  });

  // Deduct raw materials when entering production
  if (newStatus === "in_production" && current?.status !== "in_production") {
    await deductMaterialsForOrder(orderId);
  }

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/dashboard");

  return { success: true };
}

export async function updateOrderNotes(orderId: string, adminNotes: string) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) return { error: "Forbidden" };

  const { error } = await supabase
    .from("orders")
    .update({ admin_notes: adminNotes })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { success: true };
}
