/* ─────────────────────────────────────────────────────────────
   Silvercrest Lighting — booking API (Cloudflare Worker)
   Worker name: silvercrest-api
   Source tag: silvercrest · Booking ID prefix: SCL- · Draft ref prefix: SCR-

   Bindings (set in the Cloudflare dashboard, never by CLI):
     DB                 D1 database (shared bookings table)
     STRIPE_SECRET_KEY  Secret — sk_live_… or sk_test_…
     ALLOWED_ORIGINS    Text (optional) — comma-separated origins for CORS
     ADMIN_TOKEN        Secret (optional) — enables GET /api/bookings + PATCH

   Routes
     GET   /api/health
     GET   /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD
     POST  /api/payment-intent         { ref }
     POST  /api/bookings               { …booking, paymentIntentId? | payLater }
     GET   /api/bookings               (Authorization: Bearer ADMIN_TOKEN)
     PATCH /api/bookings/:id           (Authorization: Bearer ADMIN_TOKEN)
   ───────────────────────────────────────────────────────────── */

const SOURCE = 'silvercrest';
const PREFIX = 'SCL-';
const DRAFT_PREFIX = 'SCR-';
const DEPOSIT_CENTS = 14900; // $149 reservation deposit, applied to the final invoice
const DEPOSIT_DESCRIPTION = 'Silvercrest Lighting reservation deposit (applied to final invoice)';
const PI_IDEMPOTENCY = (ref) => `silvercrest-pi-${ref}`;

const TZ = 'America/Los_Angeles';
const SEASON = { startMonth: 10, startDay: 20, endMonth: 12, endDay: 20 }; // Oct 20 – Dec 20
const TIME_WINDOWS = { '8AM–12PM': 8, '12PM–4PM': 12 }; // en dash, start hour (Pacific)
const LEAD_HOURS = 48;

const LIGHT_TYPES = ['Permanent', 'Seasonal'];
const PACKAGES = ['Front Only', 'Front & Sides'];
const STORIES = ['1-Story', '2-Story'];

const PATCHABLE = [
  'status', 'reschedule_date', 'reschedule_time', 'notes2',
  'original_date', 'original_time', 'payment_status', 'date', 'time',
];

/* One statement per prepare() — never .exec() (it splits on newlines and breaks). */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, date TEXT, time TEXT, service TEXT, name TEXT, phone TEXT, email TEXT, vehicle TEXT, address TEXT, notes TEXT, source TEXT, created_at TEXT, status TEXT DEFAULT 'Booked', reschedule_date TEXT, reschedule_time TEXT, notes2 TEXT, original_date TEXT, original_time TEXT, payment_status TEXT)`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_source_date ON bookings (source, date)`,
];

/* The slot a booking occupies: its reschedule slot when set, else its original slot.
   Cancelled bookings free their slot. */
const SLOT_DATE = `COALESCE(NULLIF(reschedule_date, ''), date)`;
const SLOT_TIME = `COALESCE(NULLIF(reschedule_time, ''), time)`;
const ACTIVE = `COALESCE(status, 'Booked') NOT IN ('Cancelled', 'Canceled')`;

let schemaPromise = null;
function ensureSchema(env) {
  // Cached per isolate. A failure resets the cache and never throws to the caller,
  // so a schema hiccup can't block a booking (and the payment route never calls it).
  if (!schemaPromise) {
    schemaPromise = (async () => {
      for (const sql of SCHEMA) await env.DB.prepare(sql).run();
    })().catch((err) => {
      schemaPromise = null;
      console.warn('ensureSchema failed (continuing):', err && err.message);
    });
  }
  return schemaPromise;
}

/* ───────── helpers ───────── */

function corsHeaders(request, env) {
  const origin = request.headers.get('Origin') || '';
  const allowed = String(env.ALLOWED_ORIGINS || '')
    .split(',').map((s) => s.trim()).filter(Boolean);
  const allow = !allowed.length ? '*' : (allowed.includes(origin) ? origin : allowed[0]);
  return {
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data, status, cors) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors },
  });
}

