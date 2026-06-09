import { createClient } from "@/lib/supabase/server";
import CatalogManager from "@/components/admin/CatalogManager";

export default async function CatalogPage() {
  const supabase = await createClient();

  const [{ data: eventTypes }, { data: styles }, { data: products }] = await Promise.all([
    supabase
      .from("event_types")
      .select("id, name_he, name_en, slug, display_order, status, atmosphere_image")
      .neq("status", "archived")
      .order("display_order"),
    supabase
      .from("design_styles")
      .select("id, event_type_id, name_he, name_en, slug, display_order, status, atmosphere_image")
      .neq("status", "archived")
      .order("display_order"),
    supabase
      .from("products")
      .select("id, name_he, status, design_style_id, event_type_id")
      .is("deleted_at", null)
      .order("name_he"),
  ]);

  return (
    <div className="p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">קטלוג</h1>
        <p className="text-stone-500 text-sm mt-0.5">ניהול סוגי אירועים, סגנונות ומוצרים</p>
      </div>

      <CatalogManager
        initialEventTypes={eventTypes ?? []}
        initialStyles={styles ?? []}
        initialProducts={products ?? []}
      />
    </div>
  );
}
