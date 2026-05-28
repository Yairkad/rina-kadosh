import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import OrderStatusUpdate from "@/components/admin/OrderStatusUpdate";
import { ArrowRight, Package, Truck, User, Phone, Mail, FileText } from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "ready"
  | "delivered"
  | "cancelled";

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: "ממתינה לאישור",
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

const ORDER_FLOW: OrderStatus[] = [
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "delivered",
];

type CartItem = {
  id: string;
  name_he: string;
  name_en?: string;
  quantity: number;
  price_per_unit: number;
  is_bundle?: boolean;
};

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .single();

  if (!order) notFound();

  const items: CartItem[] = Array.isArray(order.items) ? order.items : [];
  const isCancelled = order.status === "cancelled";
  const flowIndex = ORDER_FLOW.indexOf(order.status as OrderStatus);

  return (
    <div className="p-8 max-w-5xl" dir="rtl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-stone-400 mb-6">
        <Link href="/admin/orders" className="hover:text-stone-700 transition-colors">
          הזמנות
        </Link>
        <ArrowRight size={14} />
        <span className="text-stone-700 font-medium">{order.order_number}</span>
      </div>

      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 font-mono">
            {order.order_number}
          </h1>
          <p className="text-stone-400 text-sm mt-1">
            {new Date(order.created_at).toLocaleDateString("he-IL", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
        <span
          className={`px-3 py-1.5 rounded-full text-sm font-medium ${
            STATUS_COLORS[order.status as OrderStatus] ??
            "bg-stone-100 text-stone-600"
          }`}
        >
          {STATUS_LABELS[order.status as OrderStatus] ?? order.status}
        </span>
      </div>

      {/* Progress Bar */}
      {!isCancelled && (
        <div className="mb-8 bg-white rounded-2xl border border-stone-200 p-5">
          <div className="flex items-center justify-between gap-1">
            {ORDER_FLOW.map((s, i) => (
              <div key={s} className="flex items-center gap-1 flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-colors ${
                      i < flowIndex
                        ? "bg-stone-800 border-stone-800 text-white"
                        : i === flowIndex
                        ? "bg-white border-stone-800 text-stone-800"
                        : "bg-white border-stone-200 text-stone-300"
                    }`}
                  >
                    {i < flowIndex ? "✓" : i + 1}
                  </div>
                  <span
                    className={`text-xs whitespace-nowrap ${
                      i <= flowIndex ? "text-stone-700 font-medium" : "text-stone-300"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </span>
                </div>
                {i < ORDER_FLOW.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mb-5 mx-1 transition-colors ${
                      i < flowIndex ? "bg-stone-800" : "bg-stone-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Order Info */}
        <div className="lg:col-span-2 space-y-5">
          {/* Customer */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-800 mb-4 text-sm">פרטי לקוחה</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <User size={15} className="text-stone-400" />
                <span className="text-stone-700">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Phone size={15} className="text-stone-400" />
                <a
                  href={`tel:${order.customer_phone}`}
                  className="text-stone-700 hover:text-blue-600 transition-colors"
                >
                  {order.customer_phone}
                </a>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Mail size={15} className="text-stone-400" />
                <a
                  href={`mailto:${order.customer_email}`}
                  className="text-stone-700 hover:text-blue-600 transition-colors"
                >
                  {order.customer_email}
                </a>
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5">
            <h2 className="font-semibold text-stone-800 mb-4 text-sm flex items-center gap-2">
              {order.delivery_method === "delivery" ? (
                <><Truck size={15} className="text-stone-400" /> משלוח</>
              ) : (
                <><Package size={15} className="text-stone-400" /> איסוף עצמי</>
              )}
            </h2>
            {order.delivery_address && (
              <p className="text-sm text-stone-600">{order.delivery_address}</p>
            )}
            {order.delivery_notes && (
              <p className="text-sm text-stone-400 mt-2">{order.delivery_notes}</p>
            )}
            {order.logo_url && (
              <div className="mt-3">
                <span className="text-xs text-stone-500 block mb-1.5">לוגו מצורף:</span>
                <a
                  href={order.logo_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  הורד לוגו
                </a>
              </div>
            )}
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-800 text-sm">פריטים</h2>
            </div>
            <div className="divide-y divide-stone-50">
              {items.length === 0 ? (
                <p className="px-5 py-6 text-sm text-stone-400">אין פריטים</p>
              ) : (
                items.map((item, i) => (
                  <div key={i} className="px-5 py-3.5 flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-stone-800">
                        {item.name_he}
                        {item.is_bundle && (
                          <span className="mr-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                            חבילה
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-stone-400 mt-0.5">
                        {item.quantity} × ₪{Number(item.price_per_unit).toLocaleString("he-IL")}
                      </div>
                    </div>
                    <div className="font-semibold text-stone-700 text-sm">
                      ₪{(item.quantity * item.price_per_unit).toLocaleString("he-IL")}
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="px-5 py-4 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
              <span className="font-semibold text-stone-700 text-sm">סה״כ</span>
              <span className="font-bold text-stone-800 text-lg">
                {order.total_amount
                  ? `₪${Number(order.total_amount).toLocaleString("he-IL")}`
                  : "—"}
              </span>
            </div>
          </div>

          {/* Special Requests */}
          {order.special_requests && (
            <div className="bg-white rounded-2xl border border-stone-200 p-5">
              <h2 className="font-semibold text-stone-800 mb-2 text-sm flex items-center gap-2">
                <FileText size={15} className="text-stone-400" />
                הערות הלקוחה
              </h2>
              <p className="text-sm text-stone-600 whitespace-pre-wrap">
                {order.special_requests}
              </p>
            </div>
          )}
        </div>

        {/* Right: Status Update */}
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-stone-200 p-5 sticky top-8">
            <h2 className="font-semibold text-stone-800 mb-4 text-sm">
              עדכון סטטוס
            </h2>
            <OrderStatusUpdate
              orderId={order.id}
              currentStatus={order.status as OrderStatus}
              currentNotes={order.admin_notes}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
