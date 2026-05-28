import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import GalleryItemForm from "@/components/admin/GalleryItemForm";

export default async function EditGalleryItemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: item }, { data: eventTypes }] = await Promise.all([
    supabase.from("gallery_items").select("*").eq("id", id).single(),
    supabase.from("event_types").select("id, name_he").neq("status", "archived").order("display_order"),
  ]);

  if (!item) notFound();

  return (
    <div className="p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">עריכת פריט גלריה</h1>
      <GalleryItemForm
        eventTypes={eventTypes ?? []}
        mode="edit"
        initial={{
          id: item.id,
          title_he: item.title_he ?? "",
          title_en: item.title_en ?? "",
          images: item.images ?? [],
          event_type_id: item.event_type_id,
          active: item.active,
        }}
      />
    </div>
  );
}
