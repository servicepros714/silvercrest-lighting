/* TRAIL MAP: a winding trail climbs past four waypoints (Book → Design → Install →
   Takedown) to a summit flag. The trail draws in when it scrolls into view.
   Phones: a vertical trail with the same waypoints. */
import { STEPS } from '../data/business.js';
import { revealDelay } from '../lib/useReveal.js';

const ICONS = {
  book: <path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3zM5 17a3 3 0 0 1 3-3h11" />,
  design: <path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3" />,
  install: <path d="M3 13l9-8 9 8M6 11v9h12v-9M10 20v-5h4v5" />,
  takedown: <path d="M12 4v12M7 11l5 5 5-5M5 20h14" />,
};

export default function HowItWorks() {
  return (
    <section id="how" className="section how" aria-labelledby="how-title">
      <div className="container">
        <header className="shead shead--center" data-reveal>
          <p className="eyebrow">How it works</p>
          <h2 id="how-title" className="h2">Four waypoints to a lit roofline</h2>
          <p className="shead__sub">You book. We handle the climb — design, install, maintenance and takedown.</p>
        </header>

        <div className="trail" data-reveal>
          <svg className="trail__svg" viewBox="0 0 1000 240" preserveAspectRatio="none" aria-hidden="true">
            <path className="trail__base" vectorEffect="non-scaling-stroke"
              d="M0 214 C 60 214, 80 196, 125 190 S 220 210, 260 170 S 330 128, 375 130 S 480 150, 530 110 S 590 76, 625 80 S 740 96, 790 54 S 850 30, 875 30 S 950 14, 985 8" />
            <path className="trail__draw" vectorEffect="non-scaling-stroke" pathLength="1"
              d="M0 214 C 60 214, 80 196, 125 190 S 220 210, 260 170 S 330 128, 375 130 S 480 150, 530 110 S 590 76, 625 80 S 740 96, 790 54 S 850 30, 875 30 S 950 14, 985 8" />
          </svg>
          <span className="trail__flag" aria-hidden="true">
            <svg viewBox="0 0 30 40"><path d="M4 2v38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M5 3h20l-5 7 5 7H5z" fill="var(--gold)" /></svg>
          </span>

          <ol className="trail__steps">
            {STEPS.map((s, i) => (
              <li key={s.id} className="waypoint" style={{ ...revealDelay(i, 160), '--w': i }} data-reveal>
                <span className="waypoint__dot" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{ICONS[s.id]}</svg>
                </span>
                <div className="waypoint__card">
                  <p className="waypoint__num">Waypoint {i + 1}</p>
                  <h3 className="waypoint__title">{s.title}</h3>
                  <p className="waypoint__text">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
