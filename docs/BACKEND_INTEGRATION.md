# Backend integration

VANTA runs in **Demo Mode** by default. Every data call goes through `lib/api/*`; UI components never contain URLs.

## Switching modes

| Variable | Meaning |
| --- | --- |
| `NEXT_PUBLIC_USE_DEMO_API=true` | Use the built-in Route Handlers in `app/api/*` backed by `data/demo/*`. |
| `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api` | **Example only.** Replace with your real backend URL when demo mode is `false`. |
| `NEXT_PUBLIC_SITE_URL` | Canonical URL for metadata, sitemap and robots. |

Copy `.env.example` to `.env.local`.

## Contract your backend must implement

All responses use the envelope `{ "data": …, "meta"?: … }`; errors use `{ "error": { "code", "message", "details"? } }` with a proper HTTP status.

| Endpoint | Notes |
| --- | --- |
| `GET /products` | Query params: `q, category, collection, lifestyle, tag, min, max (minor units), stock=in, rating, color, size, sort, page, pageSize, ids, new, best, featured, sale`. Returns `{ items, total, page, pageSize, facets }` (`ProductListResult`). `items` is cumulative up to `page * pageSize` (Load more). |
| `GET /products/:idOrSlug` | `Product`; `?related=N` returns related products. |
| `GET /categories`, `GET /collections` | Arrays. |
| `GET /search?q=` | `{ products, categories, terms }` suggestions. |
| `POST /orders` | Body `OrderInput` (see `lib/api/types.ts`). **Re-price server-side** from your catalog, check stock, then return an `Order`. |
| `GET /orders` | Must be authorised per user. The demo returns `[]`. |
| `POST /contact` | `{ name, email, message }`. |

Types live in `lib/api/types.ts`. Prices are integer minor units. Editorial content (journal, testimonials, lifestyles) is in `lib/api/content.ts` — replace with a CMS.

## Replace before production

- **Auth** (`components/account/auth-forms.tsx`): currently stores a name/email in localStorage only. Use a real provider and enforce authorisation **on the server** for `/account` and `/admin` data and APIs. Hiding links is not security.
- **Payments**: `components/shop/checkout.tsx` never collects card data. Integrate a hosted payment provider and confirm payment server-side before showing a confirmation.
- **Newsletter / contact**: no email service is connected; the UI says so honestly.
- **Cart persistence**: cart/wishlist/recent/orders are browser localStorage (`lib/stores.ts`).
- **Store config**: brand, shipping, returns, discount rules are in `config/store.ts`; discount codes must also be validated server-side.
- **Images**: demo photos come from Unsplash (`next.config.ts` `images.remotePatterns`). Replace with your CDN. Some stock photos show third-party marks.
