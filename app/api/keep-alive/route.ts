// Weekly ping to Supabase so the free-tier project doesn't get auto-paused
// after 7 days of inactivity. Triggered by the Vercel Cron in vercel.json.
import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Vercel sets CRON_SECRET automatically once a cron is configured.
  // This blocks randoms from hitting the endpoint and spamming the DB.
  const authHeader = req.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data, error } = await supabase
    .from("event_types")
    .select("id")
    .limit(1);

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, checkedAt: new Date().toISOString(), rows: data?.length ?? 0 });
}
