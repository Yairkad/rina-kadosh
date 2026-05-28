"use client";

import { motion } from "framer-motion";

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "";

export default function WhatsAppButton() {
  return (
    <motion.a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="פתח שיחת WhatsApp עם רינה קדוש"
      className="fixed bottom-20 end-4 md:bottom-6 md:end-6 z-50 w-14 h-14 rounded-full bg-[#25D366] shadow-lg flex items-center justify-center text-white"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 1, type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* WhatsApp SVG icon */}
      <svg viewBox="0 0 32 32" width="28" height="28" fill="white" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.49.654 4.824 1.797 6.84L2 30l7.357-1.77A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.44 11.44 0 01-5.824-1.594l-.418-.248-4.367 1.051 1.078-4.258-.27-.437A11.46 11.46 0 014.5 16C4.5 9.649 9.649 4.5 16 4.5S27.5 9.649 27.5 16 22.351 27.5 16 27.5zm6.29-8.617c-.344-.172-2.037-1.004-2.352-1.118-.316-.114-.547-.172-.777.172-.23.344-.891 1.118-1.094 1.348-.2.23-.402.258-.746.086-.344-.172-1.453-.536-2.766-1.707-1.023-.91-1.715-2.035-1.918-2.379-.2-.344-.02-.53.152-.7.156-.153.344-.4.516-.602.172-.2.23-.344.344-.574.114-.23.057-.43-.028-.602-.086-.172-.778-1.875-1.066-2.566-.28-.672-.564-.582-.778-.59l-.66-.012c-.23 0-.602.086-.918.43-.316.344-1.207 1.176-1.207 2.867s1.235 3.33 1.407 3.558c.172.23 2.43 3.71 5.887 5.203.824.355 1.465.567 1.965.726.824.262 1.574.225 2.168.137.66-.1 2.037-.832 2.324-1.636.285-.805.285-1.496.2-1.64-.086-.144-.316-.23-.66-.402z" />
      </svg>
    </motion.a>
  );
}
