"use client";

import { useCallback, useEffect, useState } from "react";

import type { ArticleTag, NewsArticle, NewsResponse } from "@/lib/news";

type DashboardProps = {
  initialPayload: NewsResponse;
};

const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function formatUpdatedLabel(isoString: string): string {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat(undefined, {
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

  return new Intl.DateTimeFormat(undefined, {
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

  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

const TAG_STYLES: Record<ArticleTag, string> = {
  Critical: "bg-red-950 text-red-400",
  Developing: "bg-amber-950 text-amber-400",
  Update: "bg-zinc-800 text-zinc-400",
  Context: "bg-blue-950 text-blue-400",
};

function TagPill({ tag }: { tag: ArticleTag }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-wide ${TAG_STYLES[tag]}`}>
      {tag}
    </span>
  );
}

function NewsRow({ article }: { article: NewsArticle }) {
  return (
    <article className="card-enter grid items-start gap-3 pt-10 pb-10 first:pt-0 lg:grid-cols-[1fr_16ch] lg:gap-6">
      <div>
        <h2 className="font-display text-[1.125rem] leading-[1.35] tracking-[-0.01em] text-[var(--headline)] sm:text-[1.25rem] lg:text-[1.5rem]">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer underline decoration-transparent underline-offset-4 transition hover:text-[var(--headline-hover)] hover:decoration-[var(--headline-hover)]"
          >
            {article.title}
          </a>
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-[0.875rem] leading-[1.55] text-[var(--description)]">
          {article.description || "Open the story for full details."}
        </p>
        {article.tag && <div className="mt-3"><TagPill tag={article.tag} /></div>}
      </div>

      <div className="flex gap-2 font-sans text-[0.875rem] text-[var(--muted)] lg:flex-col lg:items-end lg:gap-0 lg:text-[1rem]">
        <span>{article.source}</span>
        <span className="lg:hidden">·</span>
        <span>{formatPublishedDate(article.publishedAt)}</span>
      </div>
    </article>
  );
}

export function NewsDashboard({ initialPayload }: DashboardProps) {
  const [payload, setPayload] = useState(initialPayload);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const refreshNews = useCallback(async () => {
    try {
      const params = new URLSearchParams({ _ts: String(Date.now()) });
      const query = params.toString();
      const response = await fetch(`${BASE_PATH}/news.json${query ? `?${query}` : ""}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = (await response.json()) as NewsResponse;

      setPayload(data);
      setErrorMessage(null);
    } catch {
      setErrorMessage("Unable to refresh right now. Showing the latest cached update.");
    }
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      void refreshNews();
    }, payload.refreshIntervalMs);

    return () => clearInterval(timer);
  }, [payload.refreshIntervalMs, refreshNews]);

  return (
    <div className="mx-auto w-full max-w-7xl px-5 pt-[72px] pb-10 sm:px-8 lg:px-14">
      <header className="mb-8 border-b border-[var(--divider)] pb-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="font-display text-[2.25rem] leading-[1.05] tracking-[-0.02em] text-[var(--headline)] sm:text-[3.375rem] lg:text-[4.5rem] [text-wrap:balance]">
              Middle East Tracker
            </h1>
            <p className="mt-4 max-w-2xl font-sans text-[0.875rem] text-[var(--subtle)] sm:text-base [text-wrap:balance]">
              Aggregating coverage from 9 international and Indian newsrooms — tracking the Israel-Palestine conflict, Iran tensions, and U.S. foreign policy in real time.
            </p>
          </div>

          <div className="flex flex-col sm:items-end">
            <p className="font-mono text-xs uppercase text-[var(--muted)]">Updated {formatUpdatedLabel(payload.updatedAt)}</p>
            <p className="font-mono text-xs uppercase text-[var(--subtle)]">Auto-updated every ~5 minutes</p>
          </div>
        </div>

        {errorMessage ? <p className="mt-4 text-sm text-[var(--error)]">{errorMessage}</p> : null}
      </header>

      {payload.articles.length === 0 ? (
        <div className="border border-dashed border-[var(--empty-border)] p-10 text-center text-[var(--subtle)]">
          No matching articles found right now.
        </div>
      ) : (
        <section className="divide-y divide-[var(--divider)] border-b border-[var(--divider)]">
          {payload.articles.map((article) => (
            <NewsRow key={article.id} article={article} />
          ))}
        </section>
      )}
    </div>
  );
}
