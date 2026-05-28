"use client";

import { motion } from "framer-motion";

const STATS = [
  { value: "10+", label_he: "שנות ניסיון", label_en: "Years Experience" },
  { value: "500+", label_he: "אירועים מרוצים", label_en: "Happy Events" },
  { value: "100%", label_he: "עיצוב אישי", label_en: "Custom Design" },
];

const STORY_HE = `כאן יהיה הסיפור שלך — כמה משפטים על מי את, מאיפה הגעת לעולם המוצרים המודפסים, ומה מניע אותך. ניתן לערוך ישירות בקוד או דרך ממשק הניהול.`;

const STORY_EN = `Your story goes here — a few sentences about who you are, your background in printed products, and what drives you. Edit directly in code or via the admin panel.`;

interface Props {
  locale: string;
}

export default function AboutSection({ locale }: Props) {
  const isHe = locale === "he";

  return (
    <section className="bg-[var(--charcoal)] border-t border-white/5 py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Title */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="text-xs uppercase tracking-widest text-[var(--gold)] block mb-3">
            {isHe ? "הסיפור שלי" : "My Story"}
          </span>
          <h2 className="text-3xl font-bold text-white">
            {isHe ? "אודות רינה קדוש" : "About Rina Kadosh"}
          </h2>
        </motion.div>

        {/* Story */}
        <motion.p
          className="text-gray-300 text-base sm:text-lg leading-relaxed text-center max-w-2xl mx-auto mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          {isHe ? STORY_HE : STORY_EN}
        </motion.p>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-6 sm:gap-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {STATS.map(({ value, label_he, label_en }) => (
            <div key={value} className="text-center">
              <div className="text-3xl sm:text-4xl font-bold text-[var(--gold)] mb-1">
                {value}
              </div>
              <div className="text-sm text-gray-400">
                {isHe ? label_he : label_en}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
