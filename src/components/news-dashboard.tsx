"use client";

import { useCallback, useEffect, useState } from "react";

import type { NewsArticle, NewsResponse } from "@/lib/news";

type DashboardProps = {
  initialPayload: NewsResponse;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function formatUpdatedLabel(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatPublishedDate(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatPublishedTime(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown time";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function NewsRow({ article }: { article: NewsArticle }) {
  return (
    <article className="card-enter grid gap-5 py-10 md:grid-cols-[170px_1fr] md:gap-12">
      <div className="space-y-1 pt-1">
        <p className="font-heading text-[clamp(.78rem,.74rem+.16vw,.9rem)] font-medium text-[#a1a9b9]">
          {formatPublishedTime(article.publishedAt)}
        </p>
        <p className="font-heading text-[clamp(.8rem,.76rem+.18vw,.95rem)] font-medium text-[#8c94a3]">
          {formatPublishedDate(article.publishedAt)}
        </p>
        <p className="font-heading text-[clamp(.8rem,.76rem+.18vw,.95rem)] font-medium text-[#8c94a3]">
          {article.source}
        </p>
      </div>

      <div className="max-w-5xl">
        <h2 className="mb-3 font-heading text-[32px] font-medium leading-[1.16] tracking-[0.005em] text-[#eef1f6] [text-wrap:balance]">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer underline decoration-transparent underline-offset-4 transition hover:text-[#f4f6fb] hover:decoration-[#f4f6fb] [text-wrap:balance]"
          >
            {article.title}
          </a>
        </h2>

        <p
          className="mb-4 max-w-4xl text-[16px] font-medium leading-[1.55] text-[rgba(238,241,246,0.56)] [text-wrap:balance]"
          style={{ fontFamily: "var(--font-geist), sans-serif" }}
        >
          {article.description || "Open the story for full details."}
        </p>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[16px] font-medium text-[#9ea8ba] underline decoration-[#4e586d] underline-offset-4 transition hover:text-[#eef1f6] hover:decoration-[#eef1f6]"
        >
          Read more
        </a>
      </div>
    </article>
  );
}

export function NewsDashboard({ initialPayload }: DashboardProps) {
  const [payload, setPayload] = useState(initialPayload);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  const refreshNews = useCallback(async (forceRefresh: boolean) => {
    setIsRefreshing(true);

    try {
      const currentIds = new Set(payload.articles.map((article) => article.id));
      const params = new URLSearchParams({ _ts: String(Date.now()) });

      const query = params.toString();
      const response = await fetch(`${BASE_PATH}/news.json${query ? `?${query}` : ""}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = (await response.json()) as NewsResponse;
      const newCount = data.articles.filter((article) => !currentIds.has(article.id)).length;

      setPayload(data);
      setErrorMessage(null);

      if (forceRefresh) {
        setRefreshMessage(
          newCount > 0
            ? `${newCount} new article${newCount === 1 ? "" : "s"} loaded.`
            : "No new articles since the last refresh.",
        );
      } else {
        setRefreshMessage(null);
      }
    } catch {
      setErrorMessage("Unable to refresh right now. Showing the latest cached update.");
      setRefreshMessage(null);
    } finally {
      setIsRefreshing(false);
    }
  }, [payload.articles]);

  useEffect(() => {
    const timer = setInterval(() => {
      void refreshNews(false);
    }, payload.refreshIntervalMs);

    return () => clearInterval(timer);
  }, [payload.refreshIntervalMs, refreshNews]);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 py-10 sm:px-8 lg:px-14">
      <header className="mb-8 border-b border-[#232833] pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-heading text-4xl font-medium leading-[1.03] text-[#eef1f6] sm:text-[3.2rem] [text-wrap:balance]">
              Middle East Tracker
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[#9ea8ba] [text-wrap:balance]">
              Live reporting from major English-language outlets, focused on Israel, Iran, and U.S. developments.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <p className="text-xs text-[#8c94a3]">Updated {formatUpdatedLabel(payload.updatedAt)}</p>
            <button
              type="button"
              onClick={() => void refreshNews(true)}
              disabled={isRefreshing}
              className="inline-flex items-center justify-center rounded-sm border border-[#232833] bg-[#0f131b] px-4 py-2 font-heading text-sm font-medium text-[#cdd3e1] transition hover:border-[#8c94a3] hover:text-[#eef1f6] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isRefreshing ? "Refreshing..." : "Refresh now"}
            </button>
          </div>
        </div>

        {errorMessage ? <p className="mt-4 text-sm text-[#cdd3e1]">{errorMessage}</p> : null}
        {refreshMessage ? <p className="mt-4 text-sm font-medium text-[#eef1f6]">{refreshMessage}</p> : null}
      </header>

      {payload.articles.length === 0 ? (
        <div className="border border-dashed border-[#232833] p-10 text-center text-[#9ea8ba]">
          No matching articles found right now.
        </div>
      ) : (
        <section className="divide-y divide-[#232833] border-b border-[#232833]">
          {payload.articles.map((article) => (
            <NewsRow key={article.id} article={article} />
          ))}
        </section>
      )}
    </div>
  );
}
