/* GUESTBOOK: an open lodge guestbook with empty ruled lines.
   TODO: when real reviews exist, add them to REVIEWS below (exact wording, real names
   or initials, with permission) and set BUSINESS.googleReviewUrl. Never invent reviews. */
import { BUSINESS } from '../data/business.js';
import { PeakIcon } from '../components/Icons.jsx';

const REVIEWS = []; // TODO: [{ name: 'A. Customer', city: 'Your City', text: '…', source: 'Google' }]

export default function Reviews() {
  return (
    <section id="reviews" className="section reviews" aria-labelledby="rev-title">
      <div className="container">
        <div className="guestbook" data-reveal>
          <div className="guestbook__page guestbook__page--left">
            <p className="eyebrow">Reviews</p>
            <h2 id="rev-title" className="h2">The Silvercrest guestbook</h2>
            <p className="guestbook__intro">
              Reviews from real Silvercrest customers will appear here as this season’s installs
              wrap up. We only post genuine reviews, never made-up ones.
            </p>
            <p className="guestbook__sig"><PeakIcon /> {BUSINESS.name}</p>
          </div>
          <div className="guestbook__page guestbook__page--right">
            {REVIEWS.length ? (
              <ul className="guestbook__entries">
                {REVIEWS.map((r) => (
                  <li key={r.name + r.text.slice(0, 12)}>
                    <p className="guestbook__text">“{r.text}”</p>
                    <p className="guestbook__who">— {r.name}{r.city ? `, ${r.city}` : ''}</p>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="guestbook__lines" aria-label="No reviews yet">
                <span className="guestbook__first">Be the first to sign.</span>
                {Array.from({ length: 7 }, (_, i) => <span key={i} className="guestbook__rule" />)}
              </div>
            )}
            {BUSINESS.googleReviewUrl && (
              <a className="btn btn--navy" href={BUSINESS.googleReviewUrl} target="_blank" rel="noreferrer">Leave a Google review</a>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
