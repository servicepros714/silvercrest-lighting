/* Focused header for /book, /checkout and /confirmation (no nav links, no footer). */
import { Link } from 'react-router-dom';
import { BUSINESS } from '../data/business.js';
import { ArrowLeft, LockIcon, PhoneIcon } from './Icons.jsx';

export default function BookingHeader() {
  return (
    <header className="bhdr">
      <div className="container bhdr__inner">
        <Link to="/" className="bhdr__back" aria-label="Back to the home page">
          <ArrowLeft /> <span>Home</span>
        </Link>
        <Link to="/" className="bhdr__logo" aria-label="Silvercrest Lighting home">
          <img src="/logo.png" alt="Silvercrest Lighting" width="150" height="50" />
        </Link>
        <div className="bhdr__right">
          <span className="bhdr__secure"><LockIcon /> Secure booking</span>
          <a className="bhdr__phone" href={BUSINESS.phoneHref} aria-label={`Call ${BUSINESS.phoneDisplay}`}>
            <PhoneIcon /> <span>{BUSINESS.phoneDisplay}</span>
          </a>
        </div>
      </div>
    </header>
  );
}
