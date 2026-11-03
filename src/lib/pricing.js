import { ADDONS, PACKAGES, STORY_OPTIONS } from '../data/business.js';

export const QUOTE = 'Online quoting';

export const money = (n) => `$${Number(n).toLocaleString('en-US', { maximumFractionDigits: 0 })}`;

/* "Starting at $499" or "Online quoting" when a price isn't set. */
export function priceLabel(n) {
  return n == null ? QUOTE : `Starting at ${money(n)}`;
}

export function addonLabel(a) {
  if (a.price == null) return QUOTE;
  return a.flat ? money(a.price) : `+${money(a.price)}`;
}

export function packagePrice(pkgId, type) {
  const p = PACKAGES.find((x) => x.id === pkgId);
  if (!p) return null;
  return p.price[type || 'Seasonal'] ?? null;
}

/* Add-ons that apply to the chosen lighting type. */
export function addonsFor(type) {
  return ADDONS.filter((a) => !(a.seasonalOnly && type === 'Permanent'));
}

/* Starting estimate for a draft. Permanent, or any unset price, reads "Online quoting". */
export function estimate(draft) {
  if (!draft.pkg) return { label: '—', amount: null };
  if (draft.type === 'Permanent') return { label: QUOTE, amount: null };
  const base = packagePrice(draft.pkg, draft.type);
  if (base == null) return { label: QUOTE, amount: null };
  const story = STORY_OPTIONS.find((s) => s.id === draft.stories);
  let total = base + (story && story.pct ? (base * story.pct) / 100 : 0);
  for (const id of draft.addons || []) {
    const a = ADDONS.find((x) => x.id === id);
    if (!a) continue;
    if (a.price == null) return { label: QUOTE, amount: null };
    total += a.price;
  }
  return { label: `Starting at ${money(total)}`, amount: total };
}
