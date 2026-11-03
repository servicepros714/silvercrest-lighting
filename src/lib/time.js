/* Pacific-time season math (DST-aware). Mirrors the Worker's rules. */

export const TZ = 'America/Los_Angeles';
export const SEASON = { startMonth: 10, startDay: 20, endMonth: 12, endDay: 20 }; // Oct 20 – Dec 20
export const WINDOWS = [
  { id: '8AM–12PM', label: '8AM–12PM', sub: 'Morning install', hour: 8 },
  { id: '12PM–4PM', label: '12PM–4PM', sub: 'Afternoon install', hour: 12 },
];
export const LEAD_HOURS = 48;

const pad = (n) => String(n).padStart(2, '0');
export const iso = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

function partsIn(utcMs) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  }).formatToParts(new Date(utcMs));
  return Object.fromEntries(parts.map((x) => [x.type, x.value]));
}

function tzOffsetMinutes(utcMs) {
  const p = partsIn(utcMs);
  const asUTC = Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour % 24, +p.minute, +p.second);
  return Math.round((asUTC - utcMs) / 60000);
}

export function pacificToUtc(isoDate, hour) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const guess = Date.UTC(y, m - 1, d, hour, 0, 0);
  let utc = guess - tzOffsetMinutes(guess) * 60000;
  utc = guess - tzOffsetMinutes(utc) * 60000;
  return utc;
}

export function pacificToday(now = Date.now()) {
  const p = partsIn(now);
  return iso(+p.year, +p.month, +p.day);
}

/* The season that is running now, or the next one if this year's has ended. */
export function seasonRange(now = Date.now()) {
  const today = pacificToday(now);
  let y = +today.slice(0, 4);
  if (today > iso(y, SEASON.endMonth, SEASON.endDay)) y += 1;
  return { year: y, start: iso(y, SEASON.startMonth, SEASON.startDay), end: iso(y, SEASON.endMonth, SEASON.endDay) };
}

export function addDays(isoDate, n) {
  const [y, m, d] = isoDate.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n, 12));
  return iso(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
}

export function datesBetween(start, end) {
  const out = [];
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d);
  return out;
}

export function weekday(isoDate) {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d, 12)).getUTCDay(); // 0 = Sun
}

export function slotBookable(isoDate, windowId, now = Date.now()) {
  const w = WINDOWS.find((x) => x.id === windowId);
  if (!w) return false;
  const { start, end } = seasonRange(now);
  if (isoDate < start || isoDate > end) return false;
  return pacificToUtc(isoDate, w.hour) >= now + LEAD_HOURS * 3600000;
}

export const slotKey = (date, time) => `${date}|${time}`;

/* Open windows for a date given the booked set. */
export function openWindows(isoDate, booked, now = Date.now()) {
  return WINDOWS.filter((w) => slotBookable(isoDate, w.id, now) && !(booked && booked.has(slotKey(isoDate, w.id))));
}

export function earliestOpen(booked, now = Date.now()) {
  const { start, end } = seasonRange(now);
  const from = pacificToday(now) > start ? pacificToday(now) : start;
  for (const d of datesBetween(from, end)) {
    const open = openWindows(d, booked, now);
    if (open.length) return { date: d, time: open[0].id };
  }
  return null;
}

export function fmtDate(isoDate, opts = { weekday: 'short', month: 'short', day: 'numeric' }) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', ...opts }).format(new Date(Date.UTC(y, m - 1, d, 12)));
}

export const fmtLong = (isoDate) => fmtDate(isoDate, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
