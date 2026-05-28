# רינה קדוש / Rina Kadosh — מפרט פרויקט מלא

> אתר תדמית וקטלוג להזמנות — מוצרים מודפסים למיתוג ושדרוג אווירה באירועים
> (מזכרות, פליסמטים ממותגים, מארזים לשבת, ועוד)

---

## סטאק טכנולוגי

| שכבה | טכנולוגיה |
|------|------------|
| Framework | Next.js 14 (App Router) + TypeScript |
| Styling | Tailwind CSS + Framer Motion |
| Backend / DB | Supabase (PostgreSQL + Auth + Storage) |
| i18n | next-intl — עברית ↔ אנגלית |

**שפה:** דו-לשוני שווה, toggle בנאבר, עברית RTL / אנגלית LTR.
**אנימציות:** כניסת אלמנטים, מעברי עמוד, hover effects — Framer Motion.

---

## מבנה דפים

### ממשק ציבורי

| נתיב | תוכן |
|------|-------|
| `/` | דף הבית — Hero, אודות, מוצרים מובחרים, תצוגת גלריה, CTA |
| `/catalog` | בחירת סוג אירוע |
| `/catalog/[event]` | בחירת סגנון עיצוב |
| `/catalog/[event]/[style]` | **סקשן חבילות** + גריד מוצרים + quick-add |
| `/catalog/[event]/[style]/[product]` | דף מוצר מפורט |
| `/gallery` | גלריה — עבודות קודמות |
| `/cart` | עמוד סל + טופס הזמנה |
| `/order-status` | מעקב הזמנה — הזנת מספר הזמנה + מייל |
| `/contact` | צור קשר |

### ממשק ניהול — `/admin` (מוגן — Supabase Auth)

| נתיב | תוכן |
|------|-------|
| `/admin/login` | כניסה |
| `/admin` | Dashboard — סטטיסטיקות + הזמנות אחרונות |
| `/admin/orders` | רשימת הזמנות + חיפוש + פילטר |
| `/admin/orders/[id]` | פרטי הזמנה + שינוי סטטוס + הערות |
| `/admin/products` | רשימת מוצרים |
| `/admin/products/new` | הוספת מוצר + variants |
| `/admin/products/[id]` | עריכת מוצר + variants |
| `/admin/bundles` | ניהול חבילות |
| `/admin/gallery` | ניהול גלריה |
| `/admin/catalog` | ניהול event_types + design_styles |
| `/admin/production` | תור ייצור — מה לדפוס היום |

---

## מבנה קטלוג (3 רמות)

```
/catalog
  └─ /catalog/[event]                ← חתונה / בר מצווה / שבת / עסקי...
        └─ /catalog/[event]/[style]   ← קלאסי / מודרני / בוהו / רוסטיק...
              ├─ [סקשן חבילות לסגנון זה]
              └─ [גריד מוצרים + quick-add]
                    └─ /catalog/[event]/[style]/[product]
```

---

## מבנה דף `/catalog/[event]/[style]`

```
┌─────────────────────────────────────┐
│  Breadcrumb: קטלוג > חתונה > קלאסי  │
├─────────────────────────────────────┤
│  ✨ חבילות מומלצות לסגנון זה        │
│  [חבילה א'] [חבילה ב'] [חבילה ג']  │
├─────────────────────────────────────┤
│  כל המוצרים                         │
│  [פילטרים אם רלוונטי]               │
│  ┌──────┐ ┌──────┐ ┌──────┐         │
│  │מוצר א│ │מוצר ב│ │מוצר ג│         │
│  └──────┘ └──────┘ └──────┘         │
└─────────────────────────────────────┘
```

---

## סכמת מסד נתונים (Supabase / PostgreSQL)

### `event_types`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
name_he             text NOT NULL
name_en             text NOT NULL
slug                text UNIQUE NOT NULL
image               text
display_order       integer DEFAULT 0
status              text DEFAULT 'published'  -- draft | published | archived
seo_title_he        text    -- override ידני לכותרת גוגל
seo_title_en        text
seo_description_he  text
seo_description_en  text
og_image            text
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

### `design_styles`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
event_type_id       uuid REFERENCES event_types(id) ON DELETE CASCADE
name_he             text NOT NULL
name_en             text NOT NULL
slug                text NOT NULL
display_order       integer DEFAULT 0
status              text DEFAULT 'published'  -- draft | published | archived
seo_title_he        text
seo_title_en        text
seo_description_he  text
seo_description_en  text
og_image            text
updated_at          timestamptz DEFAULT now()

