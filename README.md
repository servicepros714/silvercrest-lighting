# Silvercrest Lighting — Christmas light booking site

Vite + React front end on **Cloudflare Pages**, booking API on a **Cloudflare Worker** with **D1**, deposits through **Stripe PaymentIntents**.

| Item | Value |
|---|---|
| Source tag (D1 `source`) | `silvercrest` |
| Booking ID prefix | `SCL-` |
| Draft ref prefix | `SCR-` (PaymentIntent Idempotency-Key `silvercrest-pi-<ref>`) |
| Worker name | `silvercrest-api` |
| Pages project | `silvercrest-lighting` |
| Deposit | $149, applied to the final invoice (or "I'll pay at the visit" → `Pay Later`) |
| Season | Oct 20 – Dec 20, every day, Pacific time · windows `8AM–12PM`, `12PM–4PM` · earliest slot 48 h out |

---

## 1. Fill in the TODOs first

Search the project for `TODO`. The main ones:

- `src/data/business.js` — **phone** (given as `555-555-555`, only 9 digits), **city / street / ZIP**, service-area cities, package and add-on prices (`null` shows "Online quoting"), takedown timing in the FAQ, optional email and Google review link.
- `index.html` — the city in the title, description, OG/Twitter tags and the LocalBusiness JSON-LD; phone in JSON-LD and `<noscript>`; the canonical/OG URL once you have a custom domain.
- `src/sections/Reviews.jsx` — add real reviews only (exact wording, with permission). The guestbook stays empty until then.

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

## 3. Cloudflare dashboard setup (no CLI)

**D1**
1. Workers & Pages → D1 → use the shared bookings database (same one the admin dashboard reads), or create one.
2. Optional: open its Console and paste `worker/schema.sql`. The Worker also creates the table on its own.

**Worker**
1. Workers & Pages → Create → Worker → name it `silvercrest-api` → Deploy → Edit code.
2. Replace the code with `worker/worker.js` → Deploy.
3. Settings → Bindings → add **D1 database**, variable name `DB`.
4. Settings → Variables and Secrets:
   - `STRIPE_SECRET_KEY` (Secret) — `sk_live_…` or `sk_test_…`
   - `ALLOWED_ORIGINS` (Text, optional) — e.g. `https://silvercrest-lighting.pages.dev,https://www.yourdomain.com`
   - `ADMIN_TOKEN` (Secret, optional) — turns on `GET /api/bookings` and `PATCH /api/bookings/:id` for the admin dashboard. They stay closed without it.
5. Open `https://silvercrest-api.<your-subdomain>.workers.dev/api/health`; it should return `{"ok":true,"source":"silvercrest"}`.

**Front-end env (`.env.local`, committed for the build)**
```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_…
VITE_API_BASE=https://silvercrest-api.<your-subdomain>.workers.dev
```
Optional: add the same two names as GitHub repo secrets; the workflow uses them instead when set.

**Pages**
1. Workers & Pages → Create → Pages → **Direct Upload** → project name `silvercrest-lighting` (upload any placeholder once to create it).
2. In GitHub → repo Settings → Secrets and variables → Actions, add:
   - `CLOUDFLARE_API_TOKEN` — token with *Cloudflare Pages: Edit*
   - `CLOUDFLARE_ACCOUNT_ID`
3. Every push to `main` builds and deploys through `.github/workflows/deploy.yml`. `public/_redirects` handles SPA routes.

## 4. Local preview (Windows CMD)

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
