import Parser from "rss-parser";

import {
  BROAD_US_TERMS,
  CONFLICT_TERMS,
  MEDIATOR_TERMS,
  FEEDS,
  FILTER_KEYWORDS,
  MAX_ARTICLES,
  PAYWALLED_SOURCES,
  REFRESH_INTERVAL_MS,
  type FeedSource,
} from "./config";
import { clampDescription, stripHtml } from "./html";

export { REFRESH_INTERVAL_MS } from "./config";

export type ArticleTag = "Critical" | "Developing" | "Update" | "Context";

export type NewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  logoUrl: string;
  publishedAt: string;
  tag: ArticleTag;
  paywalled: boolean;
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

const CRITICAL_TERMS = [
  /\bstrike[sd]?\b/i, /\battack(?:ed|s)?\b/i, /\bkill(?:ed|ing|s)?\b/i,
  /\bbomb(?:ed|ing|s)?\b/i, /\bcasualti?es\b/i, /\binvasion\b/i,
  /\bassault(?:ed|s)?\b/i, /\bemergency\b/i, /\bceasefire\s+(?:broken|collapse|end)/i,
  /\bwar\b/i, /\bdead\b/i, /\bdeath toll\b/i, /\bmassacre\b/i,
];

const DEVELOPING_TERMS = [
  /\bbreaking\b/i, /\bdeveloping\b/i, /\breports?\s+(?:say|suggest|indicate)/i,
  /\bunconfirmed\b/i, /\bsources?\s+say\b/i, /\btroops?\s+deploy/i,
  /\bescalat(?:ion|ing|es?)\b/i, /\bjust\s+in\b/i, /\bunfolding\b/i,
];

const CONTEXT_TERMS = [
  /\banalysis\b/i, /\bopinion\b/i, /\bexplainer\b/i, /\bcommentary\b/i,
  /\beditorial\b/i, /\bbackground\b/i, /\bwhat\s+to\s+know\b/i,
  /\bin\s+context\b/i, /\bhistory\s+of\b/i, /\bQ\s*&\s*A\b/i,
];

function matchesAny(terms: RegExp[], text: string): boolean {
  return terms.some((t) => t.test(text));
}

export function classifyArticle(title: string, description: string): ArticleTag {
  const combined = `${title} ${description}`;
  if (matchesAny(CRITICAL_TERMS, combined)) return "Critical";
  if (matchesAny(DEVELOPING_TERMS, combined)) return "Developing";
  if (matchesAny(CONTEXT_TERMS, combined)) return "Context";
  return "Update";
}

export function isTracked(title: string, description: string): boolean {
  const text = `${title} ${description}`;
  const hasConflictTerm = CONFLICT_TERMS.some((t) => t.test(text));
  if (hasConflictTerm) return true;
  const hasBroadTerm =
    BROAD_US_TERMS.some((t) => t.test(text)) ||
    MEDIATOR_TERMS.some((t) => t.test(text));
  if (!hasBroadTerm) return false;
  // Broad/mediator country term found — only include if a conflict term is also present
  // (already checked above, so this is purely domestic news → exclude)
  return false;
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
        tag: classifyArticle(title, description),
        paywalled: PAYWALLED_SOURCES.has(feed.source),
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
