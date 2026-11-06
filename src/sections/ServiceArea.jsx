/* TRAIL PATCHES: each city is a round stitched trail patch; the home base wears gold. */
import { Link } from 'react-router-dom';
import { BUSINESS, SERVICE_AREA } from '../data/business.js';
import { revealDelay } from '../lib/useReveal.js';
import { PhoneIcon } from '../components/Icons.jsx';

function Patch({ city, home, i }) {
  return (
    <li className={`patch ${home ? 'patch--home' : ''}`} style={revealDelay(i, 60)} data-reveal>
      <svg className="patch__art" viewBox="0 0 120 120" aria-hidden="true">
        <circle cx="60" cy="60" r="56" className="patch__base" />
        <circle cx="60" cy="60" r="49" className="patch__stitch" />
        <path d="M24 78 L46 52 L56 62 L70 40 L96 78 Z" className="patch__mtn" />
        <path d="M70 40 L76 49 L70 47 L64 50 Z" className="patch__snow" />
        <path d="M24 84 C 44 92, 76 92, 96 82" className="patch__swoosh" />
      </svg>
      <span className="patch__city">{city}</span>
      {home && <span className="patch__home">Home base</span>}
    </li>
  );
}

export default function ServiceArea() {
  return (
    <section id="area" className="section area" aria-labelledby="area-title">
      <div className="container area__grid">
        <header className="shead" data-reveal>
          <p className="eyebrow">Service area</p>
          <h2 id="area-title" className="h2">Every patch on our map</h2>
          <p className="shead__sub">
            Our crews install across {BUSINESS.city} and all over {BUSINESS.region}. Don’t see your city?
            {BUSINESS.phoneHref ? 'Call' : 'Ask us'} — if your roofline is within a short drive, we can usually make it work.
          </p>
          {BUSINESS.phoneHref
            ? <a className="btn btn--navy" href={BUSINESS.phoneHref}><PhoneIcon /> Ask about your city</a>
            : <Link className="btn btn--navy" to="/contact#quote">Ask about your city</Link>}
        </header>
        <ul className="patches" aria-label="Cities we serve">
          {SERVICE_AREA.map((c, i) => <Patch key={c} city={c} home={i === 0} i={i} />)}
        </ul>
      </div>
    </section>
  );
}