UNIQUE(event_type_id, slug)
```

### `products`
```sql
id                  uuid PRIMARY KEY DEFAULT gen_random_uuid()
name_he             text NOT NULL
name_en             text NOT NULL
description_he      text
description_en      text
price_per_unit      numeric(10,2) NOT NULL
cost_price          numeric(10,2)   -- מחיר עלות — לחישוב רווחיות בדשבורד
min_type            text CHECK (min_type IN ('units', 'amount'))
min_value           numeric(10,2)
event_type_id       uuid REFERENCES event_types(id)
design_style_id     uuid REFERENCES design_styles(id)
images              text[]   -- images[0] הוא תמיד ה-thumbnail הראשי
related_products    uuid[]   -- מזהי מוצרים משלימים / דומים
status              text DEFAULT 'draft'  -- draft | published | archived
seo_title_he        text
seo_title_en        text
seo_description_he  text
seo_description_en  text
og_image            text
deleted_at          timestamptz
created_at          timestamptz DEFAULT now()
updated_at          timestamptz DEFAULT now()
```

### `bundles`
```sql
id              uuid PRIMARY KEY DEFAULT gen_random_uuid()
name_he         text NOT NULL
name_en         text NOT NULL
description_he  text
description_en  text
images          text[]   -- images[0] הוא ה-thumbnail הראשי
items           jsonb NOT NULL
                -- [{product_id, product_name_he, quantity, price_per_unit, subtotal}]
bundle_price    numeric(10,2) NOT NULL
original_price  numeric(10,2)    -- לחישוב % חיסכון
event_type_id   uuid REFERENCES event_types(id)
design_style_id uuid REFERENCES design_styles(id)
status          text DEFAULT 'draft'  -- draft | published | archived
created_at      timestamptz DEFAULT now()
updated_at      timestamptz DEFAULT now()
```

### `orders`
```sql
id               uuid PRIMARY KEY DEFAULT gen_random_uuid()
order_number     text UNIQUE NOT NULL   -- RK-20240101-001
customer_name    text NOT NULL
customer_phone   text NOT NULL          -- מנורמל לפורמט ישראלי
customer_email   text NOT NULL
logo_url         text                   -- אופציונלי
special_requests text                   -- אופציונלי
items            jsonb NOT NULL
                 -- [{product_id, product_name_he, quantity,
                 --   price_per_unit, subtotal, is_bundle}]
total_amount     numeric(10,2)
delivery_method  text DEFAULT 'pickup'  -- pickup | delivery
delivery_address text                   -- אם delivery
delivery_notes   text                   -- הערות משלוח / זמן איסוף
status           text DEFAULT 'pending'
admin_notes      text
deleted_at       timestamptz            -- מחיקה רכה
created_at       timestamptz DEFAULT now()
updated_at       timestamptz DEFAULT now()
```

### `gallery_items`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
title_he      text
title_en      text
images        text[] NOT NULL
event_type_id uuid REFERENCES event_types(id)
active        boolean DEFAULT true
created_at    timestamptz DEFAULT now()
```

### `profiles` (משתמשי מערכת)
```sql
id         uuid PRIMARY KEY REFERENCES auth.users(id)
email      text NOT NULL
is_admin   boolean DEFAULT false
created_at timestamptz DEFAULT now()
```

### `audit_logs` (יומן פעולות)
```sql
id          uuid PRIMARY KEY DEFAULT gen_random_uuid()
entity_type text NOT NULL   -- 'order' | 'product' | 'bundle'
entity_id   uuid NOT NULL
action      text NOT NULL   -- 'status_change' | 'edit' | 'delete' | 'create'
old_data    jsonb
new_data    jsonb
created_by  uuid REFERENCES profiles(id)
created_at  timestamptz DEFAULT now()
```

---

## סטטוסי הזמנה

| ערך | עברית | English | צבע |
|-----|-------|---------|-----|
| `pending` | ממתין לאישור | Pending | אפור |
| `confirmed` | אושר | Confirmed | כחול |
| `in_production` | בייצור | In Production | כתום |
| `ready` | מוכן למסירה | Ready | ירוק בהיר |
| `delivered` | נמסר | Delivered | ירוק |
| `cancelled` | בוטל | Cancelled | אדום |

---

## זרימת לקוח — מגלישה להזמנה

