# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-05-28T18:58:17.521Z
> Files: 85 tracked | Anatomy hits: 0 | Misses: 0

## ../../../.claude/projects/c--Users-----------Desktop-projects-rina-kadosh/memory/

- `design_references.md` — Design References — Rina Kadosh (~691 tok)
- `MEMORY.md` — Memory Index — Rina Kadosh Project (~83 tok)
- `project_rina_kadosh.md` — פרויקט רינה קדוש — Rina Kadosh (~1192 tok)

## ./

- `.gitignore` — Git ignore rules (~115 tok)
- `CLAUDE.md` — OpenWolf (~57 tok)
- `middleware.ts` — Exports config (~144 tok)
- `next.config.mjs` — Declares withNextIntl (~122 tok)
- `OVERVIEW.html` — רינה קדוש — סיכום האתר (~7732 tok)
- `SPEC.md` — רינה קדוש / Rina Kadosh — מפרט פרויקט מלא (~3397 tok)
- `tsconfig.json` — TypeScript configuration (~170 tok)

## .claude/

- `settings.json` (~441 tok)
- `settings.local.json` (~82 tok)

## .claude/rules/

- `openwolf.md` (~313 tok)

## app/

- `globals.css` — Styles: 4 rules, 5 vars (~157 tok)
- `layout.tsx` — RootLayout (~32 tok)

## app/[locale]/

- `layout.tsx` — metadata (~589 tok)

## app/[locale]/(public)/

- `layout.tsx` — PublicLayout (~150 tok)
- `page.tsx` — HomePage (~432 tok)

## app/[locale]/(public)/cart/

- `page.tsx` — CartPage — renders form (~3074 tok)

## app/[locale]/(public)/catalog/

- `page.tsx` — CatalogPage (~456 tok)

## app/[locale]/(public)/catalog/[event]/

- `page.tsx` — EventPage (~999 tok)

## app/[locale]/(public)/catalog/[event]/[style]/

- `page.tsx` — StylePage (~1777 tok)

## app/[locale]/(public)/catalog/[event]/[style]/[product]/

- `page.tsx` — SITE_URL (~2073 tok)

## app/[locale]/(public)/contact/

- `page.tsx` — WHATSAPP_NUMBER — renders form (~1368 tok)

## app/[locale]/(public)/gallery/

- `page.tsx` — GalleryPage (~584 tok)

## app/[locale]/(public)/order-status/

- `page.tsx` — STATUS_STEPS (~2096 tok)

## app/admin/

- `login/page.tsx` — AdminLoginPage — email/password form, checks is_admin (~430 tok)

## app/admin/(protected)/

- `layout.tsx` — AdminProtectedLayout — auth check (server), renders AdminSidebar (~240 tok)
- `page.tsx` — redirect → /admin/dashboard (~35 tok)

## app/admin/(protected)/bundles/

- `page.tsx` — STATUS_COLORS — renders table (~1713 tok)

## app/admin/(protected)/bundles/[id]/

- `page.tsx` — EditBundlePage (~586 tok)

## app/admin/(protected)/bundles/new/

- `page.tsx` — NewBundlePage (~264 tok)

## app/admin/(protected)/catalog/

- `page.tsx` — CatalogPage (~299 tok)

## app/admin/(protected)/create-order/

- `page.tsx` — CreateOrderPage (~213 tok)

## app/admin/(protected)/dashboard/

- `page.tsx` — DashboardPage — KPI cards (today/pending/in_production/revenue) + recent orders table (~350 tok)

## app/admin/(protected)/gallery/

- `page.tsx` — GalleryPage (~1059 tok)

## app/admin/(protected)/gallery/[id]/

- `page.tsx` — EditGalleryItemPage (~315 tok)

## app/admin/(protected)/gallery/new/

- `page.tsx` — NewGalleryItemPage (~168 tok)

## app/admin/(protected)/orders/

- `page.tsx` — OrdersPage — list with status filter tabs + CSV export link (~280 tok)

## app/admin/(protected)/orders/[id]/

