/* SUMMIT CARDS: two cards with mountain-peak tops (Front & Sides is the taller,
   gold-capped peak) with Seasonal / Permanent prices as "elevation" readouts.
   Add-ons are a LANTERN ROW that light up when picked; picks carry into booking.
   One Book Now for the section. */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADDONS, PACKAGES, STORY_OPTIONS } from '../data/business.js';
import { useDraft } from '../lib/draft.jsx';
import { addonLabel, priceLabel } from '../lib/pricing.js';
import { revealDelay } from '../lib/useReveal.js';
import { ArrowRight, Lantern, PeakIcon } from '../components/Icons.jsx';

function Peak({ tall }) {
  // Faceted, brushed-silver peak (like the logo's mountains); the summit card gets a gold cap.
  return (
    <svg className="summit__peak" viewBox="0 0 400 140" preserveAspectRatio="none" aria-hidden="true">
      <defs>
        <linearGradient id={`pkL${tall ? 't' : 's'}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#D3D5D8" /><stop offset="1" stopColor="#9FA1A4" />
        </linearGradient>
        <linearGradient id={`pkR${tall ? 't' : 's'}`} x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8A8C90" /><stop offset="1" stopColor="#5A5D61" />
        </linearGradient>
      </defs>
      {tall ? (
        <>
          <path d="M0 140 L0 96 L90 56 L130 78 L230 6 L310 70 L350 52 L400 84 L400 140 Z" fill={`url(#pkR${'t'})`} />
          <path d="M0 140 L0 96 L90 56 L110 90 L230 6 L200 80 L150 140 Z" fill={`url(#pkL${'t'})`} />
          <path className="summit__cap" d="M230 6 L258 26 L244 30 L232 22 L218 34 L208 24 Z" />
        </>
      ) : (
        <>
          <path d="M0 140 L0 110 L120 70 L170 92 L250 40 L330 92 L400 76 L400 140 Z" fill={`url(#pkR${'s'})`} />
          <path d="M0 140 L0 110 L120 70 L140 100 L250 40 L220 104 L180 140 Z" fill={`url(#pkL${'s'})`} />
        </>
      )}
    </svg>
  );
}

export default function Packages() {
  const navigate = useNavigate();
  const { update } = useDraft();
  const [picks, setPicks] = useState([]);
  const twoStory = STORY_OPTIONS.find((s) => s.pct);

  const toggle = (id) => setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  const bookNow = () => {
    update({ addons: picks });
    navigate('/book');
  };

  return (
    <section id="packages" className="section packages" aria-labelledby="pk-title">
      <div className="container">
        <header className="shead shead--center" data-reveal>
          <p className="eyebrow">Packages</p>
          <h2 id="pk-title" className="h2">Choose how far up the roofline we climb</h2>
          <p className="shead__sub">Both packages come as seasonal Christmas lights or permanent lighting. Prices are “starting at”; your final price is confirmed at the on-site visit.</p>
        </header>

        <div className="summits">
          {PACKAGES.map((p, i) => {
            const tall = p.peak >= 1;
            return (
              <article key={p.id} className={`summit ${tall ? 'summit--tall' : ''}`} style={revealDelay(i, 140)} data-reveal>
                <Peak tall={tall} />
                <div className="summit__body">
                  {tall && <span className="summit__badge">Full coverage</span>}
                  <h3 className="summit__name">{p.name}</h3>
                  <p className="summit__cover">{p.coverage}</p>
                  <dl className="elev">
                    <div className="elev__row">
                      <dt>Seasonal</dt>
                      <dd>{priceLabel(p.price.Seasonal)}</dd>
                    </div>
                    <div className="elev__row">
                      <dt>Permanent</dt>
                      <dd>{priceLabel(p.price.Permanent)}</dd>
                    </div>
                  </dl>
                  <ul className="summit__list">
                    {p.features.map((f) => (
                      <li key={f}><PeakIcon className="summit__bullet" /> <span>{f}</span></li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>

        <p className="story-note" data-reveal>
          <span className="story-note__k">Two-story home</span>
          <span className="story-note__v">{twoStory ? twoStory.note : '+50% of package price'}</span>
        </p>

        <div className="lanterns" data-reveal>
          <div className="lanterns__head">
            <h3 className="h3">Light up your add-ons</h3>
            <p className="lanterns__sub">Tap a lantern to add it. Your picks carry straight into booking.</p>
          </div>
          <ul className="lanterns__row">
            {ADDONS.map((a, i) => {
              const on = picks.includes(a.id);
              return (
                <li key={a.id} style={revealDelay(i, 70)}>
                  <button type="button" className={`lamp ${on ? 'is-on' : ''}`} aria-pressed={on} onClick={() => toggle(a.id)}>
                    <Lantern lit={on} className="lamp__icon" />
                    <span className="lamp__name">{a.name}</span>
                    <span className="lamp__price">{addonLabel(a)}{a.seasonalOnly ? ' · seasonal' : ''}</span>
                    <span className="lamp__check" aria-hidden="true">{on ? 'Added' : 'Add'}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="packages__cta" data-reveal>
          <p className="packages__picks" aria-live="polite">
            {picks.length ? <>Your add-ons: <b>{picks.join(', ')}</b></> : 'No add-ons picked — you can add them while booking.'}
          </p>
          <button type="button" className="btn btn--gold btn--lg" onClick={bookNow}>Book Now <ArrowRight /></button>
        </div>
      </div>
    </section>
  );
}
