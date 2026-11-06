import { createElement, createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { getAvailability } from './api.js';
import { BOOKING } from '../data/business.js';
import { earliestOpen, seasonRange, slotKey } from './time.js';

/* Booked slots for the current season, from the Worker (source-scoped there).
   One fetch shared by the header, hero, lift board and booking calendar. */
const AvailCtx = createContext(null);

export function AvailabilityProvider({ children }) {
  // Online booking off → no Worker to ask; skip the request entirely.
  const [state, setState] = useState({ booked: new Set(), loading: BOOKING.online, error: '' });

  const load = useCallback(async () => {
    if (!BOOKING.online) return;
    const { start, end } = seasonRange();
    setState((s) => ({ ...s, loading: true, error: '' }));
    try {
      const data = await getAvailability(start, end);
      const booked = new Set((data.booked || []).map((b) => slotKey(b.date, b.time)));
      setState({ booked, loading: false, error: '' });
    } catch (err) {
      setState({ booked: new Set(), loading: false, error: err.message || 'Availability unavailable' });
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const value = useMemo(() => ({
    ...state,
    reload: load,
    earliest: state.loading ? null : earliestOpen(state.booked),
  }), [state, load]);

  return createElement(AvailCtx.Provider, { value }, children);
}

export default function useAvailability() {
  const ctx = useContext(AvailCtx);
  if (!ctx) throw new Error('useAvailability must be used inside AvailabilityProvider');
  return ctx;
}
