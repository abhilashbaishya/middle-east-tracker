import Parser from "rss-parser";

import {
  FEEDS,
  FILTER_KEYWORDS,
  MAX_ARTICLES,
  REFRESH_INTERVAL_MS,
  TRACKING_TERMS,
  type FeedSource,
} from "./config";
import { clampDescription, stripHtml } from "./html";

export { REFRESH_INTERVAL_MS } from "./config";

export type NewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  logoUrl: string;
  publishedAt: string;
};

export type FeedHealth = {
  source: string;
  status: "ok" | "error";
  articleCount: number;
  errorMessage?: string;
};

export type NewsResponse = {
  articles: NewsArticle[];
  updatedAt: string;
  refreshIntervalMs: number;
  feedHealth: FeedHealth[];
  filters: {
    language: "English";
    keywords: string[];
    outlets: string[];
  };
};

type CacheState = {
  expiresAt: number;
  payload: NewsResponse;
};

let cache: CacheState | null = null;

const parser = new Parser<
  {
    source: string;
    logoUrl: string;
  },
  {
    content?: string;
    contentSnippet?: string;
    summary?: string;
    description?: string;
    pubDate?: string;
    isoDate?: string;
    link?: string;
    guid?: string;
    title?: string;
  }
>({
  timeout: 10_000,
});

export function isTracked(title: string, description: string): boolean {
  if (TRACKING_TERMS.some((term) => term.test(title))) return true;
  return TRACKING_TERMS.some((term) => term.test(description));
}

function toIsoDate(rawDate?: string): string {
  if (!rawDate) {
    return new Date(0).toISOString();
  }

  const date = new Date(rawDate);

  if (Number.isNaN(date.getTime())) {
    return new Date(0).toISOString();
  }

  return date.toISOString();
}

async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  retries = 2,
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < retries) {
        const delay = Math.pow(2, attempt) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}

async function fetchFromFeed(feed: FeedSource): Promise<NewsArticle[]> {
  const rss = await fetchWithRetry(() => parser.parseURL(feed.url));

  return (rss.items ?? [])
    .map((item) => {
      const title = stripHtml(item.title ?? "");
      const description = stripHtml(
        item.contentSnippet ?? item.summary ?? item.description ?? item.content ?? "",
      );

      if (!title || !item.link || !isTracked(title, description)) {
        return null;
      }

      const publishedAt = toIsoDate(item.isoDate ?? item.pubDate);

      return {
        id: item.guid ?? `${feed.source}-${item.link}`,
        title,
        description: clampDescription(description),
        url: item.link,
        source: feed.source,
        logoUrl: feed.logoUrl,
        publishedAt,
      } satisfies NewsArticle;
    })
    .filter((item): item is NewsArticle => item !== null);
}

export function dedupeByLink(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();

  return articles.filter((article) => {
    if (seen.has(article.url)) {
      return false;
    }

    seen.add(article.url);
    return true;
  });
}

function buildPayload(articles: NewsArticle[], feedHealth: FeedHealth[]): NewsResponse {
  return {
    articles,
    updatedAt: new Date().toISOString(),
    refreshIntervalMs: REFRESH_INTERVAL_MS,
    feedHealth,
    filters: {
      language: "English",
      keywords: FILTER_KEYWORDS,
      outlets: FEEDS.map((feed) => feed.source),
    },
  };
}

export async function getNews(forceRefresh = false): Promise<NewsResponse> {
  const now = Date.now();

  if (!forceRefresh && cache && cache.expiresAt > now) {
    return cache.payload;
  }

  const results = await Promise.allSettled(FEEDS.map((feed) => fetchFromFeed(feed)));

  const feedHealth: FeedHealth[] = results.map((result, index) => {
    const feed = FEEDS[index];
    if (result.status === "fulfilled") {
      return {
        source: feed.source,
        status: "ok" as const,
        articleCount: result.value.length,
      };
    }

    return {
      source: feed.source,
      status: "error" as const,
      articleCount: 0,
      errorMessage: result.reason instanceof Error ? result.reason.message : String(result.reason),
    };
  });

  const failedFeeds = feedHealth.filter((h) => h.status === "error");
  if (failedFeeds.length > 0) {
    console.warn(
      `[news] ${failedFeeds.length}/${FEEDS.length} feeds failed:`,
      failedFeeds.map((f) => `${f.source}: ${f.errorMessage}`).join("; "),
    );
  }

  const merged = dedupeByLink(
    results
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, MAX_ARTICLES),
  );

  const payload = buildPayload(merged, feedHealth);

  cache = {
    payload,
    expiresAt: now + REFRESH_INTERVAL_MS,
  };

  return payload;
}