const clean = (v, max = 300) => String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max);
const isISODate = (s) => /^\d{4}-\d{2}-\d{2}$/.test(String(s || ''));

/* Offset (minutes) of the Pacific zone at a given UTC instant — DST-aware. */
function tzOffsetMinutes(utcMs) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(utcMs));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return Math.round((asUTC - utcMs) / 60000);
}

/* Pacific wall-clock time → UTC ms (handles the Nov 1, 2026 DST switch). */
function pacificToUtc(isoDate, hour) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, 0, 0);
  let utc = guess - tzOffsetMinutes(guess) * 60000;
  utc = guess - tzOffsetMinutes(utc) * 60000;
  return utc;
}

function inSeason(isoDate) {
  if (!isISODate(isoDate)) return false;
  const [, m, d] = isoDate.split('-').map(Number);
  const v = m * 100 + d;
  return v >= SEASON.startMonth * 100 + SEASON.startDay && v <= SEASON.endMonth * 100 + SEASON.endDay;
}

function slotIsBookable(isoDate, time) {
  if (!inSeason(isoDate) || !(time in TIME_WINDOWS)) return false;
  return pacificToUtc(isoDate, TIME_WINDOWS[time]) >= Date.now() + LEAD_HOURS * 3600000;
}

function newBookingId() {
  const t = Date.now().toString(36).toUpperCase().slice(-5);
  const r = Math.random().toString(36).toUpperCase().slice(2, 5).padEnd(3, 'X');
  return `${PREFIX}${t}${r}`;
}

function isAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return false; // admin routes stay closed until the secret is set
  const h = request.headers.get('Authorization') || '';
  return h === `Bearer ${env.ADMIN_TOKEN}`;
}

