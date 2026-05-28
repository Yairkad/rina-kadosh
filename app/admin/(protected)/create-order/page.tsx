import { createClient } from "@/lib/supabase/server";
import CreateOrderForm from "@/components/admin/CreateOrderForm";

export default async function CreateOrderPage() {
  const supabase = await createClient();

  const { data: products } = await supabase
    .from("products")
    .select("id, name_he, name_en, price_per_unit, min_type, min_value, status")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("name_he");

  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-2">הזמנה ידנית</h1>
      <p className="text-stone-500 text-sm mb-8">יצירת הזמנה ישירות מהמנהל — תיכנס אוטומטית כ״אושרה״</p>
      <CreateOrderForm products={products ?? []} />
    </div>
  );
}
