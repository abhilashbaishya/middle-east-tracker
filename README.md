# Middle East Tracker

A light-themed live news tracker for Middle East conflict coverage focused on `Israel`, `Iran`, and the `USA`, built with Next.js, Tailwind, and Vercel-friendly defaults.

## Features

- Free RSS-only aggregation (no paid APIs)
- Major English outlets only:
  - BBC
  - The New York Times
  - The Guardian
  - Al Jazeera
- Keyword filter: Israel, Iran, USA
- Card-based iOS-style UI with outlet logos and "Read more" links
- Auto-refresh every 5 minutes
- Manual refresh button

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
npm start
```

## API

`GET /api/news`

Query params:
- `refresh=true` to bypass cache and fetch latest feeds immediately
