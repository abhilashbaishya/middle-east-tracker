export const REFRESH_INTERVAL_MS = 5 * 60 * 1000;
export const MAX_DESCRIPTION_LENGTH = 180;
export const MAX_ARTICLES = 42;

export type FeedSource = {
  source: string;
  url: string;
  logoUrl: string;
};

export const FEEDS: readonly FeedSource[] = [
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
  {
    source: "Reuters",
    url: "https://news.google.com/rss/search?q=when:24h+allinurl:reuters.com&ceid=US:en&hl=en-US&gl=US",
    logoUrl: "https://www.reuters.com/pf/resources/images/reuters/reuters-default.webp",
  },
  {
    source: "AP News",
    url: "https://news.google.com/rss/search?q=when:24h+allinurl:apnews.com&ceid=US:en&hl=en-US&gl=US",
    logoUrl: "https://assets.apnews.com/fa/ba/9258a7114f5ba5c7202aaa1bdd66/aplogo.svg",
  },
] as const;

/**
 * Tracking terms use word boundaries to match whole words only.
 * Title-priority matching is applied in the filtering logic:
 * terms found in the title are given higher confidence than
 * terms found only in the description.
 */
export const TRACKING_TERMS = [
  /\bisrael(?:i)?\b/i,
  /\biran(?:ian)?\b/i,
  /\busa\b/i,
  /\bu\.s\.(?:a\.?)?/i,
  /\bunited states\b/i,
  /\bamerican\b/i,
  /\bgaza\b/i,
  /\bhezbollah\b/i,
  /\bhamas\b/i,
  /\bwest bank\b/i,
  /\bnetanyahu\b/i,
  /\btehran\b/i,
] as const;

export const FILTER_KEYWORDS = ["Israel", "Iran", "USA", "Gaza", "Hezbollah", "Hamas"];
