/* STACKED TWO-ROW header: tall logo spans both rows; a utility row (location · live
   earliest-open · phone) folds away on scroll; the link row has a sliding gold
   "summit caret". Mobile: SHUTTER menu (navy links drop from the top, silver
   contact panel with Call Now / Book Online rises from the bottom). */
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BOOKING, BUSINESS, CTA } from '../data/business.js';
import useAvailability from '../lib/useAvailability.js';
import { fmtDate } from '../lib/time.js';
import { CloseIcon, PeakIcon, PhoneIcon, PinIcon } from './Icons.jsx';

export const NAV_LINKS = [
  { id: 'gallery', label: 'Gallery' },
  { id: 'how', label: 'How it works' },
  { id: 'packages', label: 'Packages' },
  { id: 'season', label: 'Season', bookingOnly: true }, // live availability board
  { id: 'area', label: 'Service area' },
  { id: 'faq', label: 'FAQ' },
].filter((l) => BOOKING.online || !l.bookingOnly);

export function SeasonStatus({ compact = false }) {
  const { loading, earliest } = useAvailability();
  let text = 'Checking the calendar…';
  let tone = 'wait';
  if (!BOOKING.online) { text = 'Now taking quote requests'; tone = 'open'; }
  else if (!loading) {
    if (earliest) { text = `${compact ? 'Earliest' : 'Booking open · earliest'} ${fmtDate(earliest.date)}`; tone = 'open'; }
    else { text = 'This season is fully booked'; tone = 'full'; }
  }
  return (
    <span className={`status status--${tone}`}>
      <span className="status__dot" aria-hidden="true" />
      {text}
    </span>
  );
}

function useScrollSpy(enabled) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window)) return undefined;
    const sections = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
    const onTop = () => { if (window.scrollY < 200) setActive(''); };
    window.addEventListener('scroll', onTop, { passive: true });
    return () => { io.disconnect(); window.removeEventListener('scroll', onTop); };
  }, [enabled]);
  return active;
}

function Shutter({ open, onClose, go }) {
  const rootRef = useRef(null);
  const closeRef = useRef(null);

  // `inert` set on the DOM node (not a JSX prop) so it behaves the same on React 18 and 19.
  useEffect(() => { if (rootRef.current) rootRef.current.inert = !open; }, [open]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => closeRef.current && closeRef.current.focus(), 60);
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => { document.body.style.overflow = prev; clearTimeout(t); window.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  return (
    <div
      id="shutter"
      ref={rootRef}
      className={`shutter ${open ? 'is-open' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      aria-hidden={!open}
    >
      <div className="shutter__top">
        <div className="shutter__bar">
          <span className="shutter__chip"><img src="/logo.png" alt="Silvercrest Lighting" width="150" height="50" /></span>
          <button ref={closeRef} type="button" className="shutter__close" onClick={onClose} aria-label="Close menu">
            <CloseIcon />
          </button>
        </div>
        <ol className="shutter__links">
          {NAV_LINKS.map((l, i) => (
            <li key={l.id} style={{ '--i': i }}>
              <a href={`/#${l.id}`} onClick={(e) => { e.preventDefault(); go(l.id); }}>
                <span className="shutter__num">{String(i + 1).padStart(2, '0')}</span>
                {l.label}
              </a>
            </li>
          ))}
        </ol>
      </div>
      <div className="shutter__bottom">
        <div className="shutter__info">
          <p className="shutter__line"><PinIcon /> Serving {BUSINESS.city} &amp; nearby</p>
          <p className="shutter__line"><SeasonStatus /></p>
        </div>
        <div className={`actionbar ${BUSINESS.phoneHref ? '' : 'actionbar--single'}`}>
          {BUSINESS.phoneHref && <a className="btn btn--silver" href={BUSINESS.phoneHref}><PhoneIcon /> Call Now</a>}
          <Link className="btn btn--gold" to={CTA.to} onClick={onClose}>{CTA.label}</Link>
        </div>
      </div>
      <button type="button" className="shutter__scrim" tabIndex={-1} aria-hidden="true" onClick={onClose} />
    </div>
  );
}

export default function Nav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState('');
  const active = useScrollSpy(isHome);
  const linksRef = useRef(null);
  const [caret, setCaret] = useState({ x: 0, show: false });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);

  const target = hover || active;
  const placeCaret = useCallback(() => {
    const wrap = linksRef.current;
    if (!wrap) return;
    const el = target && wrap.querySelector(`[data-id="${target}"]`);
    if (!el) { setCaret((c) => ({ ...c, show: false })); return; }
    const x = el.offsetLeft + el.offsetWidth / 2;
    setCaret({ x, show: true });
  }, [target]);

  useLayoutEffect(() => { placeCaret(); }, [placeCaret, scrolled]);
  useEffect(() => {
    window.addEventListener('resize', placeCaret);
    return () => window.removeEventListener('resize', placeCaret);
  }, [placeCaret]);

  const go = useCallback((id) => {
    setOpen(false);
    if (isHome) {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${id}`);
    } else {
      navigate(`/#${id}`);
    }
  }, [isHome, navigate]);

  const closeMenu = useCallback(() => setOpen(false), []);

  return (
    <>
      <header className={`hdr ${scrolled ? 'is-scrolled' : ''} ${isHome ? 'is-home' : ''}`}>
        <div className="container hdr__inner">
          <Link to="/" className="hdr__logo" aria-label="Silvercrest Lighting home">
            <img src="/logo.png" alt="Silvercrest Lighting" width="216" height="72" />
          </Link>
          <div className="hdr__stack">
            <div className="hdr__util">
              <span className="hdr__util-item"><PinIcon /> {BUSINESS.city}, {BUSINESS.state}</span>
              <SeasonStatus />
              {BUSINESS.phoneHref && (
                <a className="hdr__util-item hdr__util-phone" href={BUSINESS.phoneHref}><PhoneIcon /> {BUSINESS.phoneDisplay}</a>
              )}
            </div>
            <div className="hdr__main">
              <nav className="hdr__links" ref={linksRef} aria-label="Primary" onMouseLeave={() => setHover('')}>
                {NAV_LINKS.map((l) => (
                  <a
                    key={l.id}
                    data-id={l.id}
                    href={`/#${l.id}`}
                    className={active === l.id ? 'is-active' : ''}
                    aria-current={active === l.id ? 'true' : undefined}
                    onMouseEnter={() => setHover(l.id)}
                    onFocus={() => setHover(l.id)}
                    onBlur={() => setHover('')}
                    onClick={(e) => { e.preventDefault(); go(l.id); }}
                  >
                    {l.label}
                  </a>
                ))}
                <span
                  className={`hdr__caret ${caret.show ? 'is-shown' : ''}`}
                  style={{ transform: `translateX(${caret.x}px)` }}
                  aria-hidden="true"
                >
                  <PeakIcon />
                </span>
              </nav>
              <Link to={CTA.to} className="btn btn--gold hdr__book">{CTA.label}</Link>
              {BUSINESS.phoneHref && (
                <a className="hdr__call" href={BUSINESS.phoneHref} aria-label={`Call ${BUSINESS.phoneDisplay}`}><PhoneIcon /></a>
              )}
              <button
                type="button"
                className="hdr__menu"
                aria-expanded={open}
                aria-controls="shutter"
                onClick={() => setOpen(true)}
              >
                <span className="hdr__menu-lines" aria-hidden="true"><i /><i /><i /></span>
                Menu
              </button>
            </div>
          </div>
        </div>
      </header>
      <Shutter open={open} onClose={closeMenu} go={go} />
    </>
  );
}
