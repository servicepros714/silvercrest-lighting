/* RIDGELINE footer: layered silver mountains form the top edge; navy body with the
   logo on a frost card, a contact block and link columns; gold swoosh legal line
   with the policy links. All business details come from src/data/business.js. */
import { Link } from 'react-router-dom';
import { BUSINESS, CTA, SERVICE_AREA, publicLocation } from '../data/business.js';
import { SeasonStatus } from './Nav.jsx';
import { ClockIcon, MailIcon, PhoneIcon, PinIcon, Ridges, Swoosh } from './Icons.jsx';

const EXPLORE_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About Us' },
  { to: '/#packages', label: 'Services' },
  { to: '/#gallery', label: 'Gallery' },
  { to: '/#how', label: 'How It Works' },
  { to: '/#faq', label: 'FAQ' },
  { to: '/contact', label: 'Contact Us' },
  { to: CTA.to, label: 'Book an Install / Request a Quote' },
];

export const LEGAL_LINKS = [
  { to: '/privacy-policy', label: 'Privacy Policy' },
  { to: '/terms', label: 'Terms and Conditions' },
  { to: '/cookie-policy', label: 'Cookie Policy' },
  { to: '/accessibility', label: 'Accessibility Statement' },
];

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
            <p className="ftr__tag">
              Christmas light and permanent roofline lighting for your home. We design, hang, maintain
              and take down seasonal displays, or mount app-controlled lighting that stays up year-round.
            </p>
          </div>

          <div className="ftr__camp">
            <p className="ftr__label">Contact</p>
            {BUSINESS.phoneHref && (
              <a className="ftr__phone" href={BUSINESS.phoneHref}><PhoneIcon /> {BUSINESS.phoneDisplay}</a>
            )}
            {BUSINESS.email && (
              <a className="ftr__line ftr__mail" href={`mailto:${BUSINESS.email}`}><MailIcon /> {BUSINESS.email}</a>
            )}
            <p className="ftr__line"><PinIcon /> Based in {publicLocation()}</p>
            {BUSINESS.hours && <p className="ftr__line"><ClockIcon /> {BUSINESS.hours}</p>}
            <p className="ftr__line"><SeasonStatus /></p>
            <Link to={CTA.to} className="btn btn--gold">{CTA.label}</Link>
          </div>

          <nav className="ftr__col" aria-label="Footer">
            <p className="ftr__label">Explore</p>
            <ul>
              {EXPLORE_LINKS.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}
            </ul>
          </nav>

          <div className="ftr__col">
            <p className="ftr__label">Service area</p>
            <ul>
              {SERVICE_AREA.slice(0, 6).map((c) => <li key={c}><Link to="/#area">{c}</Link></li>)}
              <li><Link to="/#area">All of {BUSINESS.region}</Link></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="ftr__legal">
        <Swoosh className="ftr__swoosh" />
        <div className="container ftr__legal-row">
          <span>© {year} {BUSINESS.name}. All rights reserved.</span>
          <nav className="ftr__legal-nav" aria-label="Legal">
            <ul>
              {LEGAL_LINKS.map((l) => <li key={l.to}><Link to={l.to}>{l.label}</Link></li>)}
            </ul>
          </nav>
          <span className="ftr__legal-note">Prices are “starting at”; final price is confirmed at the on-site visit.</span>
        </div>
      </div>
    </footer>
  );
}
