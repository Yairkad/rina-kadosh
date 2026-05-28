"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { Search } from "lucide-react";

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "in_production",
  "ready",
  "delivered",
] as const;

type StepKey = (typeof STATUS_STEPS)[number];

interface OrderRow {
  order_number: string;
  status: StepKey | "cancelled";
  created_at: string;
  total_amount: number;
  customer_name: string;
}

export default function OrderStatusPage() {
  const ts = useTranslations("status");
  const tc = useTranslations("common");
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<OrderRow | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotFound(false);
    setOrder(null);

    const supabase = createClient();
    const { data } = await supabase
      .from("orders")
      .select("order_number, status, created_at, total_amount, customer_name")
      .eq("order_number", orderNumber.trim().toUpperCase())
      .eq("customer_email", email.trim().toLowerCase())
      .single();

    setLoading(false);
    if (data) {
      setOrder(data as OrderRow);
    } else {
      setNotFound(true);
    }
  };

  const stepIndex =
    order && order.status !== "cancelled"
      ? STATUS_STEPS.indexOf(order.status as StepKey)
      : -1;

  const stepLabels: Record<StepKey, string> = {
    pending: ts("pending"),
    confirmed: ts("confirmed"),
    in_production: ts("in_production"),
    ready: ts("ready"),
    delivered: ts("delivered"),
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16">
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold text-[var(--charcoal)]">{ts("page_title")}</h1>
        <p className="mt-3 text-[var(--muted)] text-sm">{ts("subtitle")}</p>
      </motion.div>

      <motion.form
        onSubmit={handleSearch}
        className="space-y-4 mb-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
      >
        <input
          type="text"
          placeholder={ts("order_number_placeholder")}
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[var(--charcoal)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--gold)] transition-colors text-sm"
        />
        <input
          type="email"
          placeholder={ts("email_label")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[var(--charcoal)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--gold)] transition-colors text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-[var(--gold)] text-white rounded-xl font-medium text-sm hover:bg-[#b8915a] transition-colors disabled:opacity-60"
        >
          <Search size={17} />
          {loading ? tc("loading") : ts("search")}
        </button>
      </motion.form>

      <AnimatePresence mode="wait">
        {notFound && (
          <motion.p
            key="not-found"
            className="text-center text-red-500 text-sm"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            {ts("not_found")}
          </motion.p>
        )}

        {order && (
          <motion.div
            key="order-result"
            className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-start justify-between mb-8 gap-4">
              <div>
                <p className="text-xs text-[var(--muted)] mb-0.5">{ts("order_summary")}</p>
                <p className="font-bold text-[var(--charcoal)] text-lg leading-tight">
                  {order.order_number}
                </p>
                <p className="text-xs text-[var(--muted)] mt-1">{order.customer_name}</p>
              </div>
              <div className="text-end shrink-0">
                <p className="text-xs text-[var(--muted)] mb-0.5">{tc("currency")}</p>
                <p className="font-bold text-[var(--charcoal)] text-lg">
                  {tc("currency")}{order.total_amount.toLocaleString()}
                </p>
              </div>
            </div>

            {order.status === "cancelled" ? (
              <div className="text-center py-4">
                <span className="inline-block px-5 py-2 rounded-full bg-red-50 text-red-500 text-sm font-medium border border-red-100">
                  {ts("cancelled")}
                </span>
              </div>
            ) : (
              <div className="relative">
                {/* Track line bg */}
                <div className="absolute top-4 start-4 end-4 h-0.5 bg-gray-100 z-0" />
                {/* Track line fill */}
                <div
                  className="absolute top-4 start-4 h-0.5 bg-[var(--gold)] z-0 transition-all duration-700"
                  style={{
                    width: stepIndex >= 0
                      ? `${(stepIndex / (STATUS_STEPS.length - 1)) * (100 - 8)}%`
                      : "0%",
                  }}
                />
                {/* Steps */}
                <div className="relative z-10 flex justify-between">
                  {STATUS_STEPS.map((step, i) => {
                    const active = i <= stepIndex;
                    return (
                      <div key={step} className="flex flex-col items-center gap-2 w-14">
                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors duration-300 ${
                            active
                              ? "bg-[var(--gold)] border-[var(--gold)] text-white"
                              : "bg-white border-gray-200 text-gray-400"
                          }`}
                        >
                          {active ? "✓" : i + 1}
                        </div>
                        <span
                          className={`text-[9px] text-center leading-tight ${
                            active ? "text-[var(--gold)] font-medium" : "text-gray-400"
                          }`}
                        >
                          {stepLabels[step]}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
