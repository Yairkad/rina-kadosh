"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { updateOrderStatus } from "@/app/admin/actions/orders";

type OrderStatus = "pending" | "confirmed" | "in_production" | "ready" | "delivered" | "cancelled";

export default function ProductionStatusButton({
  orderId,
  newStatus,
  label,
}: {
  orderId: string;
  newStatus: OrderStatus;
  label: string;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleClick() {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus);
      if (res?.error) { alert(`שגיאה: ${res.error}`); return; }
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="flex-1 flex items-center justify-center gap-1.5 text-xs bg-stone-800 hover:bg-stone-700 disabled:bg-stone-400 text-white py-1.5 rounded-lg transition-colors font-medium"
    >
      {isPending && <Loader2 size={12} className="animate-spin" />}
      {label}
    </button>
  );
}
