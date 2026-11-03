/* FAQ with live search: type to filter questions + answers, matches are highlighted;
   accordion below. No match → call prompt. */
import { useId, useMemo, useState } from 'react';
import { BUSINESS, FAQS } from '../data/business.js';
import { ChevronDown, PhoneIcon, SearchIcon } from '../components/Icons.jsx';

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function Mark({ text, q }) {
  if (!q) return text;
  const parts = text.split(new RegExp(`(${escapeRe(q)})`, 'ig'));
  return parts.map((p, i) => (p.toLowerCase() === q.toLowerCase() ? <mark key={i}>{p}</mark> : p));
}

export default function FAQ() {
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(0);
  const base = useId();
  const term = q.trim();

  const items = useMemo(() => {
    const t = term.toLowerCase();
    return FAQS.map((f, i) => ({ ...f, i })).filter((f) => !t || f.q.toLowerCase().includes(t) || f.a.toLowerCase().includes(t));
  }, [term]);

  return (
    <section id="faq" className="section faq" aria-labelledby="faq-title">
      <div className="container faq__grid">
        <header className="shead" data-reveal>
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="h2">Questions before the first bulb</h2>
          <p className="shead__sub">Outlets, leasing, timers, weather and takedown — search or browse.</p>
          <label className="faq__search">
            <SearchIcon />
            <span className="sr-only">Search the FAQ</span>
            <input
              type="search"
              value={q}
              placeholder="Try “outlet” or “timer”"
              onChange={(e) => { setQ(e.target.value); setOpen(-1); }}
            />
          </label>
          <p className="faq__count" aria-live="polite">{term ? `${items.length} of ${FAQS.length} answers match` : `${FAQS.length} answers`}</p>
        </header>

        <div className="faq__list" data-reveal>
          {items.map((f) => {
            const isOpen = open === f.i || (term && items.length <= 2);
            const id = `${base}-${f.i}`;
            return (
              <div key={f.i} className={`qa ${isOpen ? 'is-open' : ''}`}>
                <h3 className="qa__h">
                  <button
                    type="button"
                    className="qa__q"
                    aria-expanded={!!isOpen}
                    aria-controls={id}
                    onClick={() => setOpen(open === f.i ? -1 : f.i)}
                  >
                    <span><Mark text={f.q} q={term} /></span>
                    <ChevronDown className="qa__chev" />
                  </button>
                </h3>
                <div id={id} className="qa__a" role="region" hidden={!isOpen}>
                  <p><Mark text={f.a} q={term} /></p>
                </div>
              </div>
            );
          })}
          {!items.length && (
            <div className="faq__none">
              <p>No answer matches “{term}”. Ask us directly — we’re happy to help.</p>
              <a className="btn btn--navy" href={BUSINESS.phoneHref}><PhoneIcon /> {BUSINESS.phoneDisplay}</a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
