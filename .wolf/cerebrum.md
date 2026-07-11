# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-05-28

## User Preferences

- **המשתמש הוא גבר** — לא להשתמש בלשון נקבה בפנייה אליו.
- **Vercel workflow:** אחרי כל `git push` — לבדוק סטטוס deployment ב-Vercel API. אם ERROR — לשלוף לוגים, לזהות errors, לתקן ולעשות push מחדש. הכל אוטומטי ללא שאלות למשתמש.
- **Supabase workflow:** (א) כשיש migration חדש — להריץ `mcp__supabase__apply_migration` לבד ללא אישור. (ב) אחרי כל migration — להריץ `mcp__supabase__get_advisors` ולבדוק אזהרות. אם יש — לדווח ולתקן. הכל אוטומטי.
- **סגנון תקשורת:** תמציתי וממוקד — לא לפרט יותר מדי, ישירות לעניין.
- **גישה לפיתוח:** לחשוב מראש על כל הקומפוננטות לפני תחילת קוד — לאסוף השראות תחילה.
- **סינון טכני:** כשמציגים רשימת שיפורים ארוכה — לסנן ולהסביר בקצרה מה כן/לא ומדוע.
- **עיצוב:** luxury + elegance + "wow ממבט ראשון". פלטה חמימה (לא קרה/סגולה). אנימציות מרשימות.
- **רספונסיביות:** חובה בכל דף — mobile-first עם עקביות ויזואלית ו-touch-friendly.

## Key Learnings

- **Project:** rina-kadosh
- **מבנה קטלוג:** 3 רמות — `/catalog` → `/catalog/[event]` → `/catalog/[event]/[style]` → `/catalog/[event]/[style]/[product]`. חבילות הן **סקשן** בתוך דף ה-style, לא דף נפרד.
- **אין product_variants:** כל מוצר קיים רק בסוג אחד מוגדר. אין גדלים/חומרים/וריאנטים.
- **מינימום הזמנה:** כל מוצר מגדיר `min_type: 'units' | 'amount'` + `min_value` — ולידציה בזמן אמת.
- **חבילה בסל:** ישות אחת (`is_bundle: true`), לא מתפרקת — כדי לשמור על תמחור החבילה.
- **Cart Drawer:** צד בדסקטופ, bottom sheet במובייל. כפתור צף + עמוד /cart נפרד — שניהם.
- **Quick-add:** desktop = hover overlay עם counter; mobile = כפתור `+` → mini modal.
- **סטטוס מוצר:** `draft | published | archived` — לא boolean.
- **Admin auth:** `profiles.is_admin` boolean — לא full RBAC.
- **תמונות:** `images[0]` = thumbnail. WebP/AVIF, srcset, blur placeholder.
- **מספור הזמנות:** פורמט `RK-YYYYMMDD-XXX`.
- **Design reference — ExpandingCards:** `design-references/ExpandingCards.tsx` — כרטיסי grid עם הרחבה ב-hover. טרם הוחלט באיזה רמת קטלוג ישמש.
- **Hero — PrismaHero:** נדון בשיחה, המשתמש אהב את ה-wow factor אבל הפלטה הקרה/סגולה לא מתאימה. Hero סופי ממתין לתמונות מוצר.

## Do-Not-Repeat

