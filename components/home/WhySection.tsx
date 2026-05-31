"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { Brush, Gem, HeartHandshake } from "lucide-react";

export default function WhySection() {
  const t = useTranslations("home");

  const items = [
    { Icon: Brush, title: t("why_1_title"), desc: t("why_1_desc"), num: "01" },
    { Icon: Gem, title: t("why_2_title"), desc: t("why_2_desc"), num: "02" },
    { Icon: HeartHandshake, title: t("why_3_title"), desc: t("why_3_desc"), num: "03" },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl font-semibold text-[var(--charcoal)]">
            {t("why_title")}
          </h2>
        </motion.div>

        {/* Cards grid */}
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 border border-gray-100 rounded-3xl overflow-hidden shadow-sm">
          {items.map(({ Icon, title, desc, num }, i) => (
            <motion.div
              key={i}
              className="relative flex flex-col bg-white p-10 group hover:bg-[var(--cream)] transition-colors duration-300 cursor-default"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
            >
              {/* Large decorative number */}
              <span className="absolute top-5 end-5 text-7xl font-bold text-[var(--gold)]/8 leading-none select-none group-hover:text-[var(--gold)]/15 transition-colors duration-300">
                {num}
              </span>

              {/* Icon */}
              <div className="w-12 h-12 rounded-2xl bg-[var(--cream)] flex items-center justify-center text-[var(--gold)] mb-6 group-hover:bg-[var(--gold)] group-hover:text-white transition-all duration-300 shrink-0">
                <Icon size={22} strokeWidth={1.5} />
              </div>

              <h3 className="text-xl font-semibold text-[var(--charcoal)] mb-3">{title}</h3>
              <p className="text-[var(--muted)] text-sm leading-relaxed flex-1">{desc}</p>

              {/* Gold bottom accent */}
              <div className="mt-8 h-0.5 w-8 bg-[var(--gold)]/40 group-hover:w-16 transition-all duration-500 rounded-full" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
