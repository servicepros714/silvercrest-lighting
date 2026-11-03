/* ─────────────────────────────────────────────────────────────
   Silvercrest Lighting — all editable content lives here.
   Prices: `null` shows "Online quoting".
   TODO items are marked — search this file for "TODO".
   ───────────────────────────────────────────────────────────── */

export const BUSINESS = {
  name: 'Silvercrest Lighting',
  short: 'Silvercrest',
  tagline: 'Christmas & permanent lighting, installed for you',
  // TODO: phone given as 555-555-555 (9 digits). Replace with the real 10-digit number.
  phoneDisplay: '555-555-555',
  phoneHref: 'tel:555555555',
  // TODO: replace the location placeholders with the real city / address.
  city: 'Your City',
  state: 'CA',
  street: '123 Placeholder St',
  zip: '00000',
  email: '', // TODO (optional): public contact email
  googleReviewUrl: '', // TODO: Google review link, once the profile exists
  depositCents: 14900,
  depositLabel: '$149',
  hours: 'Mon–Sun · 8AM–4PM installs',
};

export const addressLine = () => `${BUSINESS.street}, ${BUSINESS.city}, ${BUSINESS.state} ${BUSINESS.zip}`;

/* Booking step 1. */
export const LIGHT_TYPES = [
  {
    id: 'Seasonal',
    name: 'Seasonal Christmas lights',
    tag: 'Leased · installed · taken down',
    blurb: 'Commercial-grade LED holiday lights we design, hang, maintain and take down after the holidays.',
  },
  {
    id: 'Permanent',
    name: 'Permanent lighting',
    tag: 'Mounted once · app-controlled',
    blurb: 'Low-profile track lighting along the roofline that stays up year-round. Every holiday, one tap.',
  },
];

/* Package prices: `null` = "Online quoting". Seasonal and Permanent can differ.
   `peak` = visual height of the summit card (1 = tallest). */
export const PACKAGES = [
  {
    id: 'Front Only',
    name: 'Front Only',
    peak: 0.72,
    price: { Seasonal: null, Permanent: null }, // TODO: starting prices, e.g. { Seasonal: 499, Permanent: null }
    coverage: 'The roofline facing the street',
    features: [
      'Professional design for the front of the home',
      'Commercial-grade LED lights (leased, no purchase needed)',
      'Roofline & gutter-line installation',
      'Timer setup',
      'In-season maintenance & bulb replacement',
      'Takedown after the holidays',
    ],
  },
  {
    id: 'Front & Sides',
    name: 'Front & Sides',
    peak: 1,
    price: { Seasonal: null, Permanent: null }, // TODO: starting prices
    coverage: 'Front plus the side rooflines',
    features: [
      'Everything in Front Only',
      'Side rooflines & gutters',
      'Expanded custom design',
    ],
  },
];

export const STORY_OPTIONS = [
  { id: '1-Story', name: '1-story home', note: 'Single-level roofline' },
  { id: '2-Story', name: '2-story home', note: '+50% of package price', pct: 50 },
];

/* Add-ons (booking step 3). `price: null` = "Online quoting".
   `flat: true` = a set price rather than an add-on to the package. */
export const ADDONS = [
  { id: 'Trees', name: 'Tree & bush wrapping', price: null },
  { id: 'Wreaths', name: 'Wreaths / garland', price: null },
  { id: 'Pathway', name: 'Pathway / stake lights', price: null },
  { id: 'Own lights', name: 'Install customer-owned lights', price: null, flat: true },
  { id: 'Storage', name: 'Off-season storage', price: null, seasonalOnly: true },
];

/* TODO: replace with the real cities your crew covers. The first one is the home base. */
export const SERVICE_AREA = [
  'Your City',
  'Nearby City 1',
  'Nearby City 2',
  'Nearby City 3',
  'Nearby City 4',
  'Nearby City 5',
  'Nearby City 6',
  'Nearby City 7',
];

export const STEPS = [
  { id: 'book', title: 'Book', text: 'Pick seasonal or permanent, your package and an install window online. Reserve with a deposit or pay at the visit.' },
  { id: 'design', title: 'Design', text: 'We walk your roofline, check outlets and confirm the design and final price with you on site.' },
  { id: 'install', title: 'Install', text: 'Our crew hangs and tests every run, sets your timer and leaves the yard the way we found it.' },
  { id: 'takedown', title: 'Takedown', text: 'Seasonal lights come down after the holidays. Permanent lighting stays up and switches to any holiday.' },
];

/* Illustrated scenes until real install photos arrive (public/gallery/*.svg). */
export const GALLERY = [
  { src: '/gallery/warm-white-ranch.svg', title: 'Warm white ranch', note: 'Front roofline · warm white C9' },
  { src: '/gallery/two-story-gold.svg', title: 'Two-story gold', note: 'Front & sides · 2-story' },
  { src: '/gallery/multicolor-cottage.svg', title: 'Multicolor cottage', note: 'Classic multicolor + wreath' },
  { src: '/gallery/red-white-gables.svg', title: 'Red & white gables', note: 'Candy-cane roofline' },
  { src: '/gallery/permanent-track.svg', title: 'Permanent track', note: 'Year-round, app-controlled' },
  { src: '/gallery/pathway-trees.svg', title: 'Trees & pathway', note: 'Wrapped trees + stake lights' },
];

export const FAQS = [
  {
    q: 'Do I need special outlets or extra power?',
    a: 'Most homes don’t. We plan each run around your existing exterior outlets and use low-draw LEDs, so a standard GFCI outlet usually covers a full roofline. If a run needs more, we’ll tell you at the design visit before anything goes up.',
  },
  {
    q: 'Do I buy the lights or lease them?',
    a: 'Seasonal installs use our commercial-grade LEDs on a lease, so there’s nothing to buy, store or untangle. Prefer your own lights? Pick “Install customer-owned lights” as an add-on. Permanent lighting is mounted once and stays with the home.',
  },
  {
    q: 'How do the timers work?',
    a: 'We set a timer during the install so the lights turn on at dusk and off at a time you choose. Permanent lighting runs from an app with schedules and color scenes for every holiday.',
  },
  {
    q: 'What happens if it rains or gets windy?',
    a: 'Our lights and clips are rated for outdoor weather. We don’t install in heavy rain or high wind for safety; if your window is affected we’ll call to move it to the next open slot.',
  },
  {
    q: 'When do the lights come down?',
    a: 'Seasonal takedown starts after the holidays, usually in early January. We’ll reach out to schedule a day that works for you. Permanent lighting stays up year-round.', // TODO: confirm takedown timing
  },
  {
    q: 'How does the deposit work?',
    a: 'You can reserve your install window with a $149 deposit, which is applied to your final invoice. Or choose “I’ll pay at the visit” at checkout and pay everything on install day.',
  },
  {
    q: 'How is the final price set?',
    a: 'Prices are “starting at.” Your final price is confirmed at the on-site design visit, after we measure the roofline and agree on the design.',
  },
];
