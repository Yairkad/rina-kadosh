import { NextRequest } from "next/server";

export const runtime = "edge";

const PASSTHROUGH_HEADERS = ["content-type", "content-length", "content-range", "accept-ranges"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const upstreamUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${path.join("/")}`;

  const range = req.headers.get("range");
  const upstreamRes = await fetch(upstreamUrl, {
    headers: {
      "user-agent": req.headers.get("user-agent") ?? "Mozilla/5.0",
      ...(range ? { range } : {}),
    },
  });

  if (!upstreamRes.ok && upstreamRes.status !== 206) {
    return new Response("Not found", { status: 404 });
  }

  const headers = new Headers();
  for (const key of PASSTHROUGH_HEADERS) {
    const value = upstreamRes.headers.get(key);
    if (value) headers.set(key, value);
  }
  headers.set("cache-control", "public, max-age=31536000, immutable");

  return new Response(upstreamRes.body, { status: upstreamRes.status, headers });
}
