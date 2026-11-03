/* FANNED CARD DECK gallery: the top card flicks to the back (swipe, drag, arrow buttons,
   arrow keys); rotated cards sit beneath. A numbered scene index beside it jumps to any
   scene. Illustrated scenes are tagged "Design preview" until real photos arrive. */
import { useCallback, useRef, useState } from 'react';
import { GALLERY } from '../data/business.js';
import { prefersReducedMotion, revealDelay } from '../lib/useReveal.js';
import { ArrowLeft, ArrowRight } from '../components/Icons.jsx';

const FLICK_MS = 420;
const pad = (n) => String(n).padStart(2, '0');

export default function Gallery() {
  const n = GALLERY.length;
  const [order, setOrder] = useState(() => GALLERY.map((_, i) => i));
  const [flick, setFlick] = useState(''); // '', 'left', 'right'
  const [drag, setDrag] = useState(0);
  const busy = useRef(false);
  const start = useRef(null);

  const top = order[0];

  const next = useCallback((dir = 'left') => {
    if (busy.current) return;
    if (prefersReducedMotion()) { setOrder((o) => [...o.slice(1), o[0]]); return; }
    busy.current = true;
    setFlick(dir);
    setTimeout(() => {
      setOrder((o) => [...o.slice(1), o[0]]);
      setFlick('');
      setDrag(0);
      busy.current = false;
    }, FLICK_MS);
  }, []);

  const prev = useCallback(() => {
    if (busy.current) return;
    setOrder((o) => [o[o.length - 1], ...o.slice(0, -1)]);
  }, []);

  const jump = (i) => {
    if (busy.current) return;
    setOrder(() => GALLERY.map((_, k) => (i + k) % n));
  };

  const onKey = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next('left'); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };

  const onDown = (e) => {
    if (busy.current) return;
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
    e.currentTarget.setPointerCapture && e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onMove = (e) => {
    if (!start.current) return;
    setDrag(e.clientX - start.current.x);
  };
  const onUp = () => {
    if (!start.current) return;
    const dx = drag;
    start.current = null;
    if (Math.abs(dx) > 70) next(dx < 0 ? 'left' : 'right');
    else setDrag(0);
  };

  return (
    <section id="gallery" className="section gallery" aria-labelledby="gal-title">
      <div className="container gallery__grid">
        <header className="shead gallery__head" data-reveal>
          <p className="eyebrow">Night installs</p>
          <h2 id="gal-title" className="h2">Rooflines worth slowing down for</h2>
          <p className="shead__sub">Swipe the deck or pick a scene. Real install photos replace these design previews as the season’s jobs wrap up.</p>

          <ol className="scene-index" aria-label="Scenes">
            {GALLERY.map((g, i) => (
              <li key={g.src} style={revealDelay(i, 60)} data-reveal>
                <button
                  type="button"
                  className={`scene-index__btn ${top === i ? 'is-active' : ''}`}
                  aria-current={top === i ? 'true' : undefined}
                  onClick={() => jump(i)}
                >
                  <span className="scene-index__num">{pad(i + 1)}</span>
                  <span className="scene-index__text">
                    <span className="scene-index__title">{g.title}</span>
                    <span className="scene-index__note">{g.note}</span>
                  </span>
                </button>
              </li>
            ))}
          </ol>
        </header>

        <div className="deck-wrap" data-reveal>
          <div
            className="deck"
            tabIndex={0}
            role="group"
            aria-roledescription="carousel"
            aria-label="Gallery deck — use left and right arrow keys"
            onKeyDown={onKey}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            {order.map((gi, k) => {
              const g = GALLERY[gi];
              const isTop = k === 0;
              const style = { '--k': Math.min(k, 4), zIndex: n - k };
              if (isTop && drag && !flick) style.transform = `translate(${drag}px, ${Math.abs(drag) * 0.05}px) rotate(${drag * 0.04}deg)`;
              return (
                <figure
                  key={g.src}
                  className={`card ${isTop ? 'is-top' : ''} ${isTop && flick ? `is-flick-${flick}` : ''} ${k > 3 ? 'is-hidden' : ''} ${isTop && drag ? 'is-dragging' : ''}`}
                  style={style}
                  aria-hidden={!isTop}
                >
                  <img src={g.src} alt={isTop ? `${g.title} — ${g.note} (design preview)` : ''} width="1200" height="800" loading={k < 2 ? 'eager' : 'lazy'} draggable="false" />
                  <span className="card__tag">Design preview</span>
                  <figcaption className="card__cap">
                    <span className="card__num">{pad(gi + 1)} / {pad(n)}</span>
                    <span className="card__title">{g.title}</span>
                  </figcaption>
                </figure>
              );
            })}
          </div>
          <div className="deck__ctrl">
            <button type="button" className="roundbtn" onClick={prev} aria-label="Previous scene"><ArrowLeft /></button>
            <p className="deck__live" aria-live="polite">{pad(top + 1)} · {GALLERY[top].title}</p>
            <button type="button" className="roundbtn roundbtn--gold" onClick={() => next('left')} aria-label="Next scene"><ArrowRight /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
