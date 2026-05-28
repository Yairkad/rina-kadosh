# Cerebrum

> OpenWolf's learning memory. Updated automatically as the AI learns from interactions.
> Do not edit manually unless correcting an error.
> Last updated: 2026-05-28

## User Preferences

- **המשתמש הוא גבר** — לא להשתמש בלשון נקבה בפנייה אליו.
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
- **[2026-05-27] אל תשתמש ב-Get-ChildItem בכלי Bash** — PowerShell cmdlets לא עובדים ב-Bash tool. להשתמש ב-`find` או בכלי Glob.

## Decision Log

- **[2026-05-27] הסרת product_variants** — המשתמש הבהיר שכל מוצר קיים בסוג אחד. הטבלה נוספה בהצעה טכנית ונדחתה.
- **[2026-05-27] חבילות כסקשן לא דף** — שמירה על זרימת ניווט רציפה: event → style → מוצרים + חבילות יחד.
- **[2026-05-27] Cart: גם drawer וגם עמוד /cart** — המשתמש רוצה את שניהם. Drawer לחוויה מהירה, /cart לטופס מלא.
- **[2026-05-27] Hero — המתנה לתמונות** — לא לנעול עיצוב Hero לפני שיש תמונות מוצר. PrismaHero נדון אבל לא אומץ.
- **[2026-05-27] next-intl לדו-לשוניות** — עברית RTL ↔ אנגלית LTR, toggle ב-Navbar.
