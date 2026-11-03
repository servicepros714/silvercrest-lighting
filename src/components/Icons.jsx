/* Inline icons (stroke = currentColor). */
import { useId } from 'react';
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const PhoneIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}><path {...S} d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" /></svg>
);
export const ArrowRight = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}><path {...S} d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowLeft = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}><path {...S} d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const CheckIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}><path {...S} strokeWidth="3" d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const CloseIcon = (p) => (
  <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" {...p}><path {...S} d="M6 6l12 12M18 6L6 18" /></svg>
);
export const PinIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}><path {...S} d="M12 21s-7-6.1-7-11.5a7 7 0 0 1 14 0C19 14.9 12 21 12 21z" /><circle {...S} cx="12" cy="9.5" r="2.5" /></svg>
);
export const CalendarIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}><rect {...S} x="3" y="4.5" width="18" height="17" rx="2.5" /><path {...S} d="M3 9.5h18M8 2.5v4M16 2.5v4" /></svg>
);
export const ShieldIcon = (p) => (
  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" {...p}><path {...S} d="M12 2.5l8 3v6c0 5-3.4 8.6-8 10-4.6-1.4-8-5-8-10v-6z" /><path {...S} d="M8.5 12l2.5 2.5 4.5-5" /></svg>
);
export const SearchIcon = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}><circle {...S} cx="11" cy="11" r="7" /><path {...S} d="M20 20l-3.6-3.6" /></svg>
);
export const ChevronDown = (p) => (
  <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" {...p}><path {...S} d="M6 9l6 6 6-6" /></svg>
);
export const LockIcon = (p) => (
  <svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true" {...p}><rect {...S} x="4" y="10.5" width="16" height="11" rx="2.5" /><path {...S} d="M8 10.5V7a4 4 0 0 1 8 0v3.5" /></svg>
);

/* Small mountain peak used as bullets and the nav "summit caret". */
export const PeakIcon = (p) => (
  <svg viewBox="0 0 24 14" width="18" height="11" aria-hidden="true" {...p}>
    <path d="M1 13L9 3l4 5 3-3 7 8z" fill="currentColor" />
  </svg>
);

/* Lantern (from the logo) — `lit` adds the warm glow. */
export function Lantern({ lit = true, className = '', ...p }) {
  const gid = `lglow${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <svg viewBox="0 0 48 64" className={`lantern ${lit ? 'is-lit' : ''} ${className}`} aria-hidden="true" {...p}>
      <defs>
        <radialGradient id={gid} cx="50%" cy="45%" r="60%">
          <stop offset="0%" stopColor="#FFFBEF" />
          <stop offset="45%" stopColor="#FCEECF" />
          <stop offset="100%" stopColor="#E9C075" />
        </radialGradient>
      </defs>
      <circle className="lantern__halo" cx="24" cy="26" r="22" />
      <path d="M4 17c0-3 9-8 20-8s20 5 20 8c0 1.5-2 2.4-4 2.4H8c-2 0-4-.9-4-2.4z" fill="#2D2F33" />
      <path d="M19 4.5h10l2 4.5H17z" fill="#3B3D41" />
      <path className="lantern__glass" d="M12 19.5h24l-4 17H16z" fill={lit ? `url(#${gid})` : '#3A4150'} />
      <path d="M12 19.5h24l-4 17H16z" fill="none" stroke="#372211" strokeWidth="1.6" />
      <path d="M24 19.5v17" stroke="#372211" strokeWidth="1.2" opacity=".55" />
      <rect x="15" y="36.5" width="18" height="4" rx="1.5" fill="#372211" />
      <rect x="21" y="40.5" width="6" height="22" rx="1.5" fill="#2A1A0D" />
    </svg>
  );
}

/* Gold + navy double swoosh from the logo, used as a curved section edge.
   The lowest band takes --swoosh-bg (the color of whatever comes next). */
export function Swoosh({ className = '', ...p }) {
  return (
    <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className={`swoosh ${className}`} aria-hidden="true" {...p}>
      <path d="M0 30 C 380 76, 1000 80, 1440 2 L1440 90 L0 90 Z" fill="var(--gold)" />
      <path d="M0 40 C 380 86, 1000 90, 1440 12 L1440 90 L0 90 Z" fill="var(--royal)" />
      <path d="M0 56 C 380 98, 1000 100, 1440 30 L1440 90 L0 90 Z" fill="var(--swoosh-bg, var(--frost))" />
    </svg>
  );
}

/* Layered brushed-silver ridges (reused in hero, footer, booking progress). */
export function Ridges({ className = '', ...p }) {
  return (
    <svg viewBox="0 0 1440 220" preserveAspectRatio="none" className={`ridges ${className}`} aria-hidden="true" {...p}>
      <defs>
        <linearGradient id="rg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#B5B7B9" /><stop offset="1" stopColor="#696B6F" />
        </linearGradient>
        <linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9FA1A4" /><stop offset="1" stopColor="#4D5055" />
        </linearGradient>
      </defs>
      <path d="M0 220 L0 150 L170 70 L260 120 L420 30 L560 110 L700 60 L860 140 L1010 50 L1170 120 L1300 80 L1440 130 L1440 220 Z" fill="url(#rg1)" opacity=".55" />
      <path d="M0 220 L0 175 L140 120 L300 170 L470 95 L620 160 L780 110 L930 170 L1110 105 L1260 165 L1440 140 L1440 220 Z" fill="url(#rg2)" />
    </svg>
  );
}
