/* LIFT BOARD: a ski-resort style status board of the install season. One row per week,
   seven day lamps, open windows and OPEN / FILLING / FULL / PASSED — live from the Worker. */
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import useAvailability from '../lib/useAvailability.js';
import { WINDOWS, addDays, fmtDate, openWindows, pacificToday, seasonRange, slotBookable, weekday } from '../lib/time.js';

function buildWeeks(booked) {
  const { start, end } = seasonRange();
  const back = (weekday(start) + 6) % 7; // Monday-based weeks
  let ws = addDays(start, -back);
  const weeks = [];
  while (ws <= end) {
    const days = [];
    let open = 0;
    let possible = 0;
    let firstOpen = '';
    for (let i = 0; i < 7; i++) {
      const d = addDays(ws, i);
      if (d < start || d > end) { days.push({ d, state: 'out' }); continue; }
      const bookable = WINDOWS.filter((w) => slotBookable(d, w.id)).length;
      const o = openWindows(d, booked).length;
      possible += bookable;
      open += o;
      if (o && !firstOpen) firstOpen = d;
      days.push({ d, state: !bookable ? 'passed' : o === 2 ? 'open' : o === 1 ? 'one' : 'full' });
    }
    let status = 'open';
    if (!possible) status = 'passed';
    else if (!open) status = 'full';
    else if (open / possible <= 0.4) status = 'filling';
    weeks.push({ ws, we: addDays(ws, 6), days, open, status, firstOpen });
    ws = addDays(ws, 7);
  }
  return weeks;
}

const LABEL = { open: 'Open', filling: 'Filling', full: 'Full', passed: 'Passed' };
const DAY = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function Season() {
  const { booked, loading, error, earliest } = useAvailability();
  const weeks = useMemo(() => buildWeeks(booked), [booked]);
  const left = weeks.reduce((s, w) => s + w.open, 0);
  const today = pacificToday();
  const { start, end } = seasonRange();

  return (
    <section id="season" className="section season" aria-labelledby="season-title">
      <div className="container">
        <header className="shead season__head" data-reveal>
          <p className="eyebrow eyebrow--light">Install season</p>
          <h2 id="season-title" className="h2 h2--light">Check the lift board before it closes</h2>
          <p className="shead__sub shead__sub--light">
            Installs run {fmtDate(start, { month: 'long', day: 'numeric' })} – {fmtDate(end, { month: 'long', day: 'numeric' })}, seven days a week,
            in two windows a day. The earliest window is 48 hours out — book early for the dates you want.
          </p>
        </header>

        <div className="readouts" data-reveal>
          <div className="readout">
            <span className="readout__k">Earliest open</span>
            <span className="readout__v">{loading ? '…' : earliest ? fmtDate(earliest.date) : 'Full'}</span>
            <span className="readout__s">{earliest ? earliest.time : ' '}</span>
          </div>
          <div className="readout">
            <span className="readout__k">Windows left</span>
            <span className="readout__v">{loading ? '…' : left}</span>
            <span className="readout__s">this season</span>
          </div>
          <div className="readout">
            <span className="readout__k">Daily windows</span>
            <span className="readout__v readout__v--sm">{WINDOWS.map((w) => w.label).join(' · ')}</span>
            <span className="readout__s">Pacific time</span>
          </div>
        </div>

        <div className="board" data-reveal>
          <div className="board__head" aria-hidden="true">
            <span>Week</span><span>Days</span><span>Windows</span><span>Status</span><span />
          </div>
          {error && <p className="board__note">Live availability couldn’t load right now — the board shows the season calendar. Call us to confirm a window.</p>}
          <ol className="board__rows">
            {weeks.map((w) => {
              const current = today >= w.ws && today <= w.we;
              return (
                <li key={w.ws} className={`brow brow--${w.status} ${current ? 'is-current' : ''}`}>
                  <span className="brow__week">
                    {fmtDate(w.ws < start ? start : w.ws, { month: 'short', day: 'numeric' })} – {fmtDate(w.we > end ? end : w.we, { month: 'short', day: 'numeric' })}
                    {current && <em className="brow__now">This week</em>}
                  </span>
                  <span className="brow__days" role="img" aria-label={`${w.open} open windows`}>
                    {w.days.map((d, i) => (
                      <span key={d.d} className={`dlamp dlamp--${d.state}`} title={d.state === 'out' ? '' : `${fmtDate(d.d)} · ${d.state}`}>
                        <i>{DAY[i]}</i>
                      </span>
                    ))}
                  </span>
                  <span className="brow__count">{w.status === 'passed' ? '—' : w.open}</span>
                  <span className={`brow__status pill pill--${w.status}`}>{loading ? '…' : LABEL[w.status]}</span>
                  <span className="brow__go">
                    {w.firstOpen && !loading ? (
                      <Link to={`/book?date=${w.firstOpen}`} aria-label={`Book the week of ${fmtDate(w.ws)}`}>Book</Link>
                    ) : null}
                  </span>
                </li>
              );
            })}
          </ol>
          <p className="board__legend" aria-hidden="true">
            <span><i className="dlamp dlamp--open" /> 2 open</span>
            <span><i className="dlamp dlamp--one" /> 1 left</span>
            <span><i className="dlamp dlamp--full" /> Full</span>
            <span><i className="dlamp dlamp--passed" /> Passed</span>
          </p>
        </div>
      </div>
    </section>
  );
}
