"use client";

import { useState, useTransition } from "react";
import { updateOrderStatus, updateOrderNotes } from "@/app/admin/actions/orders";
import { Check, Loader2 } from "lucide-react";

type OrderStatus =
  | "pending"
  | "confirmed"
  | "in_production"
  | "ready"
  | "delivered"
  | "cancelled";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "pending", label: "ממתינה לאישור" },
  { value: "confirmed", label: "אושרה" },
  { value: "in_production", label: "בייצור" },
  { value: "ready", label: "מוכנה לאיסוף/משלוח" },
  { value: "delivered", label: "נמסרה" },
  { value: "cancelled", label: "בוטלה" },
];

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  in_production: "bg-purple-100 text-purple-800 border-purple-200",
  ready: "bg-green-100 text-green-800 border-green-200",
  delivered: "bg-stone-100 text-stone-600 border-stone-200",
  cancelled: "bg-red-100 text-red-700 border-red-200",
};

export default function OrderStatusUpdate({
  orderId,
  currentStatus,
  currentNotes,
}: {
  orderId: string;
  currentStatus: OrderStatus;
  currentNotes: string | null;
}) {
  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [notes, setNotes] = useState(currentNotes ?? "");
  const [saved, setSaved] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  async function handleSave() {
    setError("");
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, status, notes);
      if (res?.error) {
        setError(res.error);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      }
    });
  }

  const hasChanged = status !== currentStatus || notes !== (currentNotes ?? "");

  return (
    <div className="space-y-4">
      {/* Status Select */}
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-2">
          סטטוס הזמנה
        </label>
        <div className="grid grid-cols-2 gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`text-xs px-3 py-2 rounded-lg border text-right transition-all font-medium ${
                status === opt.value
                  ? `${STATUS_COLORS[opt.value]} ring-2 ring-offset-1 ring-current`
                  : "bg-white border-stone-200 text-stone-600 hover:bg-stone-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Admin Notes */}
      <div>
        <label className="block text-xs font-medium text-stone-500 mb-2">
          הערות פנימיות
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          placeholder="הערות לשימוש פנימי בלבד..."
          className="w-full text-sm px-3 py-2.5 rounded-lg border border-stone-200 text-stone-700 resize-none focus:outline-none focus:ring-2 focus:ring-stone-400 focus:border-transparent transition"
        />
      </div>

      {error && (
        <p className="text-red-600 text-xs bg-red-50 px-3 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        onClick={handleSave}
        disabled={!hasChanged || isPending}
        className={`w-full py-2.5 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
          saved
            ? "bg-green-600 text-white"
            : hasChanged && !isPending
            ? "bg-stone-800 hover:bg-stone-700 text-white"
            : "bg-stone-100 text-stone-400 cursor-not-allowed"
        }`}
      >
        {isPending ? (
          <Loader2 size={15} className="animate-spin" />
        ) : saved ? (
          <>
            <Check size={15} />
            נשמר
          </>
        ) : (
          "שמור שינויים"
        )}
      </button>
    </div>
  );
}
