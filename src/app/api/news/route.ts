import { NextResponse } from "next/server";

import { getNews } from "@/lib/news";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get("refresh") === "true";

  try {
    const payload = await getNews(forceRefresh);
    return NextResponse.json(payload);
  } catch (error) {
    console.error("Failed to load news", error);

    return NextResponse.json(
      { message: "Failed to load live war coverage feed." },
      { status: 500 },
    );
  }
}
