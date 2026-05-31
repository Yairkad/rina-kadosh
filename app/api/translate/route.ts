import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json();
    if (!text?.trim()) return NextResponse.json({ translation: "" });

    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text.slice(0, 500))}&langpair=he|en`;
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();
    const translation: string = data.responseData?.translatedText ?? "";

    return NextResponse.json({ translation });
  } catch {
    return NextResponse.json({ translation: "" }, { status: 500 });
  }
}
