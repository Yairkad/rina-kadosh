// app/api/keep-alive/route.ts
// Weekly ping to Supabase so the free-tier project doesn't get auto-paused.
//
// Env vars needed:
//   {{SUPABASE_URL_VAR}}
//   {{SUPABASE_ANON_KEY_VAR}}
//   CRON_SECRET — you must create this yourself in Vercel → Project Settings →
//                 Environment Variables. Vercel does NOT generate it automatically;
//                 once it exists, Vercel automatically sends it as the Authorization
//                 Bearer header on cron-triggered requests to this route.
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    // Fail closed in production: an unset secret must not silently open the endpoint.
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json(
        { error: "CRON_SECRET is not set — add it in Vercel Project Settings → Environment Variables" },
        { status: 500 }
      );
    }
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.{{SUPABASE_URL_VAR}}!,
    process.env.{{SUPABASE_ANON_KEY_VAR}}!
  );

  const { data, error } = await supabase
    .from("{{TABLE_NAME}}")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString(), rows: data?.length ?? 0 });
}
