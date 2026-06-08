# anatomy.md

> Auto-maintained by OpenWolf. Last scanned: 2026-06-08T09:47:04.340Z
> Files: 105 tracked | Anatomy hits: 0 | Misses: 0

## ../../../.claude/projects/c--Users-----------Desktop-projects-rina-kadosh/memory/

- `audit_findings_2026_05_28.md` — ממצאי בדיקות — 2026-05-28 (~1135 tok)
- `design_references.md` — Design References — Rina Kadosh (~691 tok)
- `MEMORY.md` — Memory Index — Rina Kadosh Project (~156 tok)
- `project_rina_kadosh.md` — פרויקט רינה קדוש — Rina Kadosh (~1192 tok)
- `vercel_workflow.md` — $dep.state → READY / ERROR / BUILDING (~287 tok)

## ./

- `.gitignore` — Git ignore rules (~115 tok)
- `.mcp.json` (~102 tok)
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
- `page.tsx` — revalidate (~491 tok)

## app/[locale]/(public)/cart/

- `page.tsx` — ALLOWED_MIME — renders form (~3716 tok)

## app/[locale]/(public)/catalog/

- `page.tsx` — revalidate (~465 tok)

## app/[locale]/(public)/catalog/[event]/

- `page.tsx` — revalidate (~1196 tok)

## app/[locale]/(public)/catalog/[event]/[style]/

- `page.tsx` — revalidate (~1786 tok)

## app/[locale]/(public)/catalog/[event]/[style]/[product]/

- `page.tsx` — revalidate (~2120 tok)

## app/[locale]/(public)/contact/

- `page.tsx` — WHATSAPP_NUMBER — renders form (~1608 tok)

## app/[locale]/(public)/gallery/

- `page.tsx` — GalleryPage (~584 tok)

## app/[locale]/(public)/order-status/

- `page.tsx` — STATUS_STEPS (~2096 tok)

## app/actions/

- `submit-order.ts` — Exports OrderItemInput, SubmitOrderInput, submitOrder (~1064 tok)

## app/admin/

- `layout.tsx` — AdminLayout (~67 tok)
- `login/page.tsx` — AdminLoginPage — email/password form, checks is_admin (~430 tok)

## app/admin/(protected)/

- `layout.tsx` — AdminProtectedLayout (~242 tok)
- `page.tsx` — redirect → /admin/dashboard (~35 tok)

## app/admin/(protected)/bundles/

- `page.tsx` — STATUS_COLORS — renders table (~1713 tok)

## app/admin/(protected)/bundles/[id]/

- `page.tsx` — EditBundlePage (~586 tok)

## app/admin/(protected)/bundles/new/

- `page.tsx` — NewBundlePage (~264 tok)

## app/admin/(protected)/catalog/

- `page.tsx` — CatalogPage (~362 tok)

## app/admin/(protected)/create-order/

- `page.tsx` — CreateOrderPage (~213 tok)

## app/admin/(protected)/customers/

- `page.tsx` — PAYMENT_LABELS — renders table (~2327 tok)

## app/admin/(protected)/dashboard/

- `page.tsx` — DashboardPage — KPI cards (today/pending/in_production/revenue) + recent orders table (~350 tok)

## app/admin/(protected)/gallery/

- `page.tsx` — GalleryPage (~1059 tok)

## app/admin/(protected)/gallery/[id]/

- `page.tsx` — EditGalleryItemPage (~315 tok)

## app/admin/(protected)/gallery/new/

- `page.tsx` — NewGalleryItemPage (~168 tok)

## app/admin/(protected)/materials/

- `page.tsx` — MaterialsPage (~316 tok)

## app/admin/(protected)/orders/

- `page.tsx` — OrdersPage — list with status filter tabs + CSV export link (~280 tok)

## app/admin/(protected)/orders/[id]/

- `page.tsx` — STATUS_LABELS (~3359 tok)

## app/admin/(protected)/production/

- `page.tsx` — COLUMNS (~1357 tok)

## app/admin/(protected)/products/

- `page.tsx` — STATUS_LABELS — renders table (~2518 tok)

## app/admin/(protected)/products/[id]/

- `page.tsx` — EditProductPage (~637 tok)

## app/admin/(protected)/products/new/

- `page.tsx` — NewProductPage (~263 tok)

## app/admin/actions/