async function stripe(env, method, path, form, idempotencyKey) {
  if (!env.STRIPE_SECRET_KEY) throw new Error('STRIPE_SECRET_KEY is not set on the Worker');
  const headers = {
    Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  const res = await fetch(`https://api.stripe.com/v1/${path}`, {
    method, headers, body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data.error && data.error.message) || `Stripe error ${res.status}`);
  return data;
}

async function slotTaken(env, date, time) {
  const row = await env.DB.prepare(
    `SELECT id FROM bookings WHERE source = ? AND ${ACTIVE} AND ${SLOT_DATE} = ? AND ${SLOT_TIME} = ? LIMIT 1`
  ).bind(SOURCE, date, time).first();
  return !!row;
}

async function findByNote(env, needle) {
  return env.DB.prepare(
    `SELECT id, date, time, payment_status FROM bookings WHERE source = ? AND instr(notes, ?) > 0 LIMIT 1`
  ).bind(SOURCE, needle).first();
}

/* ───────── routes ───────── */

async function availability(url, env, cors) {
  await ensureSchema(env);
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');
  if (!isISODate(from) || !isISODate(to)) return json({ error: 'from and to must be YYYY-MM-DD' }, 400, cors);
  const { results } = await env.DB.prepare(
    `SELECT ${SLOT_DATE} AS d, ${SLOT_TIME} AS t FROM bookings
     WHERE source = ? AND ${ACTIVE} AND ${SLOT_DATE} BETWEEN ? AND ?`
  ).bind(SOURCE, from, to).all();
  return json({ booked: (results || []).map((r) => ({ date: r.d, time: r.t })), windows: Object.keys(TIME_WINDOWS) }, 200, cors);
}

async function createPaymentIntent(request, env, cors) {
  // Never touches D1 — nothing here can block on the schema.
  const body = await request.json().catch(() => ({}));
  const ref = clean(body.ref, 40);
  if (!ref.startsWith(DRAFT_PREFIX)) return json({ error: 'Missing booking reference.' }, 400, cors);
  const pi = await stripe(env, 'POST', 'payment_intents', {
    amount: String(DEPOSIT_CENTS),
    currency: 'usd',
    'automatic_payment_methods[enabled]': 'true',
    description: DEPOSIT_DESCRIPTION,
    'metadata[ref]': ref,
    'metadata[source]': SOURCE,
  }, PI_IDEMPOTENCY(ref));
  return json({ clientSecret: pi.client_secret, id: pi.id, amount: pi.amount }, 200, cors);
}

async function createBooking(request, env, cors) {
  await ensureSchema(env);
  const b = await request.json().catch(() => null);
  if (!b) return json({ error: 'Invalid request.' }, 400, cors);

  const ref = clean(b.ref, 40);
  const type = clean(b.type, 20);
  const pkg = clean(b.package, 40);
  const stories = clean(b.stories, 20);
  const date = clean(b.date, 10);
  const time = clean(b.time, 20);
  const name = clean(b.name, 120);
  const phone = clean(b.phone, 40);
  const email = clean(b.email, 160);
  const address = clean(b.address, 300);
  const addons = Array.isArray(b.addons) ? b.addons.map((a) => clean(a, 40)).filter(Boolean).slice(0, 10) : [];
  const estimate = clean(b.estimate, 60) || 'Online quoting';
  const piId = clean(b.paymentIntentId, 80);
  const payLater = !piId;

  const missing = [];
  if (!ref.startsWith(DRAFT_PREFIX)) missing.push('booking reference');
  if (!LIGHT_TYPES.includes(type)) missing.push('lighting type');
  if (!PACKAGES.includes(pkg)) missing.push('package');
  if (!STORIES.includes(stories)) missing.push('home height');
  if (!isISODate(date)) missing.push('install date');
  if (!(time in TIME_WINDOWS)) missing.push('time window');
  if (!name) missing.push('full name');
  if (phone.replace(/\D/g, '').length < 10) missing.push('phone');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push('email');
  if (!address) missing.push('service address');
  if (missing.length) return json({ error: `Missing or invalid: ${missing.join(', ')}.` }, 400, cors);

  const vehicle = [type, stories, pkg, ...addons.map((a) => `+${a}`)].join(' · ');
  const baseNotes = [
    `Type: ${type}`,
    `Add-ons: ${addons.length ? addons.join(', ') : 'None'}`,
    `Estimate: ${estimate}`,
    `Ref: ${ref}`,
  ];
  const createdAt = new Date().toISOString();

  if (!payLater) {
    // Paid path: verify with Stripe before saving 'Paid'.
    const existing = await findByNote(env, `PI: ${piId}`);
    if (existing) return json({ ok: true, id: existing.id, duplicate: true, payment_status: existing.payment_status }, 200, cors);

    let pi;
    try { pi = await stripe(env, 'GET', `payment_intents/${encodeURIComponent(piId)}`); }
    catch (err) { return json({ error: `Could not verify payment: ${err.message}` }, 402, cors); }
    const okStatus = pi.status === 'succeeded' || pi.status === 'processing';
    if (!okStatus || (pi.metadata && pi.metadata.ref && pi.metadata.ref !== ref) || Number(pi.amount) < DEPOSIT_CENTS) {
      return json({ error: 'Payment was not completed.' }, 402, cors);
    }

    // A paid booking is always saved. If it lost a slot race it's flagged for the office.
    const conflict = !slotIsBookable(date, time) || (await slotTaken(env, date, time));
    const notes = [...baseNotes, `PI: ${piId}`, ...(conflict ? ['SLOT CONFLICT — call customer to confirm a new window'] : [])].join(' · ');
    const id = newBookingId();
    await env.DB.prepare(
      `INSERT INTO bookings (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status, payment_status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Booked', 'Paid')`
    ).bind(id, date, time, pkg, name, phone, email, vehicle, address, notes, SOURCE, createdAt).run();
    return json({ ok: true, id, payment_status: 'Paid', conflict }, 200, cors);
  }

  // Pay Later path: idempotent per draft ref, atomic slot check.
  const existing = await findByNote(env, `Ref: ${ref}`);
  if (existing) return json({ ok: true, id: existing.id, duplicate: true, payment_status: existing.payment_status }, 200, cors);
  if (!slotIsBookable(date, time)) return json({ error: 'That install window is no longer available. Please pick another.', code: 'SLOT_UNAVAILABLE' }, 409, cors);

  const id = newBookingId();
  const notes = baseNotes.join(' · ');
  const res = await env.DB.prepare(
    `INSERT INTO bookings (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status, payment_status)
     SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Booked', 'Pay Later'
     WHERE NOT EXISTS (
       SELECT 1 FROM bookings WHERE source = ? AND ${ACTIVE} AND ${SLOT_DATE} = ? AND ${SLOT_TIME} = ?
     )`
  ).bind(id, date, time, pkg, name, phone, email, vehicle, address, notes, SOURCE, createdAt, SOURCE, date, time).run();
  const changes = res && res.meta ? res.meta.changes : 0;
  if (!changes) return json({ error: 'That install window was just taken. Please pick another.', code: 'SLOT_TAKEN' }, 409, cors);
  return json({ ok: true, id, payment_status: 'Pay Later' }, 200, cors);
}

async function listBookings(url, env, cors) {
  await ensureSchema(env);
  const limit = Math.min(Number(url.searchParams.get('limit')) || 500, 2000);
  const { results } = await env.DB.prepare(
    `SELECT * FROM bookings WHERE source = ? ORDER BY created_at DESC LIMIT ?`
  ).bind(SOURCE, limit).all();
  return json({ bookings: results || [] }, 200, cors);
}

async function patchBooking(id, request, env, cors) {
  await ensureSchema(env);
  const body = await request.json().catch(() => ({}));
  const keys = Object.keys(body).filter((k) => PATCHABLE.includes(k));
  if (!keys.length) return json({ error: `Nothing to update. Allowed: ${PATCHABLE.join(', ')}` }, 400, cors);
  const sets = keys.map((k) => `${k} = ?`).join(', ');
  const values = keys.map((k) => (body[k] == null ? null : clean(body[k], 500)));
  const res = await env.DB.prepare(`UPDATE bookings SET ${sets} WHERE id = ? AND source = ?`)
    .bind(...values, id, SOURCE).run();
  if (!res.meta || !res.meta.changes) return json({ error: 'Booking not found.' }, 404, cors);
  const row = await env.DB.prepare('SELECT * FROM bookings WHERE id = ? AND source = ?').bind(id, SOURCE).first();
  return json({ ok: true, booking: row }, 200, cors);
}

export default {
  async fetch(request, env) {
    const cors = corsHeaders(request, env);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');

    try {
      if (path === '/api/health') return json({ ok: true, source: SOURCE }, 200, cors);
      if (path === '/api/availability' && request.method === 'GET') return await availability(url, env, cors);
      if (path === '/api/payment-intent' && request.method === 'POST') return await createPaymentIntent(request, env, cors);
      if (path === '/api/bookings' && request.method === 'POST') return await createBooking(request, env, cors);
      if (path === '/api/bookings' && request.method === 'GET') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, cors);
        return await listBookings(url, env, cors);
      }
      const m = path.match(/^\/api\/bookings\/([A-Za-z0-9-]+)$/);
      if (m && request.method === 'PATCH') {
        if (!isAdmin(request, env)) return json({ error: 'Unauthorized' }, 401, cors);
        return await patchBooking(m[1], request, env, cors);
      }
      return json({ error: 'Not found' }, 404, cors);
    } catch (err) {
      console.error(err);
      return json({ error: (err && err.message) || 'Server error' }, 500, cors);
    }
  },
};