```
דף הבית
  └─ CTA → קטלוג
        └─ בחירת אירוע → בחירת סגנון → דף style
              ├─ [חבילות מומלצות] — הוספה לסל בלחיצה אחת
              ├─ [גריד מוצרים] — Quick-add
              └─ [דף מוצר] — כמות + הוסף לסל

Floating Cart Button (badge עם מספר פריטים)
  └─ לחיצה → Cart Drawer נפתח
        ├─ רשימת פריטים + עריכת כמויות + סכום
        ├─ Cross-sell: "לקוחות שהזמינו אלו הזמינו גם..."
        └─ "שלח הזמנה" → /cart
              └─ סיכום סל + טופס
                    └─ שמירה ב-Supabase
                          └─ הודעת הצלחה + מספר הזמנה
```

---

## Quick-Add — הוספה מהירה מגריד

**Desktop** — hover על כרטיס:
- Overlay מונפש מכסה התמונה
- `[−]` `[כמות]` `[+]` + כפתור סל
- ולידציית מינימום בזמן אמת על הכרטיס

**Mobile** — כפתור `+` קבוע בפינת הכרטיס:
- לחיצה פותחת mini modal עם בחירת כמות + אישור

---

## טופס הזמנה (`/cart`)

| שדה | סוג |
|-----|-----|
| שם מלא | חובה |
| טלפון | חובה |
| אימייל | חובה |
| איסוף / משלוח | חובה — בחירה בין pickup לdelivery |
| כתובת משלוח | חובה רק אם נבחר משלוח |
| הערות משלוח / זמן איסוף | אופציונלי |
| העלאת לוגו | אופציונלי (Supabase Storage) |
| בקשות מיוחדות | אופציונלי |

סיכום הסל מוצג בצד — read-only.
לאחר שליחה: הודעת הצלחה + מספר הזמנה (RK-YYYYMMDD-XXX).

---

## מינימום הזמנה

- כל מוצר מגדיר `min_type` ו-`min_value` בנפרד
- `units` — מינימום יחידות, לדוגמה: מינ' 20 יח'
- `amount` — מינימום סכום, לדוגמה: מינ' ₪300
- ולידציה בזמן אמת בדף המוצר ובכרטיס (quick-add)
- הודעת שגיאה ברורה עם פירוט המינימום

---

## חבילות והצעות חכמות

### חבילות (מנוהלות ב-`/admin/bundles`)
- מוצגות בסקשן ייעודי בראש `/catalog/[event]/[style]`
- badge "חבילה" + מחיר מיוחד + % חיסכון ממחיר מקורי
- **חבילה = ישות אחת בסל** (`is_bundle: true`) — לא מתפרקת לפריטים בודדים
- מניעת שבירת מחיר המבצע: הלקוח לא יכול להסיר פריט בודד מתוך חבילה
- בסל ובטופס ההזמנה מוצגת כ-item אחד עם שם החבילה ורשימת פריטים מקופלת

### Cross-sell ב-Drawer הסל
- "לקוחות שהזמינו אלו הזמינו גם..."
- מבוסס על `related_products[]` של הפריטים בסל

### דף מוצר מפורט
- **"מוצרים משלימים"** — מ-`related_products[]`
- **"מוצרים דומים"** — מוצרים באותו `design_style_id`

---

## ממשק ניהול

### Dashboard
- כרטיסי KPI: סה"כ הזמנות, הכנסה כוללת, רווח כולל (לפי cost_price), ממתינות לאישור
- גרף הזמנות לפי חודש
- 5 הזמנות אחרונות עם קישור מהיר

### ניהול הזמנות
- טבלה: מספר, שם לקוח, תאריך, סכום, סטטוס, פעולות
- חיפוש חופשי + פילטר לפי סטטוס
- שינוי סטטוס inline בטבלה
- דף פרטים: פרטי לקוח + רשימת פריטים + לוגו + הערות מנהל
- ייצוא לכל ההזמנות / לפי פילטר → CSV

### ניהול מוצרים
- CRUD מלא — מוצר הוא ישות שיווקית, variants הם הישות התפעולית
- העלאת תמונות מרובות לכל מוצר (Supabase Storage, drag & drop)
- בחירת event_type + design_style
- סימון related_products (multi-select)
- שדות SEO override לכל מוצר
- סטטוס: draft → published → archived

### תור ייצור (`/admin/production`)
- רשימת הזמנות בסטטוס `confirmed` ו-`in_production`
- ממויין לפי תאריך אירוע / דחיפות
- מציג: מוצרים לדפוס, כמויות, הערות מיוחדות
- סינון לפי סטטוס + תאריך

