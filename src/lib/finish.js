import { createBooking } from './api.js';
import { estimate } from './pricing.js';
import { saveLastBooking } from './draft.jsx';

/* Payload for POST /api/bookings — shared by card, wallet, redirect and pay-later paths. */
export function bookingPayload(draft) {
  return {
    ref: draft.ref,
    type: draft.type,
    package: draft.pkg,
    stories: draft.stories,
    addons: draft.addons,
    date: draft.date,
    time: draft.time,
    name: draft.name.trim(),
    phone: draft.phone.trim(),
    email: draft.email.trim(),
    address: draft.address.trim(),
    estimate: estimate(draft).label,
  };
}

/* Saves the booking, remembers it for /confirmation, then clears the draft. */
export async function finishBooking(draft, reset, { paymentIntentId } = {}) {
  const payload = bookingPayload(draft);
  const res = await createBooking(paymentIntentId ? { ...payload, paymentIntentId } : { ...payload, payLater: true });
  saveLastBooking({
    id: res.id,
    paymentStatus: res.payment_status || (paymentIntentId ? 'Paid' : 'Pay Later'),
    conflict: !!res.conflict,
    ...payload,
  });
  reset();
  return res;
}
