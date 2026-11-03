/* Phone-only Call Now / Book Online bar. Slides in after the hero; App doesn't
   render it on /book, /checkout or /confirmation. */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS } from '../data/business.js';
import { PhoneIcon } from './Icons.jsx';

export default function MobileBar() {
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const onScroll = () => {
      const hero = document.getElementById('top');
      const limit = hero ? hero.offsetTop + hero.offsetHeight - 80 : window.innerHeight * 0.8;
      setShown(window.scrollY > limit);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
  }, []);

  return (
    <div className={`mbar ${shown ? 'is-shown' : ''}`} aria-hidden={!shown}>
      <div className="actionbar">
        <a className="btn btn--silver" href={BUSINESS.phoneHref} tabIndex={shown ? 0 : -1}><PhoneIcon /> Call Now</a>
        <Link className="btn btn--gold" to="/book" tabIndex={shown ? 0 : -1}>Book Online</Link>
      </div>
    </div>
  );
}
