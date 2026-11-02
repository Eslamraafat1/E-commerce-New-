# E2E Tests — VANTA Store

End-to-end tests written with **Playwright**, covering the live site on desktop and mobile Chrome.

## What is tested

| Area | Checks |
|---|---|
| Home | Page loads, title, `lang`/`dir` for English (LTR) and Arabic (RTL) |
| Accessibility | Skip-to-content link exists |
| Catalog | Shop page lists products; category pages render the right heading |
| Product | Product title + add-to-cart action are present |
| Errors | Unknown routes return HTTP 404 |

## Run locally

```bash
cd e2e
npm install
npx playwright install chromium
npm test                                   # against the live site
BASE_URL=http://localhost:3000 npm test    # against a local dev server
```

Tests also run automatically on every push via GitHub Actions (`.github/workflows/e2e.yml`).
