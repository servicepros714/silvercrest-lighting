/* Contact: the quote-request form (#quote) plus confirmed details from src/data/business.js
   and src/lib/time.js. Phone and email cards appear automatically once those are filled in. */
import { Link } from 'react-router-dom';
import { BOOKING, BUSINESS, publicLocation } from '../data/business.js';
import { SEASON, WINDOWS } from '../lib/time.js';
import { PageHead, usePageTitle } from '../components/InfoPage.jsx';
import QuoteForm from '../components/QuoteForm.jsx';
import { ArrowRight, ClockIcon, MailIcon, PhoneIcon, PinIcon } from '../components/Icons.jsx';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const seasonLabel = `${MONTHS[SEASON.startMonth - 1]} ${SEASON.startDay} – ${MONTHS[SEASON.endMonth - 1]} ${SEASON.endDay}`;

export default function Contact() {
  usePageTitle('Contact Us');
  return (
    <section className="section page">
      <div className="container">
        <PageHead
          eyebrow="Contact"
          title="Talk to the crew"
          sub="Questions about your roofline, your city or a quote? Send us a request below and we’ll get back to you."
        />

        <div className="contact-grid">
          <div className="contact-grid__form" id="quote">
            <h2 className="h3">Request a quote</h2>
            <p className="page__text contact-grid__lede">
              Tell us a little about your home and the look you want. Your final price is always confirmed at the
              on-site design visit.
              {BOOKING.online && <> Prefer to pick a date yourself? <Link to="/book">Book online</Link>.</>}
            </p>
            <QuoteForm />
          </div>

          <ul className="contact-grid__info">
            {BUSINESS.phoneHref && (
              <li className="icard icard--phone">
                <p className="icard__tag"><PhoneIcon /> Call us</p>
                <a className="icard__big" href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a>
              </li>
            )}
            {BUSINESS.email && (
              <li className="icard">
                <p className="icard__tag"><MailIcon /> Email</p>
                <a className="icard__link" href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
              </li>
            )}
            <li className="icard">
              <p className="icard__tag"><ClockIcon /> Install hours</p>
              {BUSINESS.hours && <p className="icard__strong">{BUSINESS.hours}</p>}
              <p>Install windows: {WINDOWS.map((w) => w.label).join(' or ')}</p>
              <p>Install season: {seasonLabel}</p>
            </li>
            <li className="icard">
              <p className="icard__tag"><PinIcon /> Location</p>
              <p className="icard__strong">Based in {publicLocation()}</p>
              {!BUSINESS.showStreetAddress && <p>We come to you. Our crews install at your home.</p>}
              <Link to="/#area" className="page__more">View the service area <ArrowRight /></Link>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
