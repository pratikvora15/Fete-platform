# Fête Platform — Product Requirements Document

> Last updated: 2026-05-29  
> Status: MVP in development

---

## 1. Overview

Fête is a Canadian event marketplace connecting **planners** (people organising celebrations) with **suppliers** (venues, entertainers, caterers, games rental). The platform focuses on life-milestone events: baby showers, welcome baby parties, 1st birthdays, and engagement parties.

---

## 2. User Types

| Role | Description | Post-login destination |
|------|-------------|----------------------|
| **Planner** | Person planning an event. Browses suppliers, submits inquiries. | `/` (homepage / search) |
| **Supplier** | Venue, entertainer, or service provider. Manages their listing and incoming bookings. | `/partner/dashboard` |

**How the system tells them apart:** after Clerk authentication, `/auth/callback` checks whether the user has a row in the `suppliers` table. Suppliers go to the dashboard; everyone else goes to the homepage. A user becomes a supplier by completing the `/partner/sign-up` multi-step form.

---

## 3. Pages & Routes

| Route | Type | Who sees it | What it does |
|-------|------|-------------|--------------|
| `/` | Public | Everyone | Homepage: hero search, verticals, entertainers, supplier CTA |
| `/partner/sign-up` | Public | Prospective suppliers | 4-step onboarding form → creates supplier record in Supabase |
| `/partner/dashboard` | Protected (supplier) | Signed-in suppliers | Main supplier workspace (see §6) |
| `/sign-in`, `/sign-up` | Public | Everyone | Clerk-hosted auth UI |
| `/auth/callback` | Server | Post-auth redirect | Checks DB and routes to correct destination |
| `/api/suppliers/create` | API | Partner sign-up form | Inserts supplier row into Supabase |
| `/api/availability` | API | Dashboard calendar | POST = block date, DELETE = unblock date |

---

## 4. Data Model

### `suppliers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `clerk_user_id` | TEXT UNIQUE | Links to Clerk |
| `name` | TEXT | Business/stage name |
| `category` | TEXT[] | e.g. `["Entertainer", "Magician"]` |
| `city` | TEXT | |
| `price_min` | INTEGER | CAD |
| `price_max` | INTEGER | CAD |
| `bio` | TEXT | Shown on listing |
| `status` | TEXT | `active` \| `paused` |
| `created_at` | TIMESTAMPTZ | |

### `inquiries`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `supplier_id` | UUID FK → suppliers | |
| `planner_name` | TEXT | |
| `planner_email` | TEXT | |
| `planner_location` | TEXT | |
| `event_type` | TEXT | Baby shower, 1st birthday, etc. |
| `event_date` | DATE | |
| `guest_count` | INTEGER | |
| `budget_min/max` | INTEGER | CAD |
| `message` | TEXT | |
| `status` | TEXT | `pending` \| `confirmed` \| `declined` \| `completed` |
| `created_at` | TIMESTAMPTZ | |

### `bookings`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `inquiry_id` | UUID FK → inquiries | Nullable (can create without prior inquiry) |
| `supplier_id` | UUID FK → suppliers | |
| `planner_name` | TEXT | |
| `event_type` | TEXT | |
| `event_date` | DATE | |
| `guest_count` | INTEGER | |
| `amount_cents` | INTEGER | Price in cents (e.g. 12000 = $120) |
| `status` | TEXT | `confirmed` \| `completed` \| `cancelled` |
| `created_at` | TIMESTAMPTZ | |

### `availability_blocks`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `supplier_id` | UUID FK → suppliers | |
| `blocked_date` | DATE | Unique per supplier |

### `profile_views`
| Column | Type | Notes |
|--------|------|-------|
| `id` | UUID PK | |
| `supplier_id` | UUID FK → suppliers | |
| `viewer_clerk_id` | TEXT | Nullable (anonymous visitors) |
| `viewed_at` | TIMESTAMPTZ | |

---

## 5. Supplier Dashboard — How it works

The dashboard (`/partner/dashboard`) is a Next.js **server component** that fetches all data in parallel at render time. No client-side loading states — everything arrives with the page.

### Metrics (top row)
Each card shows a month-to-date figure plus % change vs the previous calendar month:

| Metric | Source |
|--------|--------|
| Profile views | COUNT of `profile_views` rows where `viewed_at >= first day of current month` |
| Inquiries | COUNT of `inquiries` rows for this supplier this month |
| Bookings | COUNT of `bookings` rows for this supplier this month |
| Earnings (MTD) | SUM of `amount_cents` from `bookings` where `status = 'completed'` this month |

