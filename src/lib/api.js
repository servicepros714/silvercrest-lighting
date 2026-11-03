/* Worker API client. VITE_API_BASE is the Worker URL (no trailing slash). */

const raw = String(import.meta.env.VITE_API_BASE || '').trim().replace(/\/+$/, '');
export const API_BASE = /YOUR-SUBDOMAIN/i.test(raw) ? '' : raw;

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    });
  } catch {
    throw new Error('We couldn’t reach the booking server. Check your connection and try again.');
  }
  const type = res.headers.get('content-type') || '';
  if (!type.includes('application/json')) {
    // e.g. the Pages fallback returned index.html because VITE_API_BASE isn't set
    throw new Error('The booking server isn’t connected yet. Please call us to book.');
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.code = data.code;
    throw err;
  }
  return data;
}

export const getAvailability = (from, to) =>
  request(`/api/availability?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`);

export const createPaymentIntent = (ref) =>
  request('/api/payment-intent', { method: 'POST', body: JSON.stringify({ ref }) });

export const createBooking = (payload) =>
  request('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
