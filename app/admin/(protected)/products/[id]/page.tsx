import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ProductForm from "@/components/admin/ProductForm";
import ArchiveProductButton from "@/components/admin/ArchiveProductButton";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: product }, { data: eventTypes }, { data: styles }, { data: materials }, { data: bomRows }] =
    await Promise.all([
      supabase.from("products").select("*").eq("id", id).is("deleted_at", null).single(),
      supabase.from("event_types").select("id, name_he, name_en").neq("status", "archived").order("display_order"),
      supabase.from("design_styles").select("id, event_type_id, name_he, name_en").neq("status", "archived").order("display_order"),
      supabase.from("raw_materials").select("id, name_he, unit").order("name_he"),
      supabase.from("product_materials").select("material_id, quantity_per_unit").eq("product_id", id),
    ]);

  if (!product) notFound();

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-stone-800">{product.name_he}</h1>
        {product.status !== "archived" && (
          <ArchiveProductButton productId={product.id} />
        )}
      </div>
      <ProductForm
        eventTypes={eventTypes ?? []}
        styles={styles ?? []}
        materials={materials ?? []}
        initialBOM={bomRows ?? []}
        mode="edit"
        initial={{
          id: product.id,
          name_he: product.name_he,
          name_en: product.name_en,
          description_he: product.description_he ?? "",
          description_en: product.description_en ?? "",
          price_per_unit: product.price_per_unit,
          cost_price: product.cost_price,
          min_type: product.min_type ?? "units",
          min_value: product.min_value ?? 1,
          event_type_id: product.event_type_id,
          design_style_id: product.design_style_id,
          images: product.images ?? [],
          status: product.status,
        }}
      />
    </div>
  );
}
