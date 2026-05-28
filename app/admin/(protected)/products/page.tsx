import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Plus, Pencil } from "lucide-react";

type ProductStatus = "draft" | "published" | "archived";

const STATUS_LABELS: Record<ProductStatus, string> = {
  draft: "טיוטה",
  published: "פעיל",
  archived: "ארכיון",
};

const STATUS_COLORS: Record<ProductStatus, string> = {
  draft: "bg-stone-100 text-stone-500",
  published: "bg-green-100 text-green-700",
  archived: "bg-red-100 text-red-600",
};

const TABS = [
  { label: "הכל", value: "all" },
  { label: "פעילים", value: "published" },
  { label: "טיוטות", value: "draft" },
  { label: "ארכיון", value: "archived" },
];

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status && status !== "all" ? status : null;

  const supabase = await createClient();

  let query = supabase
    .from("products")
    .select(
      `id, name_he, name_en, price_per_unit, min_type, min_value, images, status,
       event_types(name_he),
       design_styles(name_he)`
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (activeStatus) {
    query = query.eq("status", activeStatus);
  }

  const { data: products } = await query;

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">מוצרים</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {products?.length ?? 0} מוצרים
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 text-sm bg-stone-800 hover:bg-stone-700 text-white px-4 py-2.5 rounded-xl font-medium transition-colors"
        >
          <Plus size={16} />
          מוצר חדש
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        {TABS.map(({ label, value }) => {
          const isActive = (!status && value === "all") || status === value;
          const href =
            value === "all" ? "/admin/products" : `/admin/products?status=${value}`;
          return (
            <Link
              key={value}
              href={href}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? "bg-white text-stone-800 shadow-sm"
                  : "text-stone-500 hover:text-stone-800"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        {!products || products.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-stone-400 text-sm mb-4">אין מוצרים</p>
            <Link
              href="/admin/products/new"
              className="text-sm text-stone-600 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors"
            >
              הוסף מוצר ראשון
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">
                    תמונה
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">
                    שם
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">
                    מחיר
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 hidden md:table-cell">
                    מינימום
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 hidden lg:table-cell">
                    קטגוריה
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">
                    סטטוס
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {products.map((product) => {
                  const thumbnail = product.images?.[0];
                  const eventType = (product as any).event_types as { name_he: string } | null;
                  const designStyle = (product as any).design_styles as { name_he: string } | null;

                  return (
                    <tr key={product.id} className="hover:bg-stone-50/80 transition-colors group">
                      <td className="px-5 py-3">
                        {thumbnail ? (
                          <img
                            src={thumbnail}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover bg-stone-100"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-stone-100" />
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="font-medium text-stone-800">{product.name_he}</div>
                        <div className="text-xs text-stone-400">{product.name_en}</div>
                      </td>
                      <td className="px-5 py-3 font-medium text-stone-800">
                        ₪{Number(product.price_per_unit).toLocaleString("he-IL")}
                      </td>
                      <td className="px-5 py-3 text-stone-500 text-xs hidden md:table-cell">
                        {product.min_type === "units"
                          ? `${product.min_value} יח'`
                          : `₪${product.min_value}`}
                      </td>
                      <td className="px-5 py-3 text-stone-500 text-xs hidden lg:table-cell">
                        {eventType?.name_he ?? "—"}
                        {designStyle && (
                          <span className="text-stone-300"> / {designStyle.name_he}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                            STATUS_COLORS[product.status as ProductStatus] ??
                            "bg-stone-100 text-stone-600"
                          }`}
                        >
                          {STATUS_LABELS[product.status as ProductStatus] ?? product.status}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/admin/products/${product.id}`}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-200 opacity-0 group-hover:opacity-100 transition-all inline-flex"
                        >
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
