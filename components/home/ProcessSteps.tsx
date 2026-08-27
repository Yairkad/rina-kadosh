"use client";

import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { BookOpen, PenTool, Gift } from "lucide-react";
import { GeometricPattern } from "@/components/ui/GeometricPattern";

export default function ProcessSteps() {
  const t = useTranslations("home");

  const steps = [
    { num: "1", title: t("process_1_title"), desc: t("process_1_desc"), Icon: BookOpen },
    { num: "2", title: t("process_2_title"), desc: t("process_2_desc"), Icon: PenTool },
    { num: "3", title: t("process_3_title"), desc: t("process_3_desc"), Icon: Gift },
  ];

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden bg-[var(--cream)]">
      <GeometricPattern
        className="absolute inset-0 pointer-events-none"
        color="var(--olive)"
        opacity={0.06}
        size={48}
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span aria-hidden className="text-[var(--terracotta)] text-xs">✦</span>
          <h2 className="mt-3 font-heading text-2xl sm:text-3xl font-semibold text-[var(--charcoal)]">
            {t("process_title")}
          </h2>
        </motion.div>

        <div className="grid sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-[var(--charcoal)]/10 rounded-3xl border border-[var(--charcoal)]/10 bg-white/60 backdrop-blur-sm shadow-sm overflow-hidden">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              className="group relative p-8 sm:p-10 flex flex-col items-center text-center overflow-hidden"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              {/* Faint giant number watermark */}
              <span
                aria-hidden
                className="absolute -top-3 end-3 text-7xl font-black text-[var(--gold)] opacity-10 select-none pointer-events-none"
              >
                {step.num}
              </span>

              <div className="relative z-10 w-14 h-14 rounded-2xl bg-[var(--cream)] text-[var(--terracotta)] flex items-center justify-center mb-5 transition-colors duration-300 group-hover:bg-[var(--gold)] group-hover:text-white">
                <step.Icon size={24} strokeWidth={1.75} />
              </div>

              <h3 className="relative z-10 text-[var(--charcoal)] font-semibold mb-2">
                {step.title}
                <span className="block mx-auto mt-1.5 h-px w-6 bg-[var(--gold)] transition-all duration-300 group-hover:w-12" />
              </h3>
              <p className="relative z-10 text-[var(--charcoal)]/65 text-sm leading-relaxed max-w-[220px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
