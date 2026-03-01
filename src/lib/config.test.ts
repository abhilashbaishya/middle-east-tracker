import { describe, expect, it } from "vitest";

import { FEEDS, FILTER_KEYWORDS, TRACKING_TERMS } from "./config";

describe("FEEDS", () => {
  it("contains at least one feed", () => {
    expect(FEEDS.length).toBeGreaterThan(0);
  });

  it("all feeds have required fields", () => {
    for (const feed of FEEDS) {
      expect(feed.source).toBeTruthy();
      expect(feed.url).toMatch(/^https?:\/\//);
      expect(feed.logoUrl).toMatch(/^https?:\/\//);
    }
  });

  it("has no duplicate source names", () => {
    const names = FEEDS.map((f) => f.source);
    expect(new Set(names).size).toBe(names.length);
  });

  it("has no duplicate URLs", () => {
    const urls = FEEDS.map((f) => f.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});

describe("TRACKING_TERMS", () => {
  it("matches 'Israel' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("Israel strikes back"))).toBe(true);
  });

  it("matches 'Israeli' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("Israeli forces advance"))).toBe(true);
  });

  it("matches 'Iran' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("Iran launches missiles"))).toBe(true);
  });

  it("matches 'Iranian' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("Iranian government responds"))).toBe(true);
  });

  it("matches 'Gaza' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("Gaza ceasefire talks"))).toBe(true);
  });

  it("matches 'Hamas' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("Hamas leaders meet"))).toBe(true);
  });

  it("matches 'Hezbollah' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("Hezbollah fires rockets"))).toBe(true);
  });

  it("matches 'United States' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("United States responds"))).toBe(true);
  });

  it("matches 'U.S.' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("U.S. sends aid"))).toBe(true);
  });

  it("matches 'Netanyahu' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("Netanyahu announces plan"))).toBe(true);
  });

  it("matches 'Tehran' in text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("Tehran denies involvement"))).toBe(true);
  });

  it("does not match unrelated text", () => {
    expect(TRACKING_TERMS.some((t) => t.test("weather forecast for London"))).toBe(false);
  });
});

describe("FILTER_KEYWORDS", () => {
  it("contains expected keywords", () => {
    expect(FILTER_KEYWORDS).toContain("Israel");
    expect(FILTER_KEYWORDS).toContain("Iran");
    expect(FILTER_KEYWORDS).toContain("USA");
    expect(FILTER_KEYWORDS).toContain("Gaza");
  });
});
