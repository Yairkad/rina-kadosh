import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil } from "lucide-react";
import DeleteGalleryItemButton from "@/components/admin/DeleteGalleryItemButton";

export default async function GalleryPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("gallery_items")
    .select("id, title_he, title_en, images, active, event_type_id, event_types(name_he)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">גלריה</h1>
          <p className="text-stone-500 text-sm mt-0.5">{items?.length ?? 0} פריטים</p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="flex items-center gap-2 text-sm bg-stone-800 hover:bg-stone-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus size={16} />
          פריט חדש
        </Link>
      </div>

      {!items || items.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 py-16 text-center">
          <p className="text-stone-400 text-sm mb-4">אין פריטים בגלריה</p>
          <Link href="/admin/gallery/new" className="text-sm text-stone-600 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors">
            הוסף פריט ראשון
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => {
            const thumbnail = item.images?.[0];
            const eventType = (item as unknown as { event_types: { name_he: string } | null }).event_types;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden group">
                <div className="aspect-square bg-stone-100 relative">
                  {thumbnail ? (
                    <img src={thumbnail} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">אין תמונה</div>
                  )}
                  {!item.active && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="text-white text-xs font-medium bg-black/60 px-2 py-1 rounded">מוסתר</span>
                    </div>
                  )}
                </div>
                <div className="p-3">
                  <div className="font-medium text-stone-800 text-sm truncate">
                    {item.title_he || "ללא כותרת"}
                  </div>
                  {eventType && (
                    <div className="text-xs text-stone-400 mt-0.5">{eventType.name_he}</div>
                  )}
                  <div className="text-xs text-stone-400 mt-0.5">{item.images?.length ?? 0} תמונות</div>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href={`/admin/gallery/${item.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 text-xs text-stone-600 border border-stone-200 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                    >
                      <Pencil size={12} />
                      עריכה
                    </Link>
                    <DeleteGalleryItemButton itemId={item.id} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
