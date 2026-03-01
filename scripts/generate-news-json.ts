import fs from "node:fs/promises";
import path from "node:path";

import { getNews } from "../src/lib/news";

async function main() {
  const payload = await getNews(true);

  const outPath = path.join(process.cwd(), "public", "news.json");
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");

  const okCount = payload.feedHealth.filter((h) => h.status === "ok").length;
  const failCount = payload.feedHealth.filter((h) => h.status === "error").length;

  console.log(
    `Generated ${payload.articles.length} tracked articles in public/news.json ` +
      `(${okCount} feeds ok, ${failCount} failed)`,
  );

  if (failCount > 0) {
    for (const h of payload.feedHealth) {
      if (h.status === "error") {
        console.warn(`  [FAIL] ${h.source}: ${h.errorMessage}`);
      }
    }
  }
}

main().catch((error) => {
  console.error("Failed to generate news.json", error);
  process.exitCode = 1;
});