### Bar chart
Shows confirmed bookings per month for the last 6 months, derived by grouping `bookings.created_at` by `YYYY-MM`. Rendered as CSS flex divs with proportional heights — no chart library dependency.

### Donut chart
Groups all bookings by `event_type`, computes percentage of total, builds a `conic-gradient` CSS string. Rendered as a single `<div>` with inline `background` style.

### Availability calendar
**Client component** (`AvailabilityCalendar.tsx`). The server passes two arrays: `blockedDates` (from `availability_blocks`) and `bookedDates` (from confirmed `bookings`). The client holds blocked dates in local state for optimistic UI.

- **Click an open date** → POST `/api/availability` → inserts `availability_blocks` row → date turns red
- **Click a blocked date** → DELETE `/api/availability` → removes row → date returns to available
- **Booked dates** (green) are read-only — the supplier cannot unblock a date that has a confirmed booking

### Inquiries table
Last 10 inquiries ordered by `created_at DESC`. Shows planner name, location, event type, date, guest count, budget range, and status badge. Pending inquiries also increment the sidebar badge count.

---

## 6. Auth Flow

```
User visits /sign-in or /sign-up
        ↓
Clerk handles authentication
        ↓
Redirect to /auth/callback
        ↓
Check: does suppliers table have a row for this clerk_user_id?
    YES → /partner/dashboard
    NO  → / (homepage — planner experience)
```

The `/partner/dashboard` route is additionally protected by `middleware.ts` using `clerkMiddleware`. Unauthenticated requests are bounced to `/sign-in`.

---

## 7. Inquiry flow (current state)

Inquiries are currently **created manually** (inserted directly into Supabase or via a future planner-facing form). The supplier sees them in their dashboard table but cannot yet take action from the UI.

**What exists:** read-only display of inquiry status, planner details, event info.  
**What doesn't exist yet:** see §8 Future Features.

---

## 8. Future Features

> Items in this list have been deliberately deferred. They need a brief product description before implementation begins.

### FutureFeature: Lifecycle alert engine
**What:** A smart banner in the supplier dashboard that surfaces demand signals based on past booking patterns. Example: "You performed at 3 baby showers 10 months ago — those families have 1st birthdays coming up."
**Data needed:** `bookings` rows with `event_type = 'Baby shower'` from 9–13 months ago.
**Logic:** Count those rows. If > 0, show alert with count and CTA to update availability.
**Status:** UI placeholder exists in dashboard (hardcoded). Wiring to real data deferred.

### FutureFeature: Planner inquiry form
**What:** A form on each supplier's public listing page that lets a planner submit an inquiry (name, email, event type, date, guests, budget, message). Inserts a row into `inquiries` and sends an email notification to the supplier.
**Depends on:** Supplier public listing page (`/supplier/[id]`), email provider (Resend).

### FutureFeature: Supplier inquiry management
**What:** Supplier can accept or decline an inquiry from the dashboard. Accepting converts it to a `booking` row. Declining updates `status = 'declined'`.
**Depends on:** Planner inquiry form (above).

### FutureFeature: In-app messaging
**What:** Threaded chat between planner and supplier, attached to an inquiry.
**Note:** Discuss first — could be replaced by email-only flow for MVP.

### FutureFeature: Supplier public listing page (`/supplier/[id]`)
**What:** The public-facing page planners see when they click a supplier from search results. Shows photos, bio, pricing, availability, reviews, and the inquiry form.

### FutureFeature: Search & discovery (`/search`)
**What:** Filter suppliers by city, category, event type, availability, price range. Map view showing pins. Currently a stub page.

### FutureFeature: Stripe payout integration
**What:** Connect supplier's bank account via Stripe Connect. Earnings from completed bookings are paid out 48h after event date.

### FutureFeature: Profile views instrumentation
**What:** Record a row in `profile_views` every time a planner views a supplier's public listing. Currently the counter exists but nothing writes to it.

### FutureFeature: Planner dashboard
**What:** After a planner signs in, they see their saved suppliers, active inquiries, and upcoming events — instead of the raw homepage.

### FutureFeature: Email notifications (Resend)
**What:** Supplier gets an email when a new inquiry arrives. Planner gets confirmation when inquiry is submitted.

---

## 9. Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router, Turbopack) |
| Auth | Clerk v7 |
| Database | Supabase (Postgres) |
| Styling | Tailwind CSS v4 |
| Fonts | next/font/google — Playfair Display, DM Sans, DM Mono, Cormorant Garamond |
| Payments | Stripe (not yet wired) |
| Email | Resend (not yet wired) |
| Hosting | Vercel |

---

## 10. Environment variables required

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
```