### ניהול חבילות
- יצירת חבילה — בחירת מוצרים + כמויות
- הגדרת bundle_price + original_price
- שיוך ל-event_type + design_style

### ניהול קטלוג
- CRUD עבור event_types (שם עברית/אנגלית + תמונה + סדר)
- CRUD עבור design_styles לכל אירוע

### יצירת הזמנה ידנית (`/admin/create-order`)
- רינה פותחת הזמנה עבור לקוחה שדיברה איתה בטלפון
- בחירת מוצרים + כמויות, מילוי פרטי לקוחה
- שמירה ישירה עם סטטוס `confirmed`

---

## רספונסיביות ועיצוב

**עיקרון:** Mobile-first. שמירה על עקביות ויזואלית בין מכשירים — אותו עיצוב, מותאם touch.

| אלמנט | Mobile | Tablet | Desktop |
|-------|--------|--------|---------|
| גריד מוצרים | 1–2 עמודות | 2–3 עמודות | 3–4 עמודות |
| ניווט | Bottom navigation | Header מקוצר | Header מלא |
| Quick-add | כפתור `+` + mini modal | כפתור `+` + mini modal | Hover overlay |
| Cart | Drawer מלמטה (bottom sheet) | Drawer מהצד | Drawer מהצד |
| טיפוגרפיה | גדולה, קריאה | בינונית | רגילה |
| כפתורים | גדולים, ידידותיים לאצבע | גדולים | רגילים |

---

## דרישות כלליות

- **אבטחה:** Supabase Auth (email + password) לאדמין, RLS על טבלאות רגישות, MIME validation + הגבלת גודל בהעלאות קבצים
- **הגנה על טפסים ציבוריים:** Rate limiting על טופס ההזמנה, Invisible CAPTCHA (reCAPTCHA v3), Honeypot field נסתר, הגבלת העלאות לפי IP
- **Loading states:** Skeleton loaders, spinners, disabled states בטפסים
- **Error handling:** Toast notifications לשגיאות ולהצלחות, fallback UI לשגיאות רשת
- **אנימציות:** Framer Motion — כניסת אלמנטים, מעברי עמוד, hover, drawer
- **מחיקה רכה:** `deleted_at` על orders ו-products — לא נמחק אמיתית לעולם
- **יומן פעולות:** כל שינוי סטטוס, עריכה, מחיקה נרשמים ב-`audit_logs`

---

## SEO

- Dynamic metadata לכל דף קטלוג (event + style + product)
- **Override ידני:** לכל event / style / product אפשר לדרוס את הכותרת והניאור האוטומטיים
- Open Graph images אוטומטיים
- `sitemap.xml` דינמי — מתעדכן אוטומטית עם מוצרים חדשים
- `robots.txt` — קטלוג כן, אדמין לא
- Breadcrumb schema.org
- Canonical URLs
- **חיפוש:** Postgres `pg_trgm` (trigram similarity) — מטפל בשגיאות כתיב ועברית ללא תלות חיצונית

---

## תמונות

- פורמט: WebP ראשי, AVIF אם נתמך
- גדלים: thumbnail (400px) / card (800px) / fullscreen (1600px)
- טעינה: blur placeholder → תמונה מלאה
- `srcset` לכל גדלי מסך
- Lazy loading מחוץ לתצוגה הראשונית

---

## שמירת עגלה אוטומטית

- הסל נשמר ב-`localStorage` בכל שינוי
- כשלקוחה חוזרת לאתר — popup: "יש לך עגלה שמורה, רוצה להמשיך?"
- ניקוי אוטומטי אחרי 7 ימים

---

## מיילים

| אירוע | נמען | תוכן |
|-------|------|------|
| הזמנה נשלחה | לקוחה | אישור קבלה + מספר הזמנה |
| הזמנה נשלחה | רינה | התראה על הזמנה חדשה |
| סטטוס → `ready` | לקוחה | "ההזמנה שלך מוכנה לאיסוף / למשלוח" |

---

## WhatsApp

- כפתור WhatsApp צף בכל הדפים הציבוריים
- פותח שיחה ישירה עם רינה

---

## מעקב הזמנה (`/order-status`)

- הלקוחה מזינה מספר הזמנה + מייל
- רואה: סטטוס נוכחי, תאריך הזמנה, פריטים שהוזמנו
- ללא צורך בחשבון / login

---

## צור קשר (`/contact`)

- טלפון, מייל, WhatsApp
- טופס פנייה (שם + מייל + הודעה)
- מפה / כתובת (אם רלוונטי)
