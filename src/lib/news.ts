import Parser from "rss-parser";

export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

const TRACKING_TERMS = [
  /\bisrael\b/i,
  /\biran\b/i,
  /\busa\b/i,
  /\bu\.?s\.?a?\.?\b/i,
  /\bunited states\b/i,
  /\bamerican\b/i,
];

const MAX_DESCRIPTION_LENGTH = 180;
const MAX_ARTICLES = 42;

const FEEDS = [
  {
    source: "BBC",
    url: "https://feeds.bbci.co.uk/news/world/middle_east/rss.xml",
    logoUrl: "https://news.bbcimg.co.uk/nol/shared/img/bbc_news_120x60.gif",
  },
  {
    source: "The New York Times",
    url: "https://rss.nytimes.com/services/xml/rss/nyt/MiddleEast.xml",
    logoUrl: "https://static01.nyt.com/images/misc/NYT_logo_rss_250x40.png",
  },
  {
    source: "The Guardian",
    url: "https://www.theguardian.com/world/rss",
    logoUrl:
      "https://assets.guim.co.uk/images/guardian-logo-rss.c45beb1bafa34b347ac333af2e6fe23f.png",
  },
  {
    source: "Al Jazeera",
    url: "https://www.aljazeera.com/xml/rss/all.xml",
    logoUrl: "https://www.aljazeera.com/images/logo_aje.png",
  },
  {
    source: "The Hindu",
    url: "https://www.thehindu.com/news/international/feeder/default.rss",
    logoUrl: "https://www.thehindu.com/theme/images/th-online/thehindu-logo.svg",
  },
  {
    source: "Indian Express",
    url: "https://indianexpress.com/section/world/feed/",
    logoUrl:
      "https://indianexpress.com/wp-content/themes/indianexpress/images/indian-express-logo-n.svg",
  },
  {
    source: "NDTV",
    url: "https://feeds.feedburner.com/ndtvnews-world-news",
    logoUrl: "https://drop.ndtv.com/homepage/images/ndtvlogo23march.png",
  },
  {
    source: "Times of India",
    url: "https://timesofindia.indiatimes.com/rssfeeds/296589292.cms",
    logoUrl: "https://static.toiimg.com/photo/47529300.cms",
  },
  {
    source: "Hindustan Times",
    url: "https://www.hindustantimes.com/feeds/rss/world-news/rssfeed.xml",
    logoUrl: "https://www.hindustantimes.com/res/images/ht-logo.svg",
  },
];

export type NewsArticle = {
  id: string;
  title: string;
  description: string;
  url: string;
  source: string;
  logoUrl: string;
  publishedAt: string;
};

export type NewsResponse = {
  articles: NewsArticle[];
  updatedAt: string;
  refreshIntervalMs: number;
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

function decodeHtml(value: string): string {
  const decoded = value
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  return decoded;
}

function stripHtml(value: string): string {
  return decodeHtml(value.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

function clampDescription(value: string): string {
  if (value.length <= MAX_DESCRIPTION_LENGTH) {
    return value;
  }

  return `${value.slice(0, MAX_DESCRIPTION_LENGTH).trimEnd()}...`;
}

function isTracked(text: string): boolean {
  return TRACKING_TERMS.some((term) => term.test(text));
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

async function fetchFromFeed(feed: (typeof FEEDS)[number]): Promise<NewsArticle[]> {
  const rss = await parser.parseURL(feed.url);

  return (rss.items ?? [])
    .map((item) => {
      const title = stripHtml(item.title ?? "");
      const description = stripHtml(
        item.contentSnippet ?? item.summary ?? item.description ?? item.content ?? "",
      );
      const combinedText = `${title} ${description}`;

      if (!title || !item.link || !isTracked(combinedText)) {
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

function dedupeByLink(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();

  return articles.filter((article) => {
    if (seen.has(article.url)) {
      return false;
    }

    seen.add(article.url);
    return true;
  });
}

function buildPayload(articles: NewsArticle[]): NewsResponse {
  return {
    articles,
    updatedAt: new Date().toISOString(),
    refreshIntervalMs: REFRESH_INTERVAL_MS,
    filters: {
      language: "English",
      keywords: ["Israel", "Iran", "USA"],
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

  const merged = dedupeByLink(
    results
      .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, MAX_ARTICLES),
  );

  const payload = buildPayload(merged);

  cache = {
    payload,
    expiresAt: now + REFRESH_INTERVAL_MS,
  };

  return payload;
}
