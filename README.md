# Middle East Tracker

Static Next.js news tracker focused on Israel, Iran, and U.S. developments with major English outlets and Indian sources.

## Features

- Free RSS aggregation (no paid APIs)
- Sources: BBC, NYT, Guardian, Al Jazeera, The Hindu, Indian Express, NDTV, TOI, Hindustan Times
- Keyword filter: Israel, Iran, USA
- Refreshable list UI with dark theme typography
- GitHub Pages deployment via GitHub Actions
- Automatic rebuild every 5 minutes (best-effort GitHub schedule)

## Local dev

```bash
npm install
npm run dev
```

The feed snapshot is generated automatically to `public/news.json` before dev/build.

## Build static export

```bash
npm run build
```

This outputs a static site to `out/`.

## GitHub Pages

Workflow: `.github/workflows/deploy-pages.yml`

- Deploys on push to `main`
- Deploys on manual run
- Rebuilds every 5 minutes on schedule

Project slug/base path is configured as `/middle-east-tracker`.
