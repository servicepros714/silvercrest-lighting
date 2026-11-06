/* ALPINE DIORAMA hero: layered SVG dusk landscape (three brushed-silver ridges, a
   hillside street of homes, a glowing lantern post). Ridges parallax at different
   speeds; rooflines light bulb by bulb. Headline left, three trail-marker facts. */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { BOOKING, BUSINESS, CTA } from '../data/business.js';
import useAvailability from '../lib/useAvailability.js';
import { WINDOWS, fmtDate, seasonRange } from '../lib/time.js';
import { prefersReducedMotion } from '../lib/useReveal.js';
import { ArrowRight, Lantern, PhoneIcon, Swoosh } from '../components/Icons.jsx';

/* Points spaced along a polyline (roof edges) for the bulb strings. */
function bulbsAlong(points, gap) {
  const out = [];
  for (let i = 0; i < points.length - 1; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[i + 1];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(1, Math.floor(len / gap));
    for (let k = 0; k < n; k++) out.push([x1 + ((x2 - x1) * k) / n, y1 + ((y2 - y1) * k) / n]);
  }
  out.push(points[points.length - 1]);
  return out;
}

const HOUSES = [
  // body rect, roof polygon, windows, roofline for bulbs
  { body: [470, 650, 190, 90], roof: '455,652 565,588 675,652', line: [[455, 652], [565, 588], [675, 652]], wins: [[495, 675], [600, 675]], door: [552, 690] },
  { body: [720, 590, 230, 150], roof: '705,592 835,520 965,592', line: [[705, 592], [835, 520], [965, 592]], wins: [[745, 612], [880, 612], [745, 670], [880, 670]], door: [822, 690], twoStory: true },
  { body: [1010, 640, 170, 100], roof: '996,642 1095,584 1194,642', line: [[996, 642], [1095, 584], [1194, 642]], wins: [[1030, 668], [1130, 668]], door: [1082, 692] },
  { body: [1240, 630, 180, 110], roof: '1226,632 1290,592 1330,612 1385,580 1434,632', line: [[1226, 632], [1290, 592], [1330, 612], [1385, 580], [1434, 632]], wins: [[1262, 660], [1365, 660]], door: [1318, 692] },
];

function Diorama() {
  let bulbIndex = 0;
  return (
    <svg className="diorama" viewBox="0 0 1440 820" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#00152C" />
          <stop offset=".45" stopColor="#001E3F" />
          <stop offset=".78" stopColor="#1C3A63" />
          <stop offset="1" stopColor="#5B6478" />
        </linearGradient>
        <radialGradient id="dusk" cx="70%" cy="88%" r="55%">
          <stop offset="0" stopColor="#E9C075" stopOpacity=".55" />
          <stop offset=".5" stopColor="#B67600" stopOpacity=".12" />
          <stop offset="1" stopColor="#B67600" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="facetL" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#C9CBCE" /><stop offset="1" stopColor="#8A8C90" />
        </linearGradient>
        <linearGradient id="facetR" x1="1" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7A7C81" /><stop offset="1" stopColor="#4D5055" />
        </linearGradient>
        <linearGradient id="ridgeMid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#696B6F" /><stop offset="1" stopColor="#2B3A52" />
        </linearGradient>
        <linearGradient id="hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0B2442" /><stop offset="1" stopColor="#00152C" />
        </linearGradient>
        <radialGradient id="winGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stopColor="#FCEECF" /><stop offset="1" stopColor="#E9C075" />
        </radialGradient>
      </defs>

      <rect width="1440" height="820" fill="url(#sky)" />
      <rect width="1440" height="820" fill="url(#dusk)" />

      <g className="stars">
        {[[90, 80], [210, 150], [330, 60], [470, 120], [640, 50], [760, 160], [900, 90], [1040, 40], [1150, 130], [1290, 70], [1390, 170], [560, 210], [1210, 230], [150, 260], [990, 220]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i % 3 === 0 ? 1.8 : 1.2} style={{ '--i': i }} />
        ))}
      </g>

      {/* far ridge — faceted like the logo's mountains */}
      <g className="layer" data-depth="0.08">
        <path d="M560 470 L760 300 L860 380 L1060 210 L1240 360 L1330 320 L1520 470 Z" fill="url(#facetR)" opacity=".55" />
        <path d="M760 300 L800 420 L700 470 L560 470 Z M1060 210 L1000 380 L880 470 L860 380 Z M1330 320 L1300 420 L1240 360 Z" fill="url(#facetL)" opacity=".7" />
      </g>

      {/* mid ridge */}
      <g className="layer" data-depth="0.16">
        <path d="M-40 560 L140 420 L260 500 L430 360 L600 520 L760 450 L940 540 L1110 430 L1300 540 L1480 470 L1480 600 L-40 600 Z" fill="url(#ridgeMid)" />
        <path d="M430 360 L470 430 L440 460 L520 452 Z M1110 430 L1140 480 L1180 470 Z M140 420 L170 460 L200 452 Z" fill="#C9CBCE" opacity=".55" />
      </g>

      {/* near hill with the street of homes */}
      <g className="layer" data-depth="0.3">
        <path d="M-40 700 C 200 640, 420 690, 700 700 S 1200 690, 1480 680 L1480 820 L-40 820 Z" fill="url(#hill)" />
        {HOUSES.map((h, hi) => {
          const [x, y, w, hh] = h.body;
          const bulbs = bulbsAlong(h.line, 15);
          return (
            <g key={hi} className="house">
              <rect x={x} y={y} width={w} height={hh + 40} fill="#0A1C33" />
              <polygon points={h.roof} fill="#122840" />
              {h.wins.map(([wx, wy], wi) => (
                <rect key={wi} className="win" x={wx} y={wy} width="34" height="26" rx="2" fill="url(#winGlow)" style={{ '--i': hi * 3 + wi }} />
              ))}
              <rect x={h.door[0]} y={h.door[1]} width="26" height="44" rx="2" fill="#372211" />
              <polyline className="cord" points={h.line.map((p) => p.join(',')).join(' ')} />
              {bulbs.map(([bx, by]) => {
                const i = bulbIndex++;
                return <circle key={i} className="bulb" cx={bx} cy={by + 3} r="3.4" style={{ '--i': i }} />;
              })}
            </g>
          );
        })}
        <path d="M-40 742 C 300 730, 900 748, 1480 734 L1480 820 L-40 820 Z" fill="#00152C" opacity=".75" />
      </g>
    </svg>
  );
}

