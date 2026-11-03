import { useEffect } from 'react';

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* DEPTH-SETTLE reveals: [data-reveal] elements get .is-in when they enter the viewport.
   `--d` (set via revealDelay) staggers siblings. Reduced motion → shown immediately. */
export default function useReveal(deps = []) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll('[data-reveal]:not(.is-in)'));
    if (!els.length) return undefined;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) {
      els.forEach((el) => el.classList.add('is-in'));
      return undefined;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

export const revealDelay = (i, step = 80) => ({ '--d': `${i * step}ms` });
