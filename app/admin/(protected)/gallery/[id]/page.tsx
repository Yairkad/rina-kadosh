import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GalleryItemForm from "@/components/admin/GalleryItemForm";

export default async function EditGalleryItemPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();

  const [{ data: item }, { data: eventTypes }] = await Promise.all([
    supabase.from("gallery_items").select("*").eq("id", params.id).single(),
    supabase.from("event_types").select("id, name_he").eq("status", "published").order("display_order"),
  ]);

  if (!item) notFound();

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">עריכת פריט גלריה</h1>
      <GalleryItemForm
        mode="edit"
        id={item.id}
        initial={{
          title_he: item.title_he ?? "",
          title_en: item.title_en ?? "",
          images: item.images ?? [],
          event_type_id: item.event_type_id ?? null,
          active: item.active ?? true,
        }}
        eventTypes={eventTypes ?? []}
      />
    </div>
  );
}