- **[2026-05-27] אל תפנה למשתמש בלשון נקבה** — המשתמש הוא גבר. תמיד לשון זכר.
- **[2026-05-27] אל תוסיף טבלת product_variants** — המשתמש ביטל את הרעיון. כל מוצר קיים בסוג אחד מוגדר בלבד, אין גרסאות שונות.
- **[2026-05-27] חבילות אינן דף נפרד** — חבילות הן סקשן בתוך `/catalog/[event]/[style]`, לא `/bundles` עצמאי.
- **[2026-05-27] אל תציע Full RBAC / role system** — מנהל יחיד (רינה), is_admin boolean מספיק.
- **[2026-05-28] Supabase: RLS + GRANT שניהם נדרשים** — RLS policy לבד לא מספיק. חובה גם `GRANT SELECT ON table TO anon, authenticated` אחרת מקבלים `permission denied`. זה חל על כל טבלה חדשה שנוצרת.
- **[2026-05-28] ExpandingCards שייך לדף הבית** — המשתמש הבהיר שבחירת סוג אירוע עם הקומפוננטה צריכה להיות ישירות בדף הבית מתחת להירו, לא רק ב-/catalog.
- **[2026-05-28] Remove-Item עם סוגריים מרובעים** — PowerShell מפרש `[locale]` כ-wildcard. תמיד להשתמש ב-`-LiteralPath` כשהנתיב מכיל סוגריים מרובעים.
- **[2026-05-28] gallery_items סכמה שונה** — הטבלה כוללת `images` (ARRAY), `title_he`, `title_en`, `active` — לא `image_url`/`alt_he`/`alt_en`/`is_featured`.
- **[2026-05-28] אל תשתמש ב-Get-ChildItem בכלי Bash** — PowerShell cmdlets לא עובדים ב-Bash tool. להשתמש ב-`find` או בכלי Glob.
- **[2026-06-30] design_styles.slug אינו unique גלובלי** — הייחוד הוא `(event_type_id, slug)`. כל query על design_styles לפי slug בלבד חייב להוסיף `.eq("event_type_id", ...)` כדי למנוע PGRST116 כשיש מספר event_types עם אותו style slug.
- **[2026-06-30] חסר not-found.tsx** — ללא קובץ זה Next.js מנסה להציג 404 ברמת ה-document ומחוץ ל-locale layout, מה שגורם ל-HierarchyRequestError. חייב ליצור `app/[locale]/not-found.tsx`.
- **[2026-07-11] orders: WHEN clause בטריגר לא מטפל ב-NULL** — `trg_orders_order_number` רץ רק `WHEN (NEW.order_number = '')`. כש-order_number לא נשלח בכלל בעץ ה-insert הוא NULL, ו-`NULL = ''` ב-SQL הוא NULL (לא true) — אז הטריגר לא רץ ו-NOT NULL constraint נכשל. app/admin/actions/create-order.ts עבד כי הוא שולח `order_number: ""` במפורש; app/actions/submit-order.ts (העגלה הציבורית) לא שלח בכלל — נשבר תמיד, מוסתר עד עכשיו מאחורי bug-096 (GRANT). **מסקנה: כל INSERT חדש לטבלת orders (או טבלה עם טריגר דומה) חייב לשלוח את השדה במפורש כמו שdefault-ה-trigger מצפה, אל תניח ש-omit==empty-string ב-SQL.**
- **[2026-07-11] orders: RLS policy לבד לא הספיק גם כאן** — בדיוק כמו gallery_items (2026-05-28): migration 001 יצרה RLS policy "orders: anon insert" אבל בלי `GRANT INSERT ON orders TO anon` — ולכן שליחת הזמנה מהעגלה נכשלה עם "permission denied for table orders" (הוצג למשתמש כשגיאה כללית). תוקן ב-`007_orders_anon_insert_grant.sql`. **מסקנה כללית: בכל טבלה חדשה או קיימת שצריכה גישת anon — לבדוק גם RLS policy וגם GRANT, אל תניח שאחד מהם מספיק.**
- **[2026-07-11] order-status page חסר RLS/GRANT לגמרי (טרם תוקן)** — `app/[locale]/(public)/order-status/page.tsx` מבצע `.from("orders").select(...).eq(order_number).eq(customer_email).single()` כ-anon, אבל אין שום anon SELECT policy על orders (רק "orders: admin all" ל-authenticated). כרגע הפיצ'ר הזה כנראה שבור. **אזהרה: אסור לתקן עם `USING (true)` — זה יחשוף את כל טבלת ההזמנות (שם/טלפון/אימייל/כתובת) לכל מי שיקרא ל-REST API בלי הפילטרים.** הפתרון הנכון: server action עם service role שמאמת התאמת order_number+email בצד השרת ומחזיר רק שדות בטוחים — בדיוק כמו app/actions/submit-order.ts.
- **[2026-07-11] Storage buckets גם צריכים RLS policy — לא רק טבלאות** — כל bucket חדש ב-Supabase Storage שנגיש ל-`anon` (למשל "logos" בתהליך ההזמנה הציבורי) חייב policies מפורשים על `storage.objects` (INSERT/SELECT ל-anon), אחרת מתקבל 400 מה-Storage API. buckets שמשמשים רק את הפאנל המנהלי (products/catalog/gallery) עובדים כי הם נגישים רק ב-authenticated context — לא הוכיח שה-RLS מוגדר נכון ל-anon. תמיד לבדוק/להוסיף migration עם `storage.objects` policies כשמוסיפים bucket חדש שנגיש ללקוחות לא-מחוברים.

## Key Learnings (עדכון 2026-05-28)

- **מבנה app/**: `app/[locale]/(public)/` לדפים ציבוריים, `app/[locale]/layout.tsx` מחזיק CartProvider+CartDrawer+CartRecoveryPopup.
- **ExpandingCards**: משמש בדף הבית ישירות מתחת להירו (לא רק ב-/catalog). בחירת סגנון = גריד פשוט.
- **ProductCard**: aspect-ratio 4/5, rounded-xl, QuickAddOverlay בdesktop hover, QuickAddMobileButton בmobile.
- **CartContext**: localStorage key `rina-kadosh-cart`, פג תוקף 7 ימים, ולידציית min_type/min_value.
- **Supabase MCP**: HTTP transport, צריך אימות מחדש בכל reload של IDE. auth זמני לסשן בלבד.
- **WhatsApp**: `972533721938` (NEXT_PUBLIC_WHATSAPP_NUMBER).
- **design-references/**: מוחרג מ-tsconfig כדי שלא ייכלל ב-build.

## Decision Log

- **[2026-05-27] הסרת product_variants** — המשתמש הבהיר שכל מוצר קיים בסוג אחד. הטבלה נוספה בהצעה טכנית ונדחתה.
- **[2026-05-27] חבילות כסקשן לא דף** — שמירה על זרימת ניווט רציפה: event → style → מוצרים + חבילות יחד.
- **[2026-05-27] Cart: גם drawer וגם עמוד /cart** — המשתמש רוצה את שניהם. Drawer לחוויה מהירה, /cart לטופס מלא.
- **[2026-05-27] Hero — המתנה לתמונות** — לא לנעול עיצוב Hero לפני שיש תמונות מוצר. PrismaHero נדון אבל לא אומץ.
- **[2026-05-27] next-intl לדו-לשוניות** — עברית RTL ↔ אנגלית LTR, toggle ב-Navbar.
