/* SUMMIT CLIMB progress: a lantern marker climbs a ridge past six waypoints to a flag.
   Reached waypoints are buttons (jump back to that step). */
const POINTS = [
  [40, 96], [190, 74], [330, 82], [470, 52], [610, 60], [760, 26],
];
const PATH = 'M0 104 L40 96 L120 70 L190 74 L260 92 L330 82 L400 58 L470 52 L540 70 L610 60 L690 34 L760 26 L800 20';

export default function SummitProgress({ steps, current, reached, onJump }) {
  const pct = current / (steps.length - 1);
  return (
    <nav className="climb" aria-label="Booking progress">
      <div className="climb__art">
        <svg viewBox="0 0 800 112" preserveAspectRatio="none" aria-hidden="true">
          <defs>
            <linearGradient id="climbFill" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#B5B7B9" /><stop offset="1" stopColor="#696B6F" />
            </linearGradient>
          </defs>
          <path d={`${PATH} L800 112 L0 112 Z`} fill="url(#climbFill)" opacity=".28" />
          <path d={PATH} className="climb__track" vectorEffect="non-scaling-stroke" />
          <path d={PATH} className="climb__done" vectorEffect="non-scaling-stroke" pathLength="1" style={{ strokeDashoffset: 1 - pct }} />
        </svg>
        <span className="climb__flag" aria-hidden="true">
          <svg viewBox="0 0 30 40"><path d="M4 2v38" stroke="currentColor" strokeWidth="3" strokeLinecap="round" /><path d="M5 3h20l-5 7 5 7H5z" fill="var(--gold)" /></svg>
        </span>
        <ol className="climb__pts">
          {steps.map((s, i) => {
            const [x, y] = POINTS[i];
            const state = i < current ? 'done' : i === current ? 'current' : 'todo';
            const can = i <= reached && i !== current;
            return (
              <li key={s.id} className={`climb__pt climb__pt--${state}`} style={{ left: `${(x / 800) * 100}%`, top: `${(y / 112) * 100}%` }}>
                <button
                  type="button"
                  className="climb__dot"
                  disabled={!can}
                  onClick={() => onJump(i)}
                  aria-current={i === current ? 'step' : undefined}
                  aria-label={`Step ${i + 1}: ${s.short}${state === 'done' ? ' (done)' : ''}`}
                >
                  {state === 'current' ? <span className="climb__lamp" /> : i + 1}
                </button>
                <span className="climb__label">{s.short}</span>
              </li>
            );
          })}
        </ol>
      </div>
      <p className="climb__count">Step {current + 1} of {steps.length} · <b>{steps[current].short}</b></p>
    </nav>
  );
}
