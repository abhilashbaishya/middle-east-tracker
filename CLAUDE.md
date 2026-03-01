# Claude Code Project Instructions

## GitHub Access

This project requires authenticated GitHub access to create PRs, merge to main, and manage issues.

At the start of each session, configure the GitHub CLI:

```
echo "<GH_TOKEN>" | gh auth login --with-token
```

Ask the user for their `GH_TOKEN` if it's not already configured. Verify with `gh auth status`.

## Deployment Workflow

When pushing changes to production:

1. Push code to a `claude/*` branch
2. Create a PR via `gh pr create`
3. Merge the PR via `gh pr merge --merge`
4. GitHub Actions automatically deploys to GitHub Pages

Never ask the user to manually merge on GitHub - handle the full workflow.

## Project Overview

Middle East news tracker - a static Next.js app that aggregates RSS feeds from major news outlets, filtering for Israel/Iran/USA/Gaza-related coverage. Deployed to GitHub Pages at https://abhilashbaishya.github.io/middle-east-tracker/

## Tech Stack

- Next.js 16 (static export)
- TypeScript
- Tailwind CSS v4
- Vitest for testing
- RSS feed aggregation via rss-parser

## Key Commands

- `npm run dev` - Local development
- `npm run build` - Production build
- `npm run test` - Run all tests (vitest)
- `npm run test:watch` - Watch mode tests
- `npm run data:refresh` - Regenerate news.json
