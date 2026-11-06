/* Privacy Policy. Booking/payment wording only appears while BOOKING.online is true.
   TODO (owner, with a legal professional): legal business name and structure, a mailing address for
   privacy requests, a record-retention period, and whether any state privacy law (e.g. CCPA) applies. */
import { Link } from 'react-router-dom';
import { BOOKING, BUSINESS } from '../../data/business.js';
import { ContactList, LegalPage } from '../../components/InfoPage.jsx';

const ext = (href, label) => <a href={href} target="_blank" rel="noopener noreferrer">{label}</a>;

const sections = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    body: (
      <p>
        This Privacy Policy explains how {BUSINESS.name} (“we”, “us”, “our”), based in {BUSINESS.city},{' '}
        {BUSINESS.state}, collects, uses and protects personal information when you visit this website,
        request a quote{BOOKING.online ? ', book an install window online' : ''} or contact us.
      </p>
    ),
  },
  {
    id: 'information-we-collect',
    title: 'Information we collect',
    body: (
      <>
        <h3>When you request a quote or send us a message</h3>
        <ul>
          <li>Your name and email address, and your phone number if you choose to give it.</li>
          <li>The city or ZIP code of the home you’d like lit.</li>
          <li>Your lighting interests (type, package, home height, add-ons) and any message you write.</li>
        </ul>
        {BOOKING.online && (
          <>
            <h3>When you book online</h3>
            <ul>
              <li>Your full name, phone number, email address and service address.</li>
              <li>
                Your selections: seasonal or permanent lighting, package, home height, add-ons, install date and
                time window, and the starting estimate shown during booking.
              </li>
              <li>A booking reference that we create to keep track of your request.</li>
            </ul>
            <h3>Payment information</h3>
            <p>
              If you choose to pay a deposit online, you enter your card or wallet details directly into a secure
              payment form provided by Stripe. We do not receive or store your full card number. Stripe tells us
              whether the payment succeeded and gives us a payment reference.
            </p>
          </>
        )}
        <h3>Information stored on your device</h3>
        <p>
          Your browser remembers the add-ons you pick on our Packages section so they carry into your
          request. Our <Link to="/cookie-policy">Cookie Policy</Link> explains exactly what is stored and for how long.
        </p>
        <h3>Technical information</h3>
        <p>
          When you load this website, the services that host and deliver it (see “Who we share it with” below)
          automatically receive standard technical information such as your IP address, browser type and the
          pages requested. We do not use analytics or advertising trackers on this website.
        </p>
      </>
    ),
  },
  {
    id: 'how-we-use-it',
    title: 'How we use your information',
    body: (
      <ul>
        <li>To reply to your quote request or question.</li>
        <li>To arrange and carry out your on-site design visit, installation, maintenance and takedown.</li>
        <li>To prepare your lighting design and confirm the final price with you.</li>
        {BOOKING.online && <li>To reserve your install window and take and verify deposit payments.</li>}
        <li>To keep accurate business, tax and accounting records.</li>
        <li>To keep this website secure and working properly, including filtering spam.</li>
      </ul>
    ),
  },
  {
    id: 'who-we-share-it-with',
    title: 'Who we share it with',
    body: (
      <>
        <p>We do not sell or rent your personal information. We share it only as needed to run our service:</p>
        <ul>
          <li>
            <b>Netlify</b> hosts this website and receives and stores the quote requests and messages you send
            through our forms. Submissions may be screened by automated spam filtering.
          </li>
          {BOOKING.online && <li><b>Cloudflare</b> runs the database that stores online booking requests.</li>}
          {BOOKING.online && <li><b>Stripe</b> processes online deposit payments.</li>}
          <li><b>Google Fonts</b> delivers the typefaces used on this website.</li>
          <li>Members of our crew who need your details to visit, install or take down your lights.</li>
          <li>Authorities or other parties when the law requires it.</li>
        </ul>
        <p>
          These providers handle information under their own privacy policies:{' '}
          {ext('https://www.netlify.com/privacy/', 'Netlify')},{' '}
          {BOOKING.online && <>{ext('https://www.cloudflare.com/privacypolicy/', 'Cloudflare')}, {ext('https://stripe.com/privacy', 'Stripe')} and </>}
          {!BOOKING.online && 'and '}
          {ext('https://policies.google.com/privacy', 'Google')}.
        </p>
      </>
    ),
  },
  {
    id: 'how-long-we-keep-it',
    title: 'How long we keep it',
    body: (
      <>
        <p>
          We keep quote requests and customer records for as long as we need them to respond to you and provide
          our service, and as long as needed to meet our legal, tax and accounting obligations.
        </p>
        <p>
          Information saved in your browser stays on your device until you clear this website’s data. See the{' '}
          <Link to="/cookie-policy">Cookie Policy</Link> for details.
        </p>
      </>
    ),
  },
  {
    id: 'security',
    title: 'How we protect it',
    body: (
      <p>
        This website uses an encrypted (HTTPS) connection, and access to the requests you send us is limited to
        people who need it to run our service.{BOOKING.online ? ' Online payments are handled by Stripe.' : ''} No
        method of sending or storing information is completely secure, but we take reasonable steps to protect yours.
      </p>
    ),
  },
  {
    id: 'your-choices',
    title: 'Your choices and rights',
    body: (
      <>
        <p>
          You can contact us at any time to ask what personal information we hold about you, to correct it, or to
          ask us to delete it. We will respond within a reasonable time and as required by applicable law. We may
          need to keep some records when the law requires us to.
        </p>
        <p>
          You can also clear information saved in your browser by clearing this website’s data in your browser
          settings.
        </p>
      </>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    body: (
      <p>
        This website is intended for adults arranging lighting for their home. It is not directed at children
        under 13, and we do not knowingly collect personal information from them.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    body: (
      <p>
        We may update this policy when our services or the law change. The “Last updated” date at the top of
        this page shows when it was last revised.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: (
      <>
        <p>Questions or privacy requests can be sent to {BUSINESS.name}:</p>
        <ContactList />
      </>
    ),
  },
];

export default function Privacy() {
  return (
    <LegalPage
      title="Privacy Policy"
      sub="What we collect when you visit or contact us, why we need it, and the choices you have."
      sections={sections}
    />
  );
}
