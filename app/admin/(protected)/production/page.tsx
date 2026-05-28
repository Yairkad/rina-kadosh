import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import ProductionStatusButton from "@/components/admin/ProductionStatusButton";

type OrderStatus = "confirmed" | "in_production" | "ready";

const COLUMNS: { status: OrderStatus; label: string; color: string; bg: string; next: OrderStatus | null; nextLabel: string | null }[] = [
  { status: "confirmed",     label: "אושרו",       color: "text-blue-700",   bg: "bg-blue-50",   next: "in_production", nextLabel: "העבר לייצור" },
  { status: "in_production", label: "בייצור",      color: "text-purple-700", bg: "bg-purple-50", next: "ready",         nextLabel: "סמן כמוכן" },
  { status: "ready",         label: "מוכנות",      color: "text-green-700",  bg: "bg-green-50",  next: null,            nextLabel: null },
];

export default async function ProductionPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, customer_name, customer_phone, total_amount, status, delivery_method, created_at, admin_notes")
    .in("status", ["confirmed", "in_production", "ready"])
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  const byStatus = (status: OrderStatus) =>
    orders?.filter((o) => o.status === status) ?? [];

  return (
    <div className="p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">תור ייצור</h1>
        <p className="text-stone-500 text-sm mt-0.5">
          {orders?.length ?? 0} הזמנות בתהליך
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {COLUMNS.map(({ status, label, color, bg, next, nextLabel }) => {
          const columnOrders = byStatus(status);
          return (
            <div key={status} className="space-y-3">
              <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl ${bg}`}>
                <span className={`font-semibold text-sm ${color}`}>{label}</span>
                <span className={`text-xs font-bold ${color} opacity-60`}>
                  ({columnOrders.length})
                </span>
              </div>

              {columnOrders.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-stone-200 py-8 text-center text-stone-300 text-sm">
                  אין הזמנות
                </div>
              ) : (
                columnOrders.map((order) => (
                  <div key={order.id} className="bg-white rounded-2xl border border-stone-200 p-4 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-mono text-sm font-semibold text-stone-700">
                          {order.order_number}
                        </div>
                        <div className="font-medium text-stone-800 mt-0.5">
                          {order.customer_name}
                        </div>
                        <div className="text-xs text-stone-400">{order.customer_phone}</div>
                      </div>
                      <div className="text-left">
                        {order.total_amount && (
                          <div className="font-bold text-stone-800 text-sm">
                            ₪{Number(order.total_amount).toLocaleString("he-IL")}
                          </div>
                        )}
                        <div className="text-xs text-stone-400 mt-0.5">
                          {order.delivery_method === "delivery" ? "משלוח" : "איסוף"}
                        </div>
                      </div>
                    </div>

                    {order.admin_notes && (
                      <p className="text-xs text-stone-500 bg-stone-50 rounded-lg px-3 py-2">
                        {order.admin_notes}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="flex-1 text-center text-xs text-stone-500 border border-stone-200 py-1.5 rounded-lg hover:bg-stone-50 transition-colors"
                      >
                        פרטים
                      </Link>
                      {next && nextLabel && (
                        <ProductionStatusButton
                          orderId={order.id}
                          newStatus={next}
                          label={nextLabel}
                        />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
