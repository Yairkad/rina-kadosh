import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Download } from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "ready"
  | "delivered"
  | "cancelled";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "ממתינה",
  confirmed: "אושרה",
  in_production: "בייצור",
  ready: "מוכנה",
  delivered: "נמסרה",
  cancelled: "בוטלה",
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_production: "bg-purple-100 text-purple-800",
  ready: "bg-green-100 text-green-800",
  delivered: "bg-stone-100 text-stone-500",
  cancelled: "bg-red-100 text-red-700",
};

const TABS: { label: string; value: string }[] = [
  { label: "הכל", value: "all" },
  { label: "ממתינות", value: "pending" },
  { label: "אושרו", value: "confirmed" },
  { label: "בייצור", value: "in_production" },
  { label: "מוכנות", value: "ready" },
  { label: "נמסרו", value: "delivered" },
  { label: "בוטלו", value: "cancelled" },
];

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const activeStatus = status && status !== "all" ? status : null;

  const supabase = await createClient();

  let query = supabase
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_phone, customer_email, total_amount, status, delivery_method, created_at"
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (activeStatus) {
    query = query.eq("status", activeStatus);
  }

  const { data: orders } = await query;

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-stone-800">הזמנות</h1>
          <p className="text-stone-500 text-sm mt-0.5">
            {orders?.length ?? 0} הזמנות
          </p>
        </div>
        <a
          href={`/admin/orders/export${activeStatus ? `?status=${activeStatus}` : ""}`}
          className="flex items-center gap-2 text-sm text-stone-600 hover:text-stone-900 border border-stone-300 rounded-lg px-4 py-2 transition-colors hover:bg-stone-50"
        >
          <Download size={15} />
          ייצוא CSV
        </a>
      </div>

      {/* Status Tabs */}
      <div className="flex gap-1 mb-6 bg-stone-100 p-1 rounded-xl w-fit">
        {TABS.map(({ label, value }) => {
          const isActive =
            (!status && value === "all") ||
            status === value ||
            (!status && value === "all");
          const href =
            value === "all" ? "/admin/orders" : `/admin/orders?status=${value}`;
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
        {!orders || orders.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-sm">
            אין הזמנות{activeStatus ? ` בסטטוס "${STATUS_LABELS[activeStatus as OrderStatus]}"` : ""}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">
                    מספר הזמנה
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">
                    לקוחה
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 hidden md:table-cell">
                    טלפון
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">
                    סכום
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 hidden sm:table-cell">
                    משלוח
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500">
                    סטטוס
                  </th>
                  <th className="text-right px-5 py-3 text-xs font-medium text-stone-500 hidden md:table-cell">
                    תאריך
                  </th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-stone-50/80 transition-colors group"
                  >
                    <td className="px-5 py-3.5 font-mono text-sm font-medium text-stone-700">
                      {order.order_number}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-stone-800">
                        {order.customer_name}
                      </div>
                      <div className="text-xs text-stone-400">
                        {order.customer_email}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-stone-600 hidden md:table-cell">
                      {order.customer_phone}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-stone-800">
                      {order.total_amount
                        ? `₪${Number(order.total_amount).toLocaleString("he-IL")}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-stone-500 hidden sm:table-cell text-xs">
                      {order.delivery_method === "delivery" ? "משלוח" : "איסוף"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                          STATUS_COLORS[order.status as OrderStatus] ??
                          "bg-stone-100 text-stone-600"
                        }`}
                      >
                        {STATUS_LABELS[order.status as OrderStatus] ??
                          order.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-stone-400 text-xs hidden md:table-cell">
                      {new Date(order.created_at).toLocaleDateString("he-IL")}
                    </td>
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="text-xs text-stone-400 hover:text-stone-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        פרטים ←
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
