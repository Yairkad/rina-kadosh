---
name: supabase-keepalive
description: Use this skill whenever the user wants to prevent a Supabase project from being auto-paused due to inactivity (Supabase free tier pauses projects after ~7 days with no activity). Trigger on phrases like "supabase paused", "keep supabase alive", "vercel cron for supabase", "מניעת חסימת סופאבייס", "שמירת דאטהבייס פעיל", or when the user asks to set up a weekly/scheduled ping to a database hosted on Supabase and deployed via Vercel. This skill walks through checking each project for what's missing (framework, existing Supabase connection, env vars, Vercel account access), asks the user to fill gaps or provide credentials, then generates the API route + vercel.json cron config needed. If the environment has direct write/git access to the repo (e.g. a coding agent with filesystem + git tools), it writes the files in place and offers to commit; otherwise it hands the user ready-to-commit files.
---

# Supabase Keep-Alive Setup

Goal: for each of the user's Vercel-hosted projects backed by Supabase, create a weekly Vercel Cron Job that hits an API route which performs a trivial Supabase query (a `select ... limit 1`), so Supabase never sees 7 days of total inactivity and pauses the project.

Work through **one project at a time**. Don't batch-guess across projects — each one may use a different framework, have a different table, or already have partial setup.

## Step 1 — Discover what exists

For the project in question, check (via reading the repo if shared/accessible, or by asking if not):

1. **Framework**: Next.js (App Router `/app` or Pages Router `/pages`), plain Node/Express, or something else.
2. **Existing Supabase client**: search for `@supabase/supabase-js`, a `supabaseClient.ts/js`, or existing Supabase URL/key env var references in the code or `.env` files. Note the **exact env var names already in use** (e.g. some projects use `NEXT_PUBLIC_SUPABASE_URL`, others plain `SUPABASE_URL`) — Step 3 must reuse these, not invent new ones.
3. **Existing `vercel.json`**: does one already exist? If so, read the whole file — the merge in Step 3 must preserve every existing top-level key (`regions`, `headers`, `rewrites`, other `crons` entries, etc.), not just append blindly.
4. **A safe table to query**: don't just ask an open-ended question. If you can read the repo, grep migrations/schema files (`supabase/migrations/*.sql`, `schema.sql`, ORM model files, etc.) for `CREATE TABLE`, and shortlist 2-3 small, low-risk candidates — prefer static/lookup tables (settings, categories, event types) over tables holding PII or core business data. Present the shortlist to the user to pick from (or let them name a different one) rather than guessing silently or asking a blank "what table?" question.

If the user hasn't shared the repo, ask these as a short batch of questions rather than one at a time — respect the user's stated preference for concise interaction.

## Step 2 — Fill the gaps

If the project has **no Supabase connection at all**:
- Ask the user for: the Supabase Project URL, the anon (or service role, if the query needs elevated rights — anon is enough for a `select`) API key, and confirm whether `@supabase/supabase-js` can be installed (it's an npm package, no extra approval needed beyond adding it to `package.json`).
- Never ask the user to paste secrets into chat if avoidable — prefer telling them exactly which Vercel dashboard field to put each value in (Project Settings → Environment Variables). If they do paste a key in chat, do not echo it back in full in your response.

If the project **already has a connection**, reuse the existing client/env var names instead of introducing new ones.

## Step 3 — Generate the files

Pick the matching template from `templates/` based on the framework detected in Step 1:

- `templates/nextjs-app-router.ts` → goes at `app/api/keep-alive/route.ts`
- `templates/nextjs-pages-router.ts` → goes at `pages/api/keep-alive.ts`
- `templates/node-express.js` → mount as a route in the existing Express app

Each template uses placeholder tokens — replace **every occurrence of each token**, including inside comments, not just in code:
- `{{TABLE_NAME}}` → the table chosen in Step 1.4
- `{{SUPABASE_URL_VAR}}` / `{{SUPABASE_ANON_KEY_VAR}}` → the project's actual existing env var names from Step 1.2 (or `SUPABASE_URL` / `SUPABASE_ANON_KEY` if this is a brand-new connection from Step 2)

Then merge the cron entry from `templates/vercel-json-snippet.json` into the project's `vercel.json`, **preserving all other existing keys and any other cron entries** (per Step 1.3). Default schedule: `0 3 * * *` (daily, 03:00 UTC) — adjust the hour only if the user asks. **Don't default to weekly.** Supabase's pause threshold is ~7 days of inactivity, so a weekly ping has zero safety margin: Hobby plan cron jobs aren't guaranteed to fire at an exact time (documented "flexible time window" — currently up to 1 hour, per Vercel's dashboard), and any single delayed, skipped, or transiently-failed run is then enough to tip the project over the threshold and get it paused anyway, even with otherwise-correct code and secrets. A daily ping needs several consecutive misses before that happens.

### CRON_SECRET — read carefully, this is a common misconception

Vercel does **not** auto-generate `CRON_SECRET`. The user must create it themselves (any random string) in Vercel → Project Settings → Environment Variables. Once it exists, Vercel automatically attaches it as an `Authorization: Bearer <value>` header on requests it makes to trigger the cron — that's the only part that's automatic.

The templates fail **closed**, not open: if `CRON_SECRET` is unset while `NODE_ENV === "production"`, the route returns an error instead of silently allowing unauthenticated access. (An earlier version of this skill checked `if (process.env.CRON_SECRET && authHeader !== ...)`, which meant an unset secret in production made the endpoint fully public with no warning — don't reintroduce that pattern.) Locally/in preview without the var set, the check is skipped so it's easy to test.

Always tell the user explicitly: **"You must add `CRON_SECRET` yourself in Vercel env vars — it is not created automatically."** Don't let them assume it's already handled.

If the target environment doesn't have Node type-checking available (`node_modules` not installed), don't try to run `tsc`/`npm run build` to verify — it'll fail for unrelated reasons (missing deps) and waste time. A visual read of the generated file against the template is sufficient.

## Step 4 — Apply the change

Check whether the current environment actually has write + git access to this repo (e.g. a coding agent with filesystem and git tools attached to a cloned working copy), as opposed to a chat-only context with no repo access.

**If direct repo access is available:** write the finished files (API route + updated `vercel.json`) directly into the repo. Do not commit or push without the user's go-ahead unless they've already established that convention for this session/branch. Then give the same manual checklist below for the parts that are inherently outside any coding agent's reach (Vercel dashboard settings).

**If there is no direct repo access** (e.g. plain chat, no connector, nothing to write to): present the finished files to the user as ready-to-commit content instead.

Either way, the checklist of what the user still must do manually:
- [ ] **Set `CRON_SECRET` in Vercel** (Project Settings → Environment Variables) — this is not automatic, see above
- [ ] Set any other new environment variables in Vercel, named exactly as used in the generated files
- [ ] Get the file(s) into the repo at the paths noted above, if not already done directly
- [ ] Commit + push / deploy (Vercel auto-deploys on push, which registers the cron)
- [ ] Confirm in Vercel → Project → Cron Jobs that the job appears after deploy

## Step 5 — Repeat per project

Ask if the user wants to move to the next project, and repeat Steps 1–4. Since each project lives under a different Vercel account/repo, don't assume env var names or table names carry over between projects.

## Notes

- Vercel Hobby (free) plan: up to 100 cron jobs per project, minimum cadence once/day — a weekly job is well within limits on every project's free tier as of Jan 2026.
- If a project isn't on Vercel at all (e.g., different host), the same idea applies but the scheduler differs (e.g., GitHub Actions `schedule:` cron, or the host's own cron feature) — ask before assuming Vercel.
