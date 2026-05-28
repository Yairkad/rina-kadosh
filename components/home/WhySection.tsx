"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Brush, Gem, HeartHandshake } from "lucide-react";

export default function WhySection() {
  const t = useTranslations("home");

  const items = [
    { Icon: Brush, title: t("why_1_title"), desc: t("why_1_desc") },
    { Icon: Gem, title: t("why_2_title"), desc: t("why_2_desc") },
    { Icon: HeartHandshake, title: t("why_3_title"), desc: t("why_3_desc") },
  ];

  return (
    <section className="py-24 bg-[var(--charcoal)]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h2
          className="text-3xl font-semibold text-white text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {t("why_title")}
        </motion.h2>

        <div className="grid md:grid-cols-3 gap-10">
          {items.map(({ Icon, title, desc }, i) => (
            <motion.div
              key={i}
              className="flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border border-[var(--gold)]/60 text-[var(--gold)] mb-5 shrink-0">
                <Icon size={22} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
