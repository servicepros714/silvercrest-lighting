/* RIDGELINE footer: layered silver mountains form the top edge; navy body with the
   logo on a frost card, a basecamp contact block and link columns; gold swoosh legal line. */
import { Link } from 'react-router-dom';
import { BUSINESS, SERVICE_AREA, addressLine } from '../data/business.js';
import { NAV_LINKS, SeasonStatus } from './Nav.jsx';
import { PhoneIcon, PinIcon, Ridges, Swoosh } from './Icons.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="ftr">
      <Ridges className="ftr__ridges" />
      <div className="ftr__body">
        <div className="container ftr__grid">
          <div className="ftr__brand">
            <div className="ftr__card">
              <img src="/logo.png" alt="Silvercrest Lighting" width="240" height="80" loading="lazy" />
            </div>
            <p className="ftr__tag">{BUSINESS.tagline}. Designed, installed, maintained and taken down for you.</p>
          </div>

          <div className="ftr__camp">
            <p className="ftr__label">Basecamp</p>
            <a className="ftr__phone" href={BUSINESS.phoneHref}><PhoneIcon /> {BUSINESS.phoneDisplay}</a>
            <p className="ftr__line"><PinIcon /> {addressLine()}</p>
            <p className="ftr__line"><SeasonStatus /></p>
            <Link to="/book" className="btn btn--gold">Book Online</Link>
          </div>

          <nav className="ftr__col" aria-label="Footer">
            <p className="ftr__label">Explore</p>
            <ul>
              {NAV_LINKS.map((l) => <li key={l.id}><Link to={`/#${l.id}`}>{l.label}</Link></li>)}
              <li><Link to="/book">Book an install</Link></li>
            </ul>
          </nav>

          <div className="ftr__col">
            <p className="ftr__label">Service area</p>
            <ul>
              {SERVICE_AREA.slice(0, 6).map((c) => <li key={c}><Link to="/#area">{c}</Link></li>)}
            </ul>
          </div>
        </div>
      </div>
      <div className="ftr__legal">
        <Swoosh className="ftr__swoosh" />
        <div className="container ftr__legal-row">
          <span>© {year} {BUSINESS.name}. All rights reserved.</span>
          <span>Prices are “starting at”; final price is confirmed at the on-site visit.</span>
        </div>
      </div>
    </footer>
  );
}
