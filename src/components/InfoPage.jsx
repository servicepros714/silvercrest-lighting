/* Shared building blocks for the content pages (About, Contact) and the legal pages.
   Legal pages: a sticky "On this page" trail on the left, the policy on a paper card. */
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS, LEGAL, publicLocation } from '../data/business.js';
import { ArrowRight, MailIcon, PhoneIcon, PinIcon } from './Icons.jsx';

export function usePageTitle(title) {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} | ${BUSINESS.name}`;
    return () => { document.title = prev; };
  }, [title]);
}

export function PageHead({ eyebrow, title, sub, meta }) {
  return (
    <header className="page__head">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="h2 page__title">{title}</h1>
      {sub && <p className="shead__sub">{sub}</p>}
      {meta && <p className="page__meta">{meta}</p>}
    </header>
  );
}

/* Visible reminder for details the owner still has to confirm.
   Hidden everywhere once LEGAL.showReviewNotes is set to false. */
export function OwnerNote({ children }) {
  if (!LEGAL.showReviewNotes) return null;
  return (
    <aside className="owner-note" role="note">
      <b className="owner-note__label">Owner to confirm</b>
      <span>{children}</span>
    </aside>
  );
}

/* Contact form, phone and email (only when set) and public location, used in every "Contact us" section. */
export function ContactList() {
  return (
    <ul className="contact-list">
      <li><ArrowRight /> <span>Contact form: <Link to="/contact#quote">send us a message</Link></span></li>
      {BUSINESS.phoneHref && (
        <li><PhoneIcon /> <span>Phone: <a href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a></span></li>
      )}
      {BUSINESS.email && (
        <li><MailIcon /> <span>Email: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a></span></li>
      )}
      <li><PinIcon /> <span>Location: {publicLocation()}</span></li>
    </ul>
  );
}

export function LegalPage({ title, sub, sections }) {
  usePageTitle(title);
  return (
    <section className="section page page--legal">
      <div className="container">
        <PageHead eyebrow="Legal" title={title} sub={sub} meta={`Last updated ${LEGAL.updated}`} />
        <div className="page__grid">
          <nav className="toc" aria-label="On this page">
            <p className="toc__label">On this page</p>
            <ol>
              {sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
            </ol>
          </nav>
          <article className="prose">
            {sections.map((s) => (
              <section key={s.id} aria-labelledby={s.id}>
                <h2 id={s.id}>{s.title}</h2>
                {s.body}
              </section>
            ))}
            <p className="prose__back">
              Related: <Link to="/privacy-policy">Privacy Policy</Link> · <Link to="/terms">Terms and Conditions</Link> ·{' '}
              <Link to="/cookie-policy">Cookie Policy</Link> · <Link to="/accessibility">Accessibility Statement</Link>
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