- `page.tsx` — STATUS_LABELS (~2941 tok)

## app/admin/(protected)/production/

- `page.tsx` — COLUMNS (~1357 tok)

## app/admin/(protected)/products/

- `page.tsx` — STATUS_LABELS — renders table (~2189 tok)

## app/admin/(protected)/products/[id]/

- `page.tsx` — EditProductPage (~586 tok)

## app/admin/(protected)/products/new/

- `page.tsx` — NewProductPage (~240 tok)

## app/admin/actions/

- `bundles.ts` — Exports BundleItem, BundleFormData, createBundle, updateBundle, archiveBundle (~699 tok)
- `catalog.ts` — Exports createEventType, updateEventType, deleteEventType, createDesignStyle + 2 more (~1047 tok)
- `create-order.ts` — Exports ManualOrderItem, ManualOrderData, createManualOrder (~465 tok)
- `gallery.ts` — Exports GalleryFormData, createGalleryItem, updateGalleryItem, deleteGalleryItem (~511 tok)
- `orders.ts` — Exports updateOrderStatus, updateOrderNotes (~616 tok)
- `products.ts` — Exports ProductFormData, createProduct, updateProduct, archiveProduct (~699 tok)

## app/admin/login/

- `page.tsx` — AdminLoginPage — renders form (~1002 tok)

## app/api/og/

- `route.tsx` — runtime (~1593 tok)

## components/admin/

- `AdminSidebar.tsx` — AdminSidebar — sidebar nav 8 items + sign-out button (~789 tok)
- `ArchiveBundleButton.tsx` — ArchiveBundleButton (~269 tok)
- `ArchiveProductButton.tsx` — ArchiveProductButton (~276 tok)
- `BundleForm.tsx` — Field (~3944 tok)
- `CatalogManager.tsx` — EMPTY_FORM — renders form (~4249 tok)
- `DeleteGalleryItemButton.tsx` — DeleteGalleryItemButton (~259 tok)
- `GalleryItemForm.tsx` — GalleryItemForm (~2096 tok)
- `OrderStatusUpdate.tsx` — STATUS_OPTIONS (~1171 tok)
- `ProductForm.tsx` — STATUS_OPTIONS (~3769 tok)
- `ProductionStatusButton.tsx` — ProductionStatusButton (~306 tok)

## components/cart/

- `CartDrawer.tsx` — CartDrawer (~2316 tok)
- `CartRecoveryPopup.tsx` — CartRecoveryPopup (~675 tok)
- `QuickAdd.tsx` — QuickAddOverlay (~1984 tok)

## components/catalog/

- `ExpandingEventCards.tsx` — ExpandingEventCards (~1296 tok)
- `ProductCard.tsx` — ProductCard (~934 tok)

## components/home/

- `HeroSection.tsx` — HeroSection (~1334 tok)
- `WhySection.tsx` — WhySection (~523 tok)

## components/layout/

- `BottomNav.tsx` — BottomNav (~453 tok)
- `Footer.tsx` — Footer (~677 tok)
- `Navbar.tsx` — Navbar (~1642 tok)
- `WhatsAppButton.tsx` — WHATSAPP_NUMBER (~528 tok)

## components/product/

- `ProductAddToCart.tsx` — ProductAddToCart (~1201 tok)
- `ProductImageGallery.tsx` — ProductImageGallery (~568 tok)

## contexts/

- `CartContext.tsx` — STORAGE_KEY (~2024 tok)

## design-references/

- `ExpandingCards.tsx` — ExpandingCards (~1159 tok)

## i18n/

- `request.ts` (~114 tok)
- `routing.ts` — Exports routing (~41 tok)

## lib/

- `utils.ts` — Exports cn (~49 tok)

## lib/supabase/

- `client.ts` — Exports createClient (~62 tok)
- `server.ts` — Exports createClient (~176 tok)

## messages/

- `en.json` (~974 tok)
- `he.json` (~883 tok)

## supabase/migrations/

- `001_initial_schema.sql` — ============================================================ (~3133 tok)
