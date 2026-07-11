import { createClient } from "@/lib/supabase/server";
import CouponsManager from "@/components/admin/CouponsManager";

export default async function CouponsPage() {
  const supabase = await createClient();

  const { data: coupons } = await supabase
    .from("coupons")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">קופונים</h1>
        <p className="text-stone-500 text-sm mt-0.5">קודי הנחה לתהליך ההזמנה — כמות שימושים ותוקף תאריכים</p>
      </div>
      <CouponsManager coupons={coupons ?? []} />
    </div>
  );
}
