import fs from "node:fs/promises";
import path from "node:path";

import { NewsDashboard } from "@/components/news-dashboard";
import type { NewsResponse } from "@/lib/news";

const FALLBACK_PAYLOAD: NewsResponse = {
  articles: [],
  updatedAt: new Date(0).toISOString(),
  refreshIntervalMs: 5 * 60 * 1000,
  filters: {
    language: "English",
    keywords: ["Israel", "Iran", "USA"],
    outlets: [],
  },
};

export default async function Home() {
  let initialPayload = FALLBACK_PAYLOAD;

  try {
    const raw = await fs.readFile(path.join(process.cwd(), "public", "news.json"), "utf8");
    initialPayload = JSON.parse(raw) as NewsResponse;
  } catch {
    initialPayload = FALLBACK_PAYLOAD;
  }

  return <NewsDashboard initialPayload={initialPayload} />;
}
