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
//
// This endpoint only reads already-public data with the anon key (no mutation,
// no PII), so it fails OPEN rather than closed: the whole point of this route
// is to stop Supabase from auto-pausing, and a missing/misconfigured secret
// must never silently defeat that — it only downgrades to a warning. If your
// table isn't public, add real auth instead of relaxing this.
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const authenticated = !cronSecret || authHeader === `Bearer ${cronSecret}`;

  if (!authenticated) {
    console.warn("[keep-alive] CRON_SECRET mismatch — ping still executed, but request was not verified as coming from Vercel Cron");
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
    return NextResponse.json({ ok: false, error: error.message, authenticated }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    checkedAt: new Date().toISOString(),
    rows: data?.length ?? 0,
    ...(cronSecret && !authenticated ? { warning: "CRON_SECRET mismatch — check Vercel env var" } : {}),
  });
}
