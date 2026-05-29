"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  BookOpen,
  Wrench,
  Plus,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "דאשבורד", icon: LayoutDashboard },
  { href: "/admin/orders", label: "הזמנות", icon: ShoppingBag },
  { href: "/admin/products", label: "מוצרים", icon: Package },
  { href: "/admin/bundles", label: "חבילות", icon: Layers },
  { href: "/admin/catalog", label: "קטלוג", icon: BookOpen },
  { href: "/admin/production", label: "תור ייצור", icon: Wrench },
  { href: "/admin/create-order", label: "הזמנה ידנית", icon: Plus },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <nav className="flex-1 py-4 px-3 space-y-0.5 overflow-y-auto">
      {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
              active
                ? "bg-stone-800 text-white"
                : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
            }`}
          >
            <Icon size={16} strokeWidth={1.8} />
            <span>{label}</span>
            {active && <ChevronLeft size={14} className="mr-auto opacity-60" />}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
  }

  const footer = (
    <div className="px-4 py-4 border-t border-stone-100">
      <div className="text-xs text-stone-400 mb-3 truncate">{email}</div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-sm text-stone-500 hover:text-red-600 transition-colors w-full"
      >
        <LogOut size={15} />
        <span>התנתק</span>
      </button>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 inset-x-0 z-40 h-14 bg-white border-b border-stone-200 flex items-center justify-between px-4" dir="rtl">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <span className="font-bold text-stone-800 text-sm">רינה קדוש — ניהול</span>
        <div className="w-9" />
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex" dir="rtl">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-white h-full flex flex-col shadow-2xl">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <div>
                <div className="text-sm font-bold text-stone-800">רינה קדוש</div>
                <div className="text-xs text-stone-400 mt-0.5">ממשק ניהול</div>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg text-stone-400 hover:bg-stone-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <NavLinks pathname={pathname} onNavigate={() => setMobileOpen(false)} />
            {footer}
          </aside>
        </div>
      )}

      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-56 shrink-0 bg-white border-l border-stone-200 flex-col h-screen sticky top-0">
        <div className="px-5 py-5 border-b border-stone-100">
          <div className="text-sm font-bold text-stone-800">רינה קדוש</div>
          <div className="text-xs text-stone-400 mt-0.5">ממשק ניהול</div>
        </div>
        <NavLinks pathname={pathname} />
        {footer}
      </aside>
    </>
  );
}
