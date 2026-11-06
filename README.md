# Silvercrest Lighting — Christmas light booking site

Vite + React front end on **Netlify** (https://silvercrest-lighting.netlify.app), quote requests through **Netlify Forms**. The optional online-booking backend is a **Cloudflare Worker** with **D1**, deposits through **Stripe PaymentIntents**.

> **Online booking is currently OFF** (`BOOKING.online = false` in `src/data/business.js`). Every booking button opens the quote form on `/contact#quote`, `/book`, `/checkout` and `/confirmation` redirect there, and the live availability board is hidden. Turn it on only after the Worker and Stripe below are configured and tested.

| Item | Value |
|---|---|
| Source tag (D1 `source`) | `silvercrest` |
| Booking ID prefix | `SCL-` |
| Draft ref prefix | `SCR-` (PaymentIntent Idempotency-Key `silvercrest-pi-<ref>`) |
| Worker name | `silvercrest-api` |
| Netlify site | `silvercrest-lighting` |
| Quote form | Netlify Forms, form name `quote` (static copy in `index.html`) |
| Deposit | $149, applied to the final invoice (or "I'll pay at the visit" → `Pay Later`) |
| Season | Oct 20 – Dec 20, every day, Pacific time · windows `8AM–12PM`, `12PM–4PM` · earliest slot 48 h out |

---

## 1. Fill in the TODOs first

Search the project for `TODO`. The main ones:

- `src/data/business.js` — phone (714-844-0033; empty = every phone link is hidden), optional public email, service-area cities (Anaheim + Orange County), package and add-on prices (`null` shows "Online quoting"), takedown timing in the FAQ, Google review link. The address is set (5217 E Orangethorpe Ave, Anaheim, CA 92807); `showStreetAddress: false` keeps the street private and shows "Anaheim, CA".
- `index.html` — mirrors business.js in the title, meta tags and LocalBusiness JSON-LD (phone and service-area cities included); canonical/OG URLs if you move to a custom domain (also `public/robots.txt` and `public/sitemap.xml`).
- `src/sections/Reviews.jsx` — add real reviews only (exact wording, with permission). The section is hidden until there is at least one.
- Legal pages (`src/pages/legal/`) — the TODO comment at the top of each file lists what a legal professional should confirm.

## 2. Push to GitHub (Windows CMD)

```cmd
cd C:\path\to\silvercrest-lighting
git init
git add .
git commit -m "Silvercrest Lighting site"
git branch -M main
git remote add origin https://github.com/servicepros714/silvercrest-lighting.git
git push -u origin main
```

(Create the empty `silvercrest-lighting` repo on github.com first.)

## 3. Netlify

- Deploy: `npm run build` then `netlify deploy --prod --dir=dist --no-build` (the folder is linked to the site), or connect the GitHub repo in Netlify — `netlify.toml` already sets the build command and publish folder.
- **Quote requests:** Netlify → Project → Forms → `quote`. Set up email notifications there (Forms → Form notifications) so new requests reach you.
- `.github/workflows/deploy.yml` now only runs a build check; it no longer deploys anywhere.

## 4. Online booking backend (optional — Cloudflare dashboard, no CLI)

**D1**
1. Workers & Pages → D1 → use the shared bookings database (same one the admin dashboard reads), or create one.
2. Optional: open its Console and paste `worker/schema.sql`. The Worker also creates the table on its own.

**Worker**
1. Workers & Pages → Create → Worker → name it `silvercrest-api` → Deploy → Edit code.
2. Replace the code with `worker/worker.js` → Deploy.
3. Settings → Bindings → add **D1 database**, variable name `DB`.
4. Settings → Variables and Secrets:
   - `STRIPE_SECRET_KEY` (Secret) — `sk_live_…` or `sk_test_…`
   - `ALLOWED_ORIGINS` (Text, optional) — e.g. `https://silvercrest-lighting.netlify.app,https://www.yourdomain.com`
   - `ADMIN_TOKEN` (Secret, optional) — turns on `GET /api/bookings` and `PATCH /api/bookings/:id` for the admin dashboard. They stay closed without it.
5. Open `https://silvercrest-api.<your-subdomain>.workers.dev/api/health`; it should return `{"ok":true,"source":"silvercrest"}`.

**Front-end env (`.env.local`, committed for the build)**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_…
VITE_API_BASE=https://silvercrest-api.<your-subdomain>.workers.dev
```
Then set `BOOKING.online = true` in `src/data/business.js`, rebuild and redeploy. (The front end no longer uses Cloudflare Pages; `public/_redirects` / `netlify.toml` handle SPA routes on Netlify.)

## 5. Local preview (Windows CMD)

```cmd
npm install
npm run dev
```

## How data is stored (shared D1 columns, no new columns)

- `service` = package (`Front Only` / `Front & Sides`)
- `vehicle` = `Seasonal · 2-Story · Front & Sides · +Wreaths`
- `notes` = `Type: … · Add-ons: … · Estimate: … · Ref: SCR-… · PI: pi_…` (+ `SLOT CONFLICT …` if a paid booking lost a slot race)
- `status` = `Booked` on insert; `payment_status` = `Paid` / `Pay Later`
- PATCHABLE: status, reschedule_date, reschedule_time, notes2, original_date, original_time, payment_status, date, time
- Availability is source-scoped; a reschedule slot counts as the occupied slot; Cancelled bookings free their slot.
