"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { MessageCircle, Clock } from "lucide-react";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "972533721938";

export default function ContactPage() {
  const t = useTranslations("contact");
  const [form, setForm] = useState({ name: "", phone: "", email: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleWhatsApp = () => {
    const text = encodeURIComponent("שלום רינה, אשמח לקבל פרטים נוספים");
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${text}`, "_blank");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 900));
    setSent(true);
    setLoading(false);
  };

  const fields: { key: keyof typeof form; type: string }[] = [
    { key: "name", type: "text" },
    { key: "phone", type: "tel" },
    { key: "email", type: "email" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <motion.div
        className="text-center mb-14"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="text-4xl font-bold text-[var(--charcoal)]">{t("title")}</h1>
        <p className="mt-3 text-[var(--muted)] text-sm">{t("subtitle")}</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <motion.div
          className="space-y-5"
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <button
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-3 p-5 bg-[#25D366] text-white rounded-2xl font-medium text-lg hover:bg-[#1fb858] transition-colors shadow-md"
          >
            <MessageCircle size={22} />
            {t("whatsapp_cta")}
          </button>

          <div className="flex items-center gap-3 p-5 rounded-2xl bg-[var(--cream)] border border-gray-100 text-[var(--muted)] text-sm">
            <Clock size={17} className="shrink-0" />
            <span>{t("hours")}</span>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.22 }}
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-4">
              <motion.div
                className="w-14 h-14 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[var(--gold)] text-2xl"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
              >
                ✓
              </motion.div>
              <p className="text-lg font-semibold text-[var(--charcoal)]">{t("sent")}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map(({ key, type }) => (
                <input
                  key={key}
                  type={type}
                  placeholder={t(key as "name" | "phone" | "email")}
                  value={form[key]}
                  onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[var(--charcoal)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--gold)] transition-colors text-sm"
                />
              ))}
              <textarea
                placeholder={t("message")}
                value={form.message}
                onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                rows={4}
                required
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-[var(--charcoal)] placeholder:text-gray-400 focus:outline-none focus:border-[var(--gold)] transition-colors resize-none text-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[var(--gold)] text-white rounded-xl font-medium text-sm hover:bg-[#b8915a] transition-colors disabled:opacity-60"
              >
                {loading ? "..." : t("send")}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
