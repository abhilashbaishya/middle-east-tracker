import { describe, expect, it } from "vitest";

import { clampDescription, stripHtml } from "./html";

describe("stripHtml", () => {
  it("removes HTML tags and normalizes whitespace", () => {
    expect(stripHtml("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("decodes common named HTML entities", () => {
    expect(stripHtml("&amp; &lt; &gt; &quot;")).toBe('& < > "');
  });

  it("decodes numeric HTML entities", () => {
    expect(stripHtml("&#39;hello&#39;")).toBe("'hello'");
  });

  it("decodes hex HTML entities", () => {
    expect(stripHtml("&#x27;test&#x27;")).toBe("'test'");
  });

  it("decodes &nbsp; to a regular space", () => {
    expect(stripHtml("hello&nbsp;world")).toBe("hello world");
  });

  it("decodes entities the old custom decoder missed", () => {
    expect(stripHtml("&mdash; &lsquo; &rsquo; &ldquo; &rdquo;")).toBe(
      "\u2014 \u2018 \u2019 \u201C \u201D",
    );
  });

  it("handles &euro; and other symbols", () => {
    expect(stripHtml("Price: &euro;100")).toBe("Price: \u20AC100");
  });

  it("returns empty string for empty input", () => {
    expect(stripHtml("")).toBe("");
  });

  it("handles deeply nested HTML", () => {
    expect(stripHtml("<div><p><span>nested</span></p></div>")).toBe("nested");
  });

  it("handles text with no HTML", () => {
    expect(stripHtml("plain text")).toBe("plain text");
  });
});

describe("clampDescription", () => {
  it("returns short descriptions unchanged", () => {
    expect(clampDescription("short")).toBe("short");
  });

  it("returns exactly 180-char descriptions unchanged", () => {
    const exact = "a".repeat(180);
    expect(clampDescription(exact)).toBe(exact);
  });

  it("truncates long descriptions with ellipsis", () => {
    const long = "a".repeat(200);
    const result = clampDescription(long);
    expect(result).toHaveLength(183); // 180 + "..."
    expect(result).toMatch(/\.\.\.$/);
  });

  it("trims trailing whitespace before ellipsis", () => {
    const withSpace = "a".repeat(178) + "  " + "b".repeat(20);
    const result = clampDescription(withSpace);
    expect(result).not.toMatch(/\s\.\.\.$/);
  });
});
