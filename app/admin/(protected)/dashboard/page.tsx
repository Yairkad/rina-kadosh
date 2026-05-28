import { createClient } from "@/lib/supabase/server";
import {
  ShoppingBag,
  Clock,
  Wrench,
  TrendingUp,
} from "lucide-react";

type OrderStatus = "pending" | "confirmed" | "in_production" | "ready" | "delivered" | "cancelled";

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
  delivered: "bg-stone-100 text-stone-600",
  cancelled: "bg-red-100 text-red-700",
};

async function getDashboardData() {
  const supabase = await createClient();

  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

  const [
    { count: totalOrders },
    { count: pendingOrders },
    { count: inProductionOrders },
    { data: revenueData },
    { data: recentOrders },
  ] = await Promise.all([
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .gte("created_at", startOfToday)
      .is("deleted_at", null),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending")
      .is("deleted_at", null),

    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("status", "in_production")
      .is("deleted_at", null),

    supabase
      .from("orders")
      .select("total_amount")
      .in("status", ["confirmed", "in_production", "ready", "delivered"])
      .gte("created_at", startOfMonth)
      .is("deleted_at", null),

    supabase
      .from("orders")
      .select("id, order_number, customer_name, total_amount, status, created_at")
      .is("deleted_at", null)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const monthlyRevenue =
    revenueData?.reduce((sum, o) => sum + (o.total_amount ?? 0), 0) ?? 0;

  return {
    totalOrdersToday: totalOrders ?? 0,
    pendingOrders: pendingOrders ?? 0,
    inProductionOrders: inProductionOrders ?? 0,
    monthlyRevenue,
    recentOrders: recentOrders ?? [],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  const kpis = [
    {
      label: "הזמנות היום",
      value: data.totalOrdersToday,
      icon: ShoppingBag,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "ממתינות לאישור",
      value: data.pendingOrders,
      icon: Clock,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
    {
      label: "בייצור כעת",
      value: data.inProductionOrders,
      icon: Wrench,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "הכנסות החודש",
      value: `₪${data.monthlyRevenue.toLocaleString("he-IL")}`,
      icon: TrendingUp,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ];

  return (
    <div className="p-8" dir="rtl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-800">דאשבורד</h1>
        <p className="text-stone-500 text-sm mt-1">
          {new Date().toLocaleDateString("he-IL", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map(({ label, value, icon: Icon, color, bg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-stone-200 p-5 flex items-center gap-4"
          >
            <div className={`${bg} ${color} p-3 rounded-xl`}>
              <Icon size={20} strokeWidth={1.8} />
            </div>
            <div>
              <div className="text-2xl font-bold text-stone-800">{value}</div>
              <div className="text-xs text-stone-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-800">הזמנות אחרונות</h2>
          <a
            href="/admin/orders"
            className="text-sm text-stone-500 hover:text-stone-800 transition-colors"
          >
            כל ההזמנות ←
          </a>
        </div>

        {data.recentOrders.length === 0 ? (
          <div className="px-6 py-12 text-center text-stone-400 text-sm">
            אין הזמנות עדיין
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  <th className="text-right px-6 py-3 text-xs font-medium text-stone-500">
                    מספר הזמנה
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-stone-500">
                    לקוחה
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-stone-500">
                    סכום
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-stone-500">
                    סטטוס
                  </th>
                  <th className="text-right px-6 py-3 text-xs font-medium text-stone-500">
                    תאריך
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {data.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-stone-50 transition-colors"
                  >
                    <td className="px-6 py-3.5 font-mono font-medium text-stone-700">
                      {order.order_number}
                    </td>
                    <td className="px-6 py-3.5 text-stone-700">
                      {order.customer_name}
                    </td>
                    <td className="px-6 py-3.5 text-stone-700">
                      {order.total_amount
                        ? `₪${Number(order.total_amount).toLocaleString("he-IL")}`
                        : "—"}
                    </td>
                    <td className="px-6 py-3.5">
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
                    <td className="px-6 py-3.5 text-stone-500 text-xs">
                      {new Date(order.created_at).toLocaleDateString("he-IL")}
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
