"use client";

import { useCallback, useEffect, useRef, useState } from "react";

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

function useScrollReveal() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function NewsRow({ article }: { article: NewsArticle }) {
  const ref = useScrollReveal();
  return (
    <article ref={ref} className="card-enter grid items-start gap-3 pt-10 pb-10 first:pt-0 lg:grid-cols-[1fr_16ch] lg:gap-6">
      <div>
        {article.tag && <div className="mb-2 lg:hidden"><TagPill tag={article.tag} /></div>}
        <h2 className="font-display text-[22px] leading-[1.2] tracking-[-0.01em] text-[var(--headline)] sm:text-[26px] lg:text-[32px] lg:leading-[1.16] [text-wrap:balance]">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="cursor-pointer rounded-sm underline decoration-transparent underline-offset-4 transition-[color,text-decoration-color] active:text-[var(--headline-hover)] active:decoration-[var(--headline-hover)] hover:text-[var(--headline-hover)] hover:decoration-[var(--headline-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]"
          >
            {article.title}
          </a>
        </h2>
        <p className="mt-2 max-w-2xl font-sans text-[14px] leading-[1.55] text-[var(--description)] sm:text-[15px] lg:text-[16px]">
          {article.description || "Open the story for full details."}
        </p>
        {article.tag && <div className="mt-3 hidden lg:block"><TagPill tag={article.tag} /></div>}
      </div>

      <div className="flex gap-2 font-mono text-[11px] uppercase text-[var(--muted)] sm:text-[12px] lg:flex-col lg:items-end lg:justify-between lg:gap-0 lg:self-stretch lg:text-[14px]">
        <div className="lg:text-right">
          <span className="inline-flex items-center gap-1.5">
            {article.source}
            {article.paywalled && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2Zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2ZM9 8V6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9Z"/>
              </svg>
            )}
          </span>
          <span className="lg:hidden"> · </span>
          <span className="lg:block">{formatPublishedDate(article.publishedAt)}</span>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group hidden rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:inline-flex"
          aria-label="Read more"
        >
          <svg className="group-hover:hidden" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <path d="M16 0.5C24.5604 0.5 31.5 7.43959 31.5 16C31.5 24.5604 24.5604 31.5 16 31.5C7.43959 31.5 0.5 24.5604 0.5 16C0.5 7.43959 7.43959 0.5 16 0.5Z" stroke="#71717a" strokeWidth="1"/>
            <g clipPath="url(#clip0_default)">
              <path d="M10.7998 21.2001L20.3998 11.6001" stroke="#F3F4F5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.5996 11.6001H20.3996V19.4001" stroke="#F3F4F5" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_default">
                <rect width="19.2" height="19.2" fill="white" transform="translate(6 6.80005)"/>
              </clipPath>
            </defs>
          </svg>
          <svg className="hidden group-hover:block" width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <circle cx="16" cy="16" r="16" fill="white"/>
            <g clipPath="url(#clip0_hover)">
              <path d="M10.7998 21.2001L20.3998 11.6001" stroke="#040810" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12.5996 11.6001H20.3996V19.4001" stroke="#040810" strokeLinecap="round" strokeLinejoin="round"/>
            </g>
            <defs>
              <clipPath id="clip0_hover">
                <rect width="19.2" height="19.2" fill="white" transform="translate(6 6.80005)"/>
              </clipPath>
            </defs>
          </svg>
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
