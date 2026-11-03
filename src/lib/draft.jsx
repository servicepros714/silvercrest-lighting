import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

const KEY = 'silvercrest-draft-v1';
const LAST = 'silvercrest-last-booking';

const newRef = () =>
  `SCR-${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

const EMPTY = {
  type: '', pkg: '', stories: '', addons: [], date: '', time: '',
  name: '', phone: '', email: '', address: '',
};

function read(key) {
  try { const v = window.localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function write(key, value) {
  try {
    if (value == null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch { /* storage blocked — the draft simply lives in memory */ }
}

const DraftCtx = createContext(null);

export function DraftProvider({ children }) {
  const [draft, setDraft] = useState(() => {
    const saved = read(KEY);
    return saved && saved.ref ? { ...EMPTY, ...saved } : { ...EMPTY, ref: newRef() };
  });

  useEffect(() => { write(KEY, draft); }, [draft]);

  const update = useCallback((patch) => setDraft((d) => ({ ...d, ...patch })), []);
  const reset = useCallback(() => setDraft({ ...EMPTY, ref: newRef() }), []);

  const value = useMemo(() => ({ draft, update, reset }), [draft, update, reset]);
  return <DraftCtx.Provider value={value}>{children}</DraftCtx.Provider>;
}

export function useDraft() {
  const ctx = useContext(DraftCtx);
  if (!ctx) throw new Error('useDraft must be used inside DraftProvider');
  return ctx;
}

export const saveLastBooking = (b) => write(LAST, b);
export const readLastBooking = () => read(LAST);
