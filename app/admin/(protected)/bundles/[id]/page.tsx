import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BundleForm from "@/components/admin/BundleForm";
import ArchiveBundleButton from "@/components/admin/ArchiveBundleButton";
import { type BundleItem } from "@/app/admin/actions/bundles";

export default async function EditBundlePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: bundle }, { data: products }, { data: eventTypes }, { data: styles }] = await Promise.all([
    supabase.from("bundles").select("*").eq("id", id).single(),
    supabase.from("products").select("id, name_he, price_per_unit").neq("status", "archived").is("deleted_at", null).order("name_he"),
    supabase.from("event_types").select("id, name_he, name_en").neq("status", "archived").order("display_order"),
    supabase.from("design_styles").select("id, event_type_id, name_he").neq("status", "archived").order("display_order"),
  ]);

  if (!bundle) notFound();

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-800">{bundle.name_he}</h1>
        {bundle.status !== "archived" && <ArchiveBundleButton bundleId={bundle.id} />}
      </div>
      <BundleForm
        products={products ?? []}
        eventTypes={eventTypes ?? []}
        styles={styles ?? []}
        mode="edit"
        initial={{
          id: bundle.id,
          name_he: bundle.name_he,
          name_en: bundle.name_en,
          description_he: bundle.description_he ?? "",
          description_en: bundle.description_en ?? "",
          items: (bundle.items as BundleItem[]) ?? [],
          bundle_price: bundle.bundle_price,
          original_price: bundle.original_price,
          event_type_id: bundle.event_type_id,
          design_style_id: bundle.design_style_id,
          images: bundle.images ?? [],
          status: bundle.status,
        }}
      />
    </div>
  );
}
