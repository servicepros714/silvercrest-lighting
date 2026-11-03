/* Booking: 6 steps — Lighting type → Package → Home & add-ons → Date → Time → Your info.
   SUMMIT CLIMB progress on top, question card left, sticky TRAIL LOG right
   (a disclosure on phones). Back / Continue become a sticky bar on phones. */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { BUSINESS, LIGHT_TYPES, PACKAGES, STORY_OPTIONS } from '../data/business.js';
import { useDraft } from '../lib/draft.jsx';
import { addonLabel, addonsFor, estimate, priceLabel } from '../lib/pricing.js';
import useAvailability from '../lib/useAvailability.js';
import {
  WINDOWS, addDays, earliestOpen, fmtDate, fmtLong, openWindows, pacificToday, seasonRange, slotBookable, weekday,
} from '../lib/time.js';
import SummitProgress from '../components/SummitProgress.jsx';
import { ArrowLeft, ArrowRight, CheckIcon, ChevronDown } from '../components/Icons.jsx';

const STEPS = [
  { id: 'type', short: 'Lighting', title: 'What kind of lighting?', sub: 'Seasonal lights come down after the holidays. Permanent lighting stays up year-round.' },
  { id: 'pkg', short: 'Package', title: 'How much of the roofline?', sub: 'Prices are “starting at” — your final price is confirmed at the on-site visit.' },
  { id: 'home', short: 'Home', title: 'Your home & add-ons', sub: 'Pick your home height, then any extras you’d like.' },
  { id: 'date', short: 'Date', title: 'Pick an install date', sub: 'Installs run Oct 20 – Dec 20, every day. The earliest window is 48 hours out (Pacific time).' },
  { id: 'time', short: 'Time', title: 'Choose a time window', sub: 'Our crew arrives within your window.' },
  { id: 'info', short: 'Your info', title: 'Where are we installing?', sub: 'We’ll text and email your confirmation.' },
];

const FIELDS = [
  { key: 'name', label: 'Full Name', type: 'text', auto: 'name', place: 'First and last name' },
  { key: 'phone', label: 'Phone', type: 'tel', auto: 'tel', place: '(555) 555-5555' },
  { key: 'email', label: 'Email', type: 'email', auto: 'email', place: 'you@example.com' },
  { key: 'address', label: 'Service Address', type: 'text', auto: 'street-address', place: 'Street, city, ZIP', wide: true },
];

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function validate(step, d, booked) {
  switch (STEPS[step].id) {
    case 'type': return d.type ? null : { msg: 'Please choose a lighting type.', focus: 'type' };
    case 'pkg': return d.pkg ? null : { msg: 'Please choose a package.', focus: 'pkg' };
    case 'home': return d.stories ? null : { msg: 'Please choose your home height (1-story or 2-story).', focus: 'stories' };
    case 'date':
      if (!d.date) return { msg: 'Please pick an install date.', focus: 'date' };
      if (!openWindows(d.date, booked).length) return { msg: 'That install date is no longer available. Please pick another date.', focus: 'date' };
      return null;
    case 'time':
      if (!d.time) return { msg: 'Please choose a time window.', focus: 'time' };
      if (!openWindows(d.date, booked).some((w) => w.id === d.time)) return { msg: 'That time window was just taken. Please choose another.', focus: 'time' };
      return null;
    case 'info': {
      if (!d.name.trim()) return { msg: 'Please enter your Full Name.', focus: 'name' };
      if (d.phone.replace(/\D/g, '').length < 10) return { msg: 'Please enter a valid Phone number (10 digits).', focus: 'phone' };
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email.trim())) return { msg: 'Please enter a valid Email address.', focus: 'email' };
      if (!d.address.trim()) return { msg: 'Please enter your Service Address.', focus: 'address' };
      return null;
    }
    default: return null;
  }
}

/* First step that isn't complete — how far the customer may jump. */
function firstIncomplete(d, booked) {
  for (let i = 0; i < STEPS.length; i++) if (validate(i, d, booked)) return i;
  return STEPS.length - 1;
}

function Choice({ type = 'radio', name, checked, onChange, title, note, aside, id, autoFocusRef }) {
  return (
    <label className={`choice ${checked ? 'is-on' : ''}`} htmlFor={id}>
      <input ref={autoFocusRef} id={id} type={type} name={name} checked={checked} onChange={onChange} className="choice__input" />
      <span className={`choice__box choice__box--${type}`} aria-hidden="true">{checked && type === 'checkbox' ? <CheckIcon /> : null}</span>
      <span className="choice__text">
        <span className="choice__title">{title}</span>
        {note && <span className="choice__note">{note}</span>}
      </span>
      {aside && <span className="choice__aside">{aside}</span>}
    </label>
  );
}

