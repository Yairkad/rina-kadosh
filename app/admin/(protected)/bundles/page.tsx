import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil } from "lucide-react";

type BundleStatus = "draft" | "published" | "archived";
const STATUS_COLORS: Record<BundleStatus, string> = {
  draft: "bg-stone-100 text-stone-500",
  published: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-600",
};
const STATUS_LABELS: Record<BundleStatus, string> = {
  draft: "טיוטה", published: "פעיל", archived: "ארכיון",
};

const TABS = [
  { label: "הכל", value: "all" },
  { label: "פעילות", value: "published" },
  { label: "טיוטות", value: "draft" },
  { label: "ארכיון", value: "archived" },
];

export default async function BundlesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status && status !== "all" ? status : null;

  const supabase = await createClient();
  let query = supabase
    .from("bundles")
    .select("id, name_he, name_en, bundle_price, original_price, items, status, images")
    .order("created_at", { ascending: false });

  if (activeStatus) query = query.eq("status", activeStatus);

  const { data: bundles } = await query;

  return (
    <div className="p-8" dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">חבילות</h1>
          <p className="text-stone-500 text-sm mt-0.5">{bundles?.length ?? 0} חבילות</p>
        </div>
        <Link href="/admin/bundles/new"
          className="flex items-center gap-2 text-sm bg-stone-800 hover:bg-stone-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors">
          <Plus size={16} />חבילה חדשה
        </Link>
      </div>

      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        {TABS.map(({ label, value }) => {
          const isActive = (!status && value === "all") || status === value;
          return (
            <Link key={value} href={value === "all" ? "/admin/bundles" : `/admin/bundles?status=${value}`}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${isActive ? "bg-white text-stone-800 shadow-sm" : "text-stone-500 hover:text-stone-800"}`}>
              {label}
            </Link>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {!bundles || bundles.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-stone-400 text-sm mb-4">אין חבילות</p>
            <Link href="/admin/bundles/new" className="text-sm text-stone-600 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors">הוסף חבילה</Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">שם</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">מחיר חבילה</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 hidden md:table-cell">מחיר מלא</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 hidden md:table-cell">פריטים</th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">סטטוס</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {bundles.map((bundle) => {
                  const items = Array.isArray(bundle.items) ? bundle.items : [];
                  const discount = bundle.original_price
                    ? Math.round((1 - bundle.bundle_price / bundle.original_price) * 100)
                    : null;
                  return (
                    <tr key={bundle.id} className="hover:bg-stone-50/80 transition-colors group">
                      <td className="px-5 py-3">
                        <div className="font-medium text-stone-800">{bundle.name_he}</div>
                        <div className="text-xs text-stone-400">{bundle.name_en}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-bold text-stone-800">₪{Number(bundle.bundle_price).toLocaleString("he-IL")}</div>
                        {discount && <div className="text-xs text-green-600">חיסכון {discount}%</div>}
                      </td>
                      <td className="px-5 py-3 text-stone-500 hidden md:table-cell">
                        {bundle.original_price ? `₪${Number(bundle.original_price).toLocaleString("he-IL")}` : "—"}
                      </td>
                      <td className="px-5 py-3 text-stone-500 text-xs hidden md:table-cell">{items.length} מוצרים</td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[bundle.status as BundleStatus] ?? "bg-stone-100 text-stone-600"}`}>
                          {STATUS_LABELS[bundle.status as BundleStatus] ?? bundle.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link href={`/admin/bundles/${bundle.id}`}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 opacity-0 group-hover:opacity-100 transition-all inline-flex">
                          <Pencil size={14} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
