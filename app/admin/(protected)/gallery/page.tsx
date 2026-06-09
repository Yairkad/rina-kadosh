import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil } from "lucide-react";
import DeleteGalleryItemButton from "@/components/admin/DeleteGalleryItemButton";

export default async function AdminGalleryPage() {
  const supabase = await createClient();

  const { data: items } = await supabase
    .from("gallery_items")
    .select("id, title_he, images, active, event_type_id, event_types(name_he)")
    .order("created_at", { ascending: false });

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">גלריה</h1>
          <p className="text-sm text-stone-400 mt-0.5">{items?.length ?? 0} פריטים</p>
        </div>
        <Link
          href="/admin/gallery/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-stone-800 text-white text-sm font-medium rounded-xl hover:bg-stone-700 transition-colors active:scale-95"
        >
          <Plus size={15} />
          פריט חדש
        </Link>
      </div>

      {!items?.length ? (
        <div className="text-center py-24 text-stone-400 text-sm">
          אין פריטים עדיין —{" "}
          <Link href="/admin/gallery/new" className="text-stone-600 underline">הוסף ראשון</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map((item) => {
            const eventTypeName = (item as any).event_types?.name_he;
            return (
              <div key={item.id} className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                {/* Thumbnail */}
                <div className="aspect-[4/3] bg-stone-100 relative overflow-hidden">
                  {item.images?.[0] ? (
                    <img
                      src={item.images[0]}
                      alt={item.title_he ?? ""}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-stone-300 text-xs">אין תמונה</div>
                  )}
                  <span className={`absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.active ? "bg-emerald-100 text-emerald-700" : "bg-stone-200 text-stone-500"}`}>
                    {item.active ? "פורסם" : "מוסתר"}
                  </span>
                </div>

                <div className="p-4">
                  <p className="font-semibold text-stone-800 text-sm truncate">{item.title_he || "ללא כותרת"}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center gap-2 text-xs text-stone-400">
                      <span>{item.images?.length ?? 0} תמונות</span>
                      {eventTypeName && (
                        <>
                          <span>·</span>
                          <span>{eventTypeName}</span>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/gallery/${item.id}`}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                      >
                        <Pencil size={13} />
                      </Link>
                      <DeleteGalleryItemButton id={item.id} />
                    </div>
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