function Calendar({ value, onPick, booked, firstRef }) {
  const { start, end } = seasonRange();
  const today = pacificToday();
  const months = useMemo(() => {
    const out = [];
    let m = start.slice(0, 7);
    while (m <= end.slice(0, 7)) {
      out.push(m);
      const [y, mm] = m.split('-').map(Number);
      m = mm === 12 ? `${y + 1}-01` : `${y}-${String(mm + 1).padStart(2, '0')}`;
    }
    return out;
  }, [start, end]);

  const initial = useMemo(() => {
    const target = value || (earliestOpen(booked) || {}).date || start;
    const idx = months.indexOf(target.slice(0, 7));
    return idx < 0 ? 0 : idx;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [mi, setMi] = useState(initial);
  const month = months[mi];
  const first = `${month}-01`;
  const lead = weekday(first);
  const days = [];
  for (let d = first; d.slice(0, 7) === month; d = addDays(d, 1)) days.push(d);
  let focusAssigned = false;

  return (
    <div className="cal">
      <div className="cal__head">
        <button type="button" className="roundbtn roundbtn--sm" onClick={() => setMi((i) => Math.max(0, i - 1))} disabled={mi === 0} aria-label="Previous month"><ArrowLeft /></button>
        <p className="cal__month" aria-live="polite">{fmtDate(first, { month: 'long', year: 'numeric' })}</p>
        <button type="button" className="roundbtn roundbtn--sm" onClick={() => setMi((i) => Math.min(months.length - 1, i + 1))} disabled={mi === months.length - 1} aria-label="Next month"><ArrowRight /></button>
      </div>
      <div className="cal__grid" role="grid" aria-label="Install dates">
        {DOW.map((d) => <span key={d} className="cal__dow" aria-hidden="true">{d.slice(0, 2)}</span>)}
        {Array.from({ length: lead }, (_, i) => <span key={`b${i}`} aria-hidden="true" />)}
        {days.map((d) => {
          const inSeason = d >= start && d <= end;
          const bookableWins = inSeason ? WINDOWS.filter((w) => slotBookable(d, w.id)).length : 0;
          const open = inSeason ? openWindows(d, booked).length : 0;
          const disabled = !open;
          const selected = value === d;
          let tag = '';
          if (inSeason && bookableWins && !open) tag = 'Full';
          else if (open === 1) tag = '1 left';
          const attachRef = !disabled && !focusAssigned && (selected || !value);
          if (attachRef) focusAssigned = true;
          return (
            <button
              key={d}
              ref={attachRef ? firstRef : undefined}
              type="button"
              className={`cal__day ${selected ? 'is-on' : ''} ${d === today ? 'is-today' : ''} ${tag === 'Full' ? 'is-full' : ''} ${open === 1 ? 'is-one' : ''}`}
              disabled={disabled}
              aria-pressed={selected}
              aria-label={`${fmtLong(d)}${disabled ? ' — unavailable' : open === 1 ? ' — 1 window left' : ''}`}
              onClick={() => onPick(d)}
            >
              <span className="cal__n">{Number(d.slice(8))}</span>
              {tag && <span className="cal__tag">{tag}</span>}
            </button>
          );
        })}
      </div>
      <p className="cal__legend"><span className="cal__key cal__key--open" /> Open <span className="cal__key cal__key--one" /> 1 window left <span className="cal__key cal__key--off" /> Unavailable</p>
    </div>
  );
}

function TrailLog({ draft, step, reached, onJump, est }) {
  const rows = [
    { i: 0, k: 'Lighting', v: draft.type },
    { i: 1, k: 'Package', v: draft.pkg },
    { i: 2, k: 'Home', v: draft.stories ? [draft.stories, ...draft.addons.map((a) => `+${a}`)].join(' · ') : '' },
    { i: 3, k: 'Date', v: draft.date ? fmtDate(draft.date) : '' },
    { i: 4, k: 'Time', v: draft.time },
    { i: 5, k: 'Contact', v: draft.name },
  ];
  return (
    <div className="log">
      <ol className="log__list">
        {rows.map((r) => (
          <li key={r.k} className={`log__row ${r.v ? 'is-done' : ''} ${r.i === step ? 'is-current' : ''}`}>
            <span className="log__dot" aria-hidden="true">{r.v ? <CheckIcon /> : r.i + 1}</span>
            <span className="log__k">{r.k}</span>
            <span className="log__v">{r.v || '—'}</span>
            {r.v && r.i <= reached && r.i !== step ? (
              <button type="button" className="log__edit" onClick={() => onJump(r.i)} aria-label={`Change ${r.k}`}>Change</button>
            ) : <span />}
          </li>
        ))}
      </ol>
      <div className="log__est">
        <span>Starting estimate</span>
        <b>{est.label}</b>
      </div>
      <p className="log__note">Reserve with a {BUSINESS.depositLabel} deposit at checkout (applied to your final invoice), or pay at the visit.</p>
    </div>
  );
}

export default function Book() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { draft, update } = useDraft();
  const { booked, loading, error, reload } = useAvailability();
  const [step, setStep] = useState(0);
  const [err, setErr] = useState('');
  const [logOpen, setLogOpen] = useState(false);
  const focusRefs = useRef({});
  const cardRef = useRef(null);
  const reached = firstIncomplete(draft, booked);
  const est = estimate(draft);
  const s = STEPS[step];

  // Prefill a date from the lift board (/book?date=YYYY-MM-DD) when it's still open.
  useEffect(() => {
    const d = params.get('date');
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d) && !loading && openWindows(d, booked).length) {
      if (draft.date !== d) update({ date: d, time: '' });
    }
    const st = Number(params.get('step'));
    if (st > 0 && !loading) setStep(Math.min(st, firstIncomplete(draft, booked)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  // Auto-scroll to top on every step.
  useEffect(() => { window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); setErr(''); }, [step]);

  // Keep add-ons valid for the lighting type (no off-season storage on Permanent).
  useEffect(() => {
    const allowed = addonsFor(draft.type).map((a) => a.id);
    if (draft.addons.some((a) => !allowed.includes(a))) update({ addons: draft.addons.filter((a) => allowed.includes(a)) });
  }, [draft.type, draft.addons, update]);

  const focusField = useCallback((key) => {
    const el = focusRefs.current[key];
    if (el && el.focus) { el.focus({ preventScroll: false }); }
  }, []);

  const goNext = () => {
    const v = validate(step, draft, booked);
    if (v) {
      setErr(v.msg);
      setTimeout(() => focusField(v.focus), 0);
      return;
    }
    setErr('');
    if (step === STEPS.length - 1) navigate('/checkout');
    else setStep(step + 1);
  };
  const goBack = () => { if (step > 0) setStep(step - 1); else navigate('/'); };
  const jump = (i) => { if (i <= reached) setStep(i); setLogOpen(false); };

  const setRef = (key) => (el) => { focusRefs.current[key] = el; };
  const pickDate = (d) => {
    const stillOpen = openWindows(d, booked).some((w) => w.id === draft.time);
    update({ date: d, time: stillOpen ? draft.time : '' });
    setErr('');
  };

  const addons = addonsFor(draft.type);
  const wins = draft.date ? WINDOWS.map((w) => ({ ...w, open: openWindows(draft.date, booked).some((o) => o.id === w.id), bookable: slotBookable(draft.date, w.id) })) : [];

  return (
    <div className="bk">
      <div className="container">
        <SummitProgress steps={STEPS} current={step} reached={reached} onJump={jump} />

        <div className="bk__layout">
          <section className="qcard" ref={cardRef} aria-labelledby="q-title">
            <header className="qcard__head">
              <p className="qcard__step">Step {step + 1} of {STEPS.length}</p>
              <h1 id="q-title" className="qcard__title">{s.title}</h1>
              <p className="qcard__sub">{s.sub}</p>
            </header>

            <div className="qcard__body">
              {err && <p className="bk__error" role="alert">{err}</p>}

              {s.id === 'type' && (
                <fieldset className="choices choices--2">
                  <legend className="sr-only">Lighting type</legend>
                  {LIGHT_TYPES.map((t, i) => (
                    <Choice
                      key={t.id} id={`type-${t.id}`} name="type"
                      autoFocusRef={i === 0 ? setRef('type') : undefined}
                      checked={draft.type === t.id}
                      onChange={() => { update({ type: t.id }); setErr(''); }}
                      title={t.name} note={`${t.tag} — ${t.blurb}`}
                    />
                  ))}
                </fieldset>
              )}

              {s.id === 'pkg' && (
                <fieldset className="choices choices--2">
                  <legend className="sr-only">Package</legend>
                  {PACKAGES.map((p, i) => (
                    <Choice
                      key={p.id} id={`pkg-${p.id}`} name="pkg"
                      autoFocusRef={i === 0 ? setRef('pkg') : undefined}
                      checked={draft.pkg === p.id}
                      onChange={() => { update({ pkg: p.id }); setErr(''); }}
                      title={p.name}
                      note={`${p.coverage}. ${p.features.slice(0, 3).join(' · ')}${p.features.length > 3 ? ' …' : ''}`}
                      aside={priceLabel(p.price[draft.type || 'Seasonal'])}
                    />
                  ))}
                </fieldset>
              )}

              {s.id === 'home' && (
                <>
                  <fieldset className="choices choices--2">
                    <legend className="bk__legend">Home height</legend>
                    {STORY_OPTIONS.map((o, i) => (
                      <Choice
                        key={o.id} id={`st-${o.id}`} name="stories"
                        autoFocusRef={i === 0 ? setRef('stories') : undefined}
                        checked={draft.stories === o.id}
                        onChange={() => { update({ stories: o.id }); setErr(''); }}
                        title={o.name} note={o.note}
                      />
                    ))}
                  </fieldset>
                  <fieldset className="choices choices--2">
                    <legend className="bk__legend">Add-ons <span>(optional)</span></legend>
                    {addons.map((a) => {
                      const on = draft.addons.includes(a.id);
                      return (
                        <Choice
                          key={a.id} type="checkbox" id={`ad-${a.id}`} name="addons"
                          checked={on}
                          onChange={() => update({ addons: on ? draft.addons.filter((x) => x !== a.id) : [...draft.addons, a.id] })}
                          title={a.name} aside={addonLabel(a)}
                        />
                      );
                    })}
                  </fieldset>
                </>
              )}

              {s.id === 'date' && (
                <>
                  {loading && <p className="bk__loading">Loading live availability…</p>}
                  {error && (
                    <p className="bk__warn">
                      Live availability couldn’t load, so some dates may already be taken. We’ll confirm your window.
                      {' '}<button type="button" className="linkbtn" onClick={reload}>Try again</button>
                    </p>
                  )}
                  {!loading && <Calendar value={draft.date} onPick={pickDate} booked={booked} firstRef={setRef('date')} />}
                  {draft.date && <p className="bk__for">Selected: <b>{fmtLong(draft.date)}</b></p>}
                </>
              )}

              {s.id === 'time' && (
                <>
                  <p className="bk__for">Install date: <b>{fmtLong(draft.date)}</b></p>
                  <fieldset className="choices choices--2">
                    <legend className="sr-only">Time window</legend>
                    {wins.map((w, i) => (
                      <label key={w.id} className={`choice ${draft.time === w.id ? 'is-on' : ''} ${!w.open ? 'is-off' : ''}`} htmlFor={`tw-${i}`}>
                        <input
                          ref={i === wins.findIndex((x) => x.open) ? setRef('time') : undefined}
                          id={`tw-${i}`} type="radio" name="time" className="choice__input"
                          checked={draft.time === w.id} disabled={!w.open}
                          onChange={() => { update({ time: w.id }); setErr(''); }}
                        />
                        <span className="choice__box choice__box--radio" aria-hidden="true" />
                        <span className="choice__text">
                          <span className="choice__title">{w.label}</span>
                          <span className="choice__note">{w.sub}</span>
                        </span>
                        <span className="choice__aside">{w.open ? 'Open' : w.bookable ? 'Booked' : 'Too soon'}</span>
                      </label>
                    ))}
                  </fieldset>
                </>
              )}

              {s.id === 'info' && (
                <div className="form">
                  {FIELDS.map((f) => (
                    <div key={f.key} className={`field ${f.wide ? 'field--wide' : ''}`}>
                      <label htmlFor={`f-${f.key}`}>{f.label}</label>
                      <input
                        ref={setRef(f.key)}
                        id={`f-${f.key}`}
                        type={f.type}
                        autoComplete={f.auto}
                        inputMode={f.type === 'tel' ? 'tel' : undefined}
                        placeholder={f.place}
                        value={draft[f.key]}
                        onChange={(e) => { update({ [f.key]: e.target.value }); if (err) setErr(''); }}
                        aria-invalid={err && err.includes(f.label) ? 'true' : undefined}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            <footer className="qcard__foot">
              <div className="est">
                <span className="est__k">Starting estimate</span>
                <span className="est__val">{est.label}</span>
              </div>
              <div className="bk__actions">
                <button type="button" className="btn btn--outline" onClick={goBack}><ArrowLeft /> Back</button>
                <button type="button" className="btn btn--gold" onClick={goNext}>
                  {step === STEPS.length - 1 ? 'Continue to checkout' : 'Continue'} <ArrowRight />
                </button>
              </div>
            </footer>
          </section>

          <aside className={`trail-log ${logOpen ? 'is-open' : ''}`} aria-label="Your selections">
            <button type="button" className="trail-log__toggle" aria-expanded={logOpen} onClick={() => setLogOpen((o) => !o)}>
              <span>Trail log</span>
              <span className="trail-log__est">{est.label}</span>
              <ChevronDown className="trail-log__chev" />
            </button>
            <h2 className="trail-log__title">Trail log</h2>
            <div className="trail-log__body">
              <TrailLog draft={draft} step={step} reached={reached} onJump={jump} est={est} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
