import { createClient } from "@/lib/supabase/server";
import GalleryItemForm from "@/components/admin/GalleryItemForm";

export default async function NewGalleryItemPage() {
  const supabase = await createClient();
  const { data: eventTypes } = await supabase
    .from("event_types")
    .select("id, name_he")
    .eq("status", "published")
    .order("display_order");

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">פריט גלריה חדש</h1>
      <GalleryItemForm mode="new" eventTypes={eventTypes ?? []} />
    </div>
  );
}
