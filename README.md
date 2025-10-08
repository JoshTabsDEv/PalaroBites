# PalaroBites – Documentation

PalaroBites is a campus food delivery web app built with Next.js (App Router), TypeScript, Shadcn UI, and Supabase.

## Overview

- Browse stores and products (with filters and search)
- Add to cart and checkout (Cash on Delivery) with delivery fee starting at ₱5 for first 3 items
- Orders page with receipts and status
- Admin dashboard for stores, products, and orders
- Auth via Supabase (OAuth supported)

## Tech Stack

- Next.js 14+ (App Router) · TypeScript
- Tailwind CSS · Shadcn UI
- Supabase (Auth, DB, SSR/Browser client)
- Vercel (hosting)

## Getting Started

1) Install

```bash
npm i
npm run dev
```

2) Environment variables (create `.env.local`)

```
NEXT_PUBLIC_SUPABASE_URL= https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY= <anon_key>
SUPABASE_SERVICE_ROLE_KEY= <service_role_key>
NEXTAUTH_URL= http://localhost:3000
NEXT_PUBLIC_SITE_URL= http://localhost:3000
GOOGLE_CLIENT_ID= <optional>
GOOGLE_CLIENT_SECRET= <optional>
```

3) Database

- Run SQL from `database/schema.sql` then (optional) `database/seed.sql` in Supabase SQL editor

Tables:
- `stores(id, name, description, image, rating, delivery_time, location, phone, is_open, categories[])`
- `products(id, name, description, price, image, store_id, category, is_available)`
- `orders(id, user_id, customer_name, customer_phone, delivery_address, subtotal, delivery_fee, total, status, payment_method, payment_status)`
- `order_items(id, order_id, product_id, product_name, product_price, quantity, store_id, store_name)`

RLS: Enabled for all tables with authenticated policies.

## Development Notes

- Client-only Supabase: `src/lib/supabase-client.ts`
- Server/SSR usage: `src/lib/supabase.ts` (cookies)
- Auth route: `src/app/api/[...nextauth]/route.ts`
- UI components: `src/components/ui/*`

## Key Pages

- `/` – Home (stores/products, search, filters)
- `/login` – Login + intro modal
- `/orders` – My Orders list
- `/order-success` – Receipt page
- `/admin` – Admin Dashboard
- `/terms`, `/privacy`, `/about` – Legal & info pages

## Admin

- Stores: add/edit/delete, toggle open/closed
- Products: add/edit/delete, toggle availability
- Orders: filter by status, update status (confirmed, preparing, out_for_delivery, delivered, cancelled)

## Deployment (Vercel)

Set env vars (Preview + Production):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
NEXTAUTH_URL=https://<your-domain>
NEXT_PUBLIC_SITE_URL=https://<your-domain>
```

For Google OAuth, add callback URL: `https://<your-domain>/api/auth/callback/google`.

## Troubleshooting

- Logout errors (`session_not_found`): set env vars; the app falls back to local sign-out.
- “No API key found”: missing `NEXT_PUBLIC_SUPABASE_*` envs.
- Turbopack import errors: mark client files with `"use client"` and avoid server-only imports in client components.

## License

MIT (add a LICENSE file if needed).