- `bundles.ts` — Exports BundleItem, BundleFormData, createBundle, updateBundle, archiveBundle (~773 tok)
- `catalog.ts` — Exports createEventType, updateEventType, deleteEventType, createDesignStyle + 3 more (~1232 tok)
- `create-order.ts` — Exports ManualOrderItem, ManualOrderData, createManualOrder (~465 tok)
- `gallery.ts` — Exports GalleryFormData, createGalleryItem, updateGalleryItem, deleteGalleryItem (~511 tok)
- `materials.ts` — Exports createMaterial, updateMaterial, deleteMaterial, addStockQuantity + 2 more (~1420 tok)
- `orders.ts` — Exports updateOrderStatus, updateOrderNotes (~687 tok)
- `products.ts` — Exports ProductFormData, createProduct, updateProduct, deleteProduct, archiveProduct (~907 tok)

## app/admin/login/

- `page.tsx` — AdminLoginPage — renders form (~1002 tok)

## app/api/og/

- `route.tsx` — runtime (~1720 tok)

## app/api/translate/

- `route.ts` — Next.js API route: POST (~183 tok)

## components/admin/

- `AdminSidebar.tsx` — NAV_ITEMS (~1326 tok)
- `ArchiveBundleButton.tsx` — ArchiveBundleButton (~284 tok)
- `ArchiveProductButton.tsx` — ArchiveProductButton (~276 tok)
- `BundleForm.tsx` — Field (~3851 tok)
- `CatalogManager.tsx` — EMPTY_FORM (~6489 tok)
- `CreateOrderForm.tsx` — Input (~3824 tok)
- `DeleteGalleryItemButton.tsx` — DeleteGalleryItemButton (~281 tok)
- `DeleteProductButton.tsx` — DeleteProductButton (~263 tok)
- `GalleryItemForm.tsx` — GalleryItemForm (~2096 tok)
- `ImageUpload.tsx` — Single image mode (~1428 tok)
- `MaterialsManager.tsx` — stripLeadingZero (~4802 tok)
- `OrderStatusUpdate.tsx` — STATUS_OPTIONS (~1171 tok)
- `ProductFilters.tsx` — ProductFilters (~1559 tok)
- `ProductForm.tsx` — initBOMEntries (~5927 tok)
- `ProductionStatusButton.tsx` — ProductionStatusButton (~328 tok)

## components/cart/

- `CartDrawer.tsx` — CartDrawer (~2410 tok)
- `CartRecoveryPopup.tsx` — CartRecoveryPopup (~675 tok)
- `QuickAdd.tsx` — QuickAddOverlay (~2027 tok)

## components/catalog/

- `ExpandingEventCards.tsx` — ExpandingEventCards (~1525 tok)
- `ProductCard.tsx` — ProductCard (~888 tok)

## components/home/

- `AboutSection.tsx` — STATS (~749 tok)
- `HeroSection.tsx` — HeroSection (~1334 tok)
- `InspirationSection.tsx` — QUOTE_HE (~590 tok)
- `WhySection.tsx` — WhySection (~771 tok)

## components/layout/

- `BottomNav.tsx` — BottomNav (~433 tok)
- `Footer.tsx` — Footer (~636 tok)
- `Navbar.tsx` — Navbar (~1620 tok)
- `WhatsAppButton.tsx` — WHATSAPP_NUMBER (~870 tok)

## components/product/

- `ProductAddToCart.tsx` — ProductAddToCart (~1201 tok)
- `ProductCustomizeAndAdd.tsx` — ALLOWED_MIME (~3327 tok)
- `ProductImageGallery.tsx` — ProductImageGallery (~576 tok)

## contexts/

- `CartContext.tsx` — STORAGE_KEY (~2070 tok)

## design-references/

- `ExpandingCards.tsx` — ExpandingCards (~1159 tok)

## hooks/

- `useAutoTranslate.ts` — Schedule a he→en translation. (~350 tok)

## i18n/

- `request.ts` (~114 tok)
- `routing.ts` — Exports routing (~41 tok)

## lib/

- `phone.ts` — Exports sanitizePhone, isValidPhone, PHONE_ERROR_HE, PHONE_ERROR_EN (~102 tok)
- `utils.ts` — Exports cn (~49 tok)

## lib/supabase/

- `client.ts` — Exports createClient (~62 tok)
- `server.ts` — Exports createClient (~176 tok)

## messages/

- `en.json` (~974 tok)
- `he.json` (~883 tok)

## supabase/migrations/

- `001_initial_schema.sql` — ============================================================ (~3133 tok)
- `002_atmosphere_image.sql` — Migration 002: Add atmosphere_image to event_types (~34 tok)
