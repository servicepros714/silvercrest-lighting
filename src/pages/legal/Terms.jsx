/* Terms and Conditions. Booking/deposit wording only appears while BOOKING.online is true.
   TODO (owner, with a legal professional): legal business name and structure; cancellation,
   rescheduling and deposit-refund policy; takedown timing; any warranty on permanent lighting;
   liability/insurance terms for installation work; dispute-resolution terms. */
import { Link } from 'react-router-dom';
import { BOOKING, BUSINESS } from '../../data/business.js';
import { ContactList, LegalPage } from '../../components/InfoPage.jsx';

const sections = [
  {
    id: 'about-these-terms',
    title: 'About these terms',
    body: (
      <p>
        These Terms and Conditions apply to your use of the {BUSINESS.name} website
        {BOOKING.online ? ', our online booking system' : ''} and our quote-request form. By using the website you
        agree to these terms. If you don’t agree, please don’t use the website.
      </p>
    ),
  },
  {
    id: 'our-services',
    title: 'Our services',
    body: (
      <>
        <p>We offer two kinds of exterior lighting:</p>
        <ul>
          <li>
            <b>Seasonal Christmas lights:</b> commercial-grade LED holiday lights that we design, install,
            maintain during the season and take down after the holidays.
          </li>
          <li>
            <b>Permanent lighting:</b> low-profile track lighting mounted along the roofline that stays up
            year-round.
          </li>
        </ul>
        <p>
          Package descriptions on this website describe what is typically included. The exact scope of your
          install is agreed with you at the on-site design visit.
        </p>
      </>
    ),
  },
  {
    id: 'quote-requests',
    title: 'Quote requests',
    body: (
      <p>
        Sending a quote request tells us you’re interested. It does not book an install date, create a contract or
        charge you anything. We’ll contact you to discuss your home, and your install date, scope and final price
        are agreed with you before any work starts.
      </p>
    ),
  },
  ...(BOOKING.online ? [
    {
      id: 'booking',
      title: 'Booking an install window',
      body: (
        <>
          <p>
            Booking online reserves an install date and time window. Before any work starts, we walk your
            roofline, check your exterior outlets and confirm the design and final price with you on site.
          </p>
          <p>
            Please give accurate contact and address details, and only book for a property where you are allowed
            to have lighting installed. We may contact you to correct a booking or, if a window becomes
            unavailable, to offer another one.
          </p>
        </>
      ),
    },
    {
      id: 'deposits-payment',
      title: 'Deposits and payment',
      body: (
        <p>
          When booking, you can either reserve your window with a {BUSINESS.depositLabel} deposit, which is
          applied to your final invoice, or choose to pay at the visit. Online payments are processed securely
          by Stripe. We never see your full card number.
        </p>
      ),
    },
  ] : []),
  {
    id: 'pricing',
    title: 'Prices and estimates',
    body: (
      <>
        <p>
          Prices on this website are “starting at” prices. Some items show “Online quoting” instead of a price.
          Your home’s height, the length of your rooflines and the add-ons you choose can change the price.
        </p>
        <p>Your final price is confirmed at the on-site design visit, before installation.</p>
      </>
    ),
  },
  {
    id: 'weather-access',
    title: 'Weather, scheduling and access',
    body: (
      <>
        <p>
          For safety, we don’t install in heavy rain or high wind. If weather affects your install, we’ll contact
          you to move it to the next open slot.
        </p>
        <p>
          Please make sure our crew can safely reach the rooflines being lit and the exterior outlets we’ll use on
          your install day, and only request work for a property where you are allowed to have lighting installed.
        </p>
      </>
    ),
  },
  {
    id: 'seasonal-permanent',
    title: 'Seasonal and permanent lighting',
    body: (
      <>
        <p>
          Seasonal installs use our lights on a lease. The lights remain our property and are taken down after
          the holidays. We’ll contact you to schedule takedown. If you’d rather use your own lights, ask about
          installing customer-owned lights.
        </p>
        <p>Permanent lighting is mounted once and stays with the home.</p>
      </>
    ),
  },
  {
    id: 'website-use',
    title: 'Using this website',
    body: (
      <>
        <p>
          The text, logo, illustrations and design of this website belong to {BUSINESS.name} or are used with
          permission. Please don’t copy or reuse them without our written permission.
        </p>
        <p>
          Please don’t misuse the website or its forms, for example by sending false requests or trying to
          interfere with how the site works. Gallery images are illustrations of popular designs, not photos of
          completed installs.
        </p>
        <p>
          We work to keep the website accurate and available, but it is provided “as is”, and features may
          sometimes be unavailable. If that happens, please try again later.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    body: (
      <p>
        To the extent the law allows, {BUSINESS.name} is not responsible for losses caused by your use of, or
        inability to use, this website. Nothing in these terms limits any rights you have under applicable
        consumer protection law.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: 'Governing law',
    body: <p>These terms are governed by the laws of the State of California.</p>,
  },
  {
    id: 'changes',
    title: 'Changes to these terms',
    body: (
      <p>
        We may update these terms from time to time. The “Last updated” date at the top shows the latest
        version. See also our <Link to="/privacy-policy">Privacy Policy</Link>.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact us',
    body: (
      <>
        <p>Questions about these terms:</p>
        <ContactList />
      </>
    ),
  },
];

export default function Terms() {
  return (
    <LegalPage
      title="Terms and Conditions"
      sub="How quote requests, estimates and our services work when you use this website."
      sections={sections}
    />
  );
}
