import { createClient } from "@/lib/supabase/server";
import MaterialsManager from "@/components/admin/MaterialsManager";

export default async function MaterialsPage() {
  const supabase = await createClient();

  const [{ data: materials }, { data: products }, { data: bom }] = await Promise.all([
    supabase.from("raw_materials").select("*").order("name_he"),
    supabase.from("products").select("id, name_he").eq("status", "published").is("deleted_at", null).order("name_he"),
    supabase.from("product_materials").select("product_id, material_id, quantity_per_unit"),
  ]);

  // Forecast: pending + confirmed + in_production orders
  const { data: openOrders } = await supabase
    .from("orders")
    .select("items")
    .in("status", ["pending", "confirmed", "in_production"])
    .is("deleted_at", null);

  return (
    <div className="p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">מלאי חומרי גלם</h1>
        <p className="text-stone-500 text-sm mt-0.5">מעקב מלאי, BOM לכל מוצר, תחזית לפי הזמנות פתוחות</p>
      </div>
      <MaterialsManager
        materials={materials ?? []}
        products={products ?? []}
        bom={bom ?? []}
        openOrders={openOrders ?? []}
      />
    </div>
  );
}
