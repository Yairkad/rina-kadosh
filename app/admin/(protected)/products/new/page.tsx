import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const supabase = await createClient();

  const [{ data: eventTypes }, { data: styles }, { data: materials }] = await Promise.all([
    supabase.from("event_types").select("id, name_he, name_en").eq("status", "published").order("display_order"),
    supabase.from("design_styles").select("id, event_type_id, name_he, name_en").eq("status", "published").order("display_order"),
    supabase.from("raw_materials").select("id, name_he, unit").order("name_he"),
  ]);

  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">מוצר חדש</h1>
      <ProductForm
        eventTypes={eventTypes ?? []}
        styles={styles ?? []}
        materials={materials ?? []}
        mode="new"
      />
    </div>
  );
}
