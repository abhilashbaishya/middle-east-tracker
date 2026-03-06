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
    <article className="card-enter grid gap-5 py-10 md:grid-cols-[170px_1fr] md:gap-12">
      <div className="pt-1">
        {article.tag && <div className="mb-4"><TagPill tag={article.tag} /></div>}
        <div className="space-y-0.5">
          <p className="font-sans text-[clamp(.78rem,.74rem+.16vw,.9rem)] text-[var(--muted-light)]">
            {formatPublishedTime(article.publishedAt)}
          </p>
          <p className="font-sans text-[clamp(.8rem,.76rem+.18vw,.95rem)] text-[var(--muted)]">
            {formatPublishedDate(article.publishedAt)}
          </p>
          <p className="font-sans text-[clamp(.8rem,.76rem+.18vw,.95rem)] text-[var(--muted)]">
            {article.source}
          </p>
        </div>
      </div>

      <div className="max-w-5xl">
        <h2 className="mb-3 font-display text-[32px] leading-[1.16] tracking-[-0.01em] text-[var(--headline)] [text-wrap:balance]">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer underline decoration-transparent underline-offset-4 transition hover:text-[var(--headline-hover)] hover:decoration-[var(--headline-hover)] [text-wrap:balance]"
          >
            {article.title}
          </a>
        </h2>

        <p className="mb-4 max-w-4xl font-sans text-[16px] leading-[1.55] text-[var(--description)] [text-wrap:balance]">
          {article.description || "Open the story for full details."}
        </p>

        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-sans text-[16px] font-medium text-[var(--cta-text)] underline decoration-[var(--cta-underline)] underline-offset-4 transition hover:text-[var(--headline)] hover:decoration-[var(--headline)]"
        >
          Read more
        </a>
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
            <h1 className="font-display text-4xl leading-[1.03] tracking-[-0.01em] text-[var(--headline)] sm:text-[3.2rem] [text-wrap:balance]">
              Middle East Tracker
            </h1>
            <p className="mt-3 max-w-2xl text-base text-[var(--subtle)] [text-wrap:balance]">
              Aggregating coverage from 9 international and Indian newsrooms — tracking the Israel-Palestine conflict, Iran tensions, and U.S. foreign policy in real time.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:items-end">
            <p className="font-mono text-xs text-[var(--muted)]">Updated {formatUpdatedLabel(payload.updatedAt)}</p>
            <p className="font-mono text-xs text-[var(--subtle)]">Auto-updated every ~5 minutes</p>
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
