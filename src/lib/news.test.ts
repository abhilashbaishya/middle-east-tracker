import { describe, expect, it } from "vitest";

import { dedupeByLink, isTracked, type NewsArticle } from "./news";

function makeArticle(overrides: Partial<NewsArticle> = {}): NewsArticle {
  return {
    id: "test-1",
    title: "Test article",
    description: "Test description",
    url: "https://example.com/article",
    source: "Test Source",
    logoUrl: "https://example.com/logo.png",
    publishedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("isTracked", () => {
  it("returns true when title contains a tracking term", () => {
    expect(isTracked("Israel strikes Gaza", "")).toBe(true);
  });

  it("returns true when description contains a tracking term", () => {
    expect(isTracked("Breaking news", "Iran launches attack")).toBe(true);
  });

  it("returns false when neither title nor description match", () => {
    expect(isTracked("Weather report", "Sunny skies in London")).toBe(false);
  });

  it("is case insensitive", () => {
    expect(isTracked("ISRAEL responds", "")).toBe(true);
    expect(isTracked("", "hamas leader speaks")).toBe(true);
  });

  it("matches word boundaries for USA", () => {
    expect(isTracked("USA announces policy", "")).toBe(true);
  });

  it("matches U.S. with periods", () => {
    expect(isTracked("U.S. military deploys", "")).toBe(true);
  });

  it("matches American", () => {
    expect(isTracked("American troops withdraw", "")).toBe(true);
  });

  it("matches West Bank", () => {
    expect(isTracked("West Bank settlements expand", "")).toBe(true);
  });

  it("matches Netanyahu", () => {
    expect(isTracked("Netanyahu speaks at UN", "")).toBe(true);
  });

  it("matches Tehran", () => {
    expect(isTracked("", "Sources in Tehran confirm")).toBe(true);
  });
});

describe("dedupeByLink", () => {
  it("returns empty array for empty input", () => {
    expect(dedupeByLink([])).toEqual([]);
  });

  it("keeps unique articles", () => {
    const articles = [
      makeArticle({ url: "https://example.com/1" }),
      makeArticle({ url: "https://example.com/2" }),
    ];
    expect(dedupeByLink(articles)).toHaveLength(2);
  });

  it("removes duplicate URLs, keeping the first", () => {
    const first = makeArticle({ id: "first", url: "https://example.com/dup", title: "First" });
    const second = makeArticle({ id: "second", url: "https://example.com/dup", title: "Second" });
    const result = dedupeByLink([first, second]);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("first");
  });

  it("handles mix of duplicates and unique", () => {
    const articles = [
      makeArticle({ url: "https://example.com/a" }),
      makeArticle({ url: "https://example.com/b" }),
      makeArticle({ url: "https://example.com/a" }),
      makeArticle({ url: "https://example.com/c" }),
      makeArticle({ url: "https://example.com/b" }),
    ];
    expect(dedupeByLink(articles)).toHaveLength(3);
  });
});
