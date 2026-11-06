/* Cookie Policy. Storage keys match src/lib/draft.jsx — update this page if those keys change,
   or if analytics, ad pixels, chat widgets or embedded maps are ever added (a consent banner may then be needed). */
import { Link } from 'react-router-dom';
import { BOOKING, BUSINESS } from '../../data/business.js';
import { ContactList, LegalPage } from '../../components/InfoPage.jsx';

const STORAGE = [
  {
    name: 'silvercrest-draft-v1',
    purpose: BOOKING.online
      ? 'Saves your add-on picks and booking progress so your selections survive a refresh or a return visit.'
      : 'Remembers the add-ons you pick on the Packages section so they carry into your quote request.',
    contents: BOOKING.online
      ? 'Your selections, the contact details you have typed in, and a booking reference.'
      : 'Your add-on picks and a random reference code. No contact details.',
    duration: 'Until you send your request or clear this website’s data.',
  },
  ...(BOOKING.online ? [{
    name: 'silvercrest-last-booking',
    purpose: 'Shows your booking summary on the confirmation page.',
    contents: 'A summary of your most recent booking, including the contact details you gave.',
    duration: 'Until you clear this website’s data.',
  }] : []),
];

const sections = [
  {
    id: 'summary',
    title: 'The short version',
    body: (
      <ul>
        <li>{BUSINESS.name} does not use advertising or analytics cookies.</li>
        <li>This website does not set its own cookies.</li>
        <li>Your browser’s local storage remembers a few choices on your device.</li>
        {BOOKING.online && <li>Our payment provider may set its own cookies.</li>}
      </ul>
    ),
  },
  {
    id: 'what-they-are',
    title: 'Cookies and local storage',
    body: (
      <p>
        Cookies are small files a website saves in your browser. Local storage is a similar browser feature that
        lets a website keep information on your device. Information in local storage stays in your browser and
        isn’t sent to us.
      </p>
    ),
  },
  {
    id: 'what-we-store',
    title: 'What this website stores on your device',
    body: (
      <div className="table-wrap" role="region" aria-label="Local storage used by this website" tabIndex={0}>
        <table className="ptable">
          <thead>
            <tr><th scope="col">Name</th><th scope="col">Purpose</th><th scope="col">What it holds</th><th scope="col">How long</th></tr>
          </thead>
          <tbody>
            {STORAGE.map((s) => (
              <tr key={s.name}>
                <th scope="row"><code>{s.name}</code></th>
                <td data-label="Purpose">{s.purpose}</td>
                <td data-label="What it holds">{s.contents}</td>
                <td data-label="How long">{s.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'third-parties',
    title: 'Third-party services',
    body: (
      <ul>
        <li>
          <b>Netlify</b> (hosting and forms). Netlify delivers this website and receives the forms you send. We
          haven’t turned on any Netlify features that set cookies for visitors, such as split testing or user
          logins.{' '}
          <a href="https://www.netlify.com/privacy/" target="_blank" rel="noopener noreferrer">Netlify’s privacy policy</a>
        </li>
        <li>
          <b>Google Fonts</b> (typefaces). Google receives your IP address when your browser downloads our fonts.
          Google Fonts does not set cookies.{' '}
          <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google’s privacy policy</a>
        </li>
        {BOOKING.online && (
          <li>
            <b>Stripe</b> (online payments). Our pages load Stripe’s payment library, and Stripe may set cookies
            (such as <code>__stripe_mid</code> and <code>__stripe_sid</code>) to prevent fraud and keep payments
            secure.{' '}
            <a href="https://stripe.com/cookies-policy/legal" target="_blank" rel="noopener noreferrer">Stripe’s cookie policy</a>
          </li>
        )}
      </ul>
    ),
  },
  {
    id: 'your-choices',
    title: 'Managing cookies and storage',
    body: (
      <p>
        You can block or delete cookies and local storage in your browser settings. Clearing this website’s data
        removes anything saved on your device. If you block local storage, the site still works. Your add-on
        picks just won’t be remembered between pages. You can still <Link to="/contact#quote">request a quote</Link>.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        We’ll update this page if the way we use cookies or local storage changes. For how we handle personal
        information in general, see our <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: <ContactList />,
  },
];

export default function Cookies() {
  return (
    <LegalPage
      title="Cookie Policy"
      sub="What this website stores in your browser, what third-party services do, and how to control it."
      sections={sections}
    />
  );
}
