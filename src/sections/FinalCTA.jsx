/* Final CTA: a large breathing lantern over a ridgeline, headline + both CTAs. */
import { Link } from 'react-router-dom';
import { BUSINESS } from '../data/business.js';
import { SeasonStatus } from '../components/Nav.jsx';
import { ArrowRight, Lantern, PhoneIcon } from '../components/Icons.jsx';

export default function FinalCTA() {
  return (
    <section className="section cta" aria-labelledby="cta-title">
      <div className="container cta__inner" data-reveal>
        <div className="cta__lamp" aria-hidden="true"><Lantern /></div>
        <div className="cta__text">
          <p className="eyebrow eyebrow--light">Windows fill week by week</p>
          <h2 id="cta-title" className="h2 h2--light">Claim your install window before the crest fills up.</h2>
          <p className="cta__status"><SeasonStatus /></p>
          <div className="cta__btns">
            <Link to="/book" className="btn btn--gold btn--lg">Book Online <ArrowRight /></Link>
            <a href={BUSINESS.phoneHref} className="btn btn--ghost-light btn--lg"><PhoneIcon /> Call {BUSINESS.phoneDisplay}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
