// pages/api/keep-alive.ts
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
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    // Fail closed in production: an unset secret must not silently open the endpoint.
    if (process.env.NODE_ENV === "production") {
      return res.status(500).json({
        error: "CRON_SECRET is not set — add it in Vercel Project Settings → Environment Variables",
      });
    }
  } else if (authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
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
    return res.status(500).json({ ok: false, error: error.message });
  }

  return res.status(200).json({ ok: true, checkedAt: new Date().toISOString(), rows: data?.length ?? 0 });
}
