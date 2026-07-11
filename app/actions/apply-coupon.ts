"use server";

import { createClient } from "@/lib/supabase/server";

export type ApplyCouponResult =
  | { valid: true; discount_type: "percent" | "amount"; discount_value: number }
  | { valid: false; error: string };

export async function applyCoupon(code: string): Promise<ApplyCouponResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .rpc("validate_coupon", { p_code: code })
    .single<{ valid: boolean; discount_type: "percent" | "amount" | null; discount_value: number | null; error: string | null }>();

  if (error || !data || !data.valid || !data.discount_type || data.discount_value === null) {
    return { valid: false, error: data?.error || error?.message || "invalid" };
  }

  return { valid: true, discount_type: data.discount_type, discount_value: data.discount_value };
}
