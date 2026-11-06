/* About: built only from confirmed content in src/data/business.js.
   TODO (owner): add the company story, founder/crew details or photos here once available. */
import { Link } from 'react-router-dom';
import { BUSINESS, LIGHT_TYPES, STEPS } from '../data/business.js';
import { PageHead, usePageTitle } from '../components/InfoPage.jsx';
import FinalCTA from '../sections/FinalCTA.jsx';
import useReveal, { revealDelay } from '../lib/useReveal.js';
import { ArrowRight } from '../components/Icons.jsx';

export default function About() {
  usePageTitle('About Us');
  useReveal([]);
  return (
    <>
      <section className="section page page--lead">
        <div className="container">
          <PageHead
            eyebrow="About us"
            title="Holiday lighting, handled from the first clip to the last"
            sub={`${BUSINESS.name} designs, installs, maintains and takes down Christmas lights, and mounts permanent roofline lighting that stays up year-round. You choose the look. Our crew handles the ladders.`}
          />

          <div className="page__block">
            <h2 className="h3">What we do</h2>
            <ul className="icards">
              {LIGHT_TYPES.map((t, i) => (
                <li key={t.id} className="icard" data-reveal style={revealDelay(i)}>
                  <p className="icard__tag">{t.tag}</p>
                  <h3 className="icard__title">{t.name}</h3>
                  <p>{t.blurb}</p>
                </li>
              ))}
            </ul>
            <Link to="/#packages" className="page__more">See packages <ArrowRight /></Link>
          </div>

          <div className="page__block">
            <h2 className="h3">How every install works</h2>
            <ol className="isteps">
              {STEPS.map((s, i) => (
                <li key={s.id} className="istep" data-reveal style={revealDelay(i)}>
                  <span className="istep__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="icard__title">{s.title}</h3>
                    <p>{s.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <div className="page__block">
            <h2 className="h3">Where we work</h2>
            <p className="page__text">
              Our crews install across {BUSINESS.city} and all over {BUSINESS.region}. Check the map for your city, or{' '}
              <Link to="/contact">get in touch</Link> if you don’t see it listed.
            </p>
            <Link to="/#area" className="page__more">View the service area <ArrowRight /></Link>
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
