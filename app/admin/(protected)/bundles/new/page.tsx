import { createClient } from "@/lib/supabase/server";
import BundleForm from "@/components/admin/BundleForm";

export default async function NewBundlePage() {
  const supabase = await createClient();
  const [{ data: products }, { data: eventTypes }, { data: styles }] = await Promise.all([
    supabase.from("products").select("id, name_he, price_per_unit").eq("status", "published").is("deleted_at", null).order("name_he"),
    supabase.from("event_types").select("id, name_he, name_en").eq("status", "published").order("display_order"),
    supabase.from("design_styles").select("id, event_type_id, name_he").eq("status", "published").order("display_order"),
  ]);

  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">חבילה חדשה</h1>
      <BundleForm products={products ?? []} eventTypes={eventTypes ?? []} styles={styles ?? []} mode="new" />
    </div>
  );
}