export default function Hero() {
  const ref = useRef(null);
  const [lit, setLit] = useState(false);
  const { loading, earliest } = useAvailability();
  const { start, end } = seasonRange();

  useEffect(() => {
    const t = setTimeout(() => setLit(true), 120);
    const root = ref.current;
    if (!root || prefersReducedMotion()) return () => clearTimeout(t);
    const layers = Array.from(root.querySelectorAll('.layer'));
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(window.scrollY, root.offsetHeight);
        layers.forEach((l) => { l.style.transform = `translate3d(0, ${(y * Number(l.dataset.depth)).toFixed(1)}px, 0)`; });
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => { clearTimeout(t); cancelAnimationFrame(raf); window.removeEventListener('scroll', onScroll); };
  }, []);

  const earliestText = loading ? 'Checking…' : earliest ? fmtDate(earliest.date) : 'Season full';

  return (
    <section id="top" ref={ref} className={`hero ${lit ? 'is-lit' : ''}`} aria-labelledby="hero-title">
      <Diorama />
      <div className="hero__lantern" aria-hidden="true"><Lantern /></div>
      <div className="container hero__content">
        <p className="eyebrow eyebrow--light hero__eyebrow">Christmas &amp; permanent lighting · {BUSINESS.city}</p>
        <h1 id="hero-title" className="hero__title">
          Your home, <em>lit like the crest</em> of the season.
        </h1>
        <p className="hero__sub">
          We design, hang, maintain and take down commercial-grade LED lights — or mount permanent
          lighting once and switch it on for every holiday.{' '}
          {BOOKING.online ? 'Pick your install window online.' : 'Tell us about your home and request a quote online.'}
        </p>
        <div className="hero__ctas">
          <Link to={CTA.to} className="btn btn--gold btn--lg">{BOOKING.online ? 'Book your install' : CTA.label} <ArrowRight /></Link>
          {BUSINESS.phoneHref && (
            <a href={BUSINESS.phoneHref} className="btn btn--ghost-light btn--lg"><PhoneIcon /> {BUSINESS.phoneDisplay}</a>
          )}
        </div>
        <ul className="markers" aria-label="Season facts">
          <li className="marker">
            <span className="marker__k">Season</span>
            <span className="marker__v">{fmtDate(start, { month: 'short', day: 'numeric' })} – {fmtDate(end, { month: 'short', day: 'numeric' })}</span>
          </li>
          {BOOKING.online ? (
            <>
              <li className="marker">
                <span className="marker__k">Earliest open</span>
                <span className="marker__v">{earliestText}</span>
              </li>
              <li className="marker">
                <span className="marker__k">Deposit</span>
                <span className="marker__v">{BUSINESS.depositLabel}, applied</span>
              </li>
            </>
          ) : (
            <li className="marker">
              <span className="marker__k">Install windows</span>
              <span className="marker__v">{WINDOWS.map((w) => w.label).join(' · ')}</span>
            </li>
          )}
        </ul>
      </div>
      <Swoosh className="hero__swoosh" />
    </section>
  );
}
