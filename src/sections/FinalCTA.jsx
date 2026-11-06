/* Final CTA: a large breathing lantern over a ridgeline, headline + both CTAs. */
import { Link } from 'react-router-dom';
import { BOOKING, BUSINESS, CTA } from '../data/business.js';
import { SeasonStatus } from '../components/Nav.jsx';
import { ArrowRight, Lantern, PhoneIcon } from '../components/Icons.jsx';

export default function FinalCTA() {
  return (
    <section className="section cta" aria-labelledby="cta-title">
      <div className="container cta__inner" data-reveal>
        <div className="cta__lamp" aria-hidden="true"><Lantern /></div>
        <div className="cta__text">
          <p className="eyebrow eyebrow--light">{BOOKING.online ? 'Windows fill week by week' : 'Request a quote'}</p>
          <h2 id="cta-title" className="h2 h2--light">
            {BOOKING.online ? 'Claim your install window before the crest fills up.' : 'Tell us about your roofline. We’ll handle the climb.'}
          </h2>
          <p className="cta__status"><SeasonStatus /></p>
          <div className="cta__btns">
            <Link to={CTA.to} className="btn btn--gold btn--lg">{CTA.label} <ArrowRight /></Link>
            {BUSINESS.phoneHref && (
              <a href={BUSINESS.phoneHref} className="btn btn--ghost-light btn--lg"><PhoneIcon /> Call {BUSINESS.phoneDisplay}</a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
