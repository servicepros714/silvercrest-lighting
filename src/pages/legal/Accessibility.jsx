import { Link } from 'react-router-dom';
import { BOOKING, BUSINESS } from '../../data/business.js';
import { ContactList, LegalPage } from '../../components/InfoPage.jsx';

const sections = [
  {
    id: 'commitment',
    title: 'Our commitment',
    body: (
      <p>
        {BUSINESS.name} wants everyone to be able to learn about our services and book an install, whatever
        device or assistive technology they use. We aim to meet the Web Content Accessibility Guidelines
        (WCAG) 2.2 at Level AA.
      </p>
    ),
  },
  {
    id: 'what-we-do',
    title: 'What we’ve built in',
    body: (
      <ul>
        <li>A “Skip to content” link and clear page landmarks and headings.</li>
        <li>Keyboard access to navigation, the mobile menu (press Escape to close it) and our forms.</li>
        <li>Visible focus outlines on links, buttons and form fields.</li>
        <li>Labeled form fields, with error messages that say what to fix and move focus to the field.</li>
        <li>Text alternatives for meaningful images. Decorative graphics are hidden from screen readers.</li>
        <li>Animations are reduced when your device is set to “reduce motion”.</li>
        <li>Layouts that adapt to phones, tablets and desktop screens and support browser zoom.</li>
      </ul>
    ),
  },
  {
    id: 'limitations',
    title: 'Known limitations',
    body: (
      <>
        <ul>
          {BOOKING.online && (
            <li>
              The online payment form is provided by Stripe. We don’t control its accessibility, but you can
              always choose “I’ll pay at the visit” at checkout instead.
            </li>
          )}
          <li>Gallery images are currently illustrations of typical designs, described by short captions.</li>
        </ul>
        <p>
          This statement is based on our own review of the website. We continue to test and improve it as the
          site changes.
        </p>
      </>
    ),
  },
  {
    id: 'other-ways',
    title: 'Other ways to reach us',
    body: (
      <p>
        If any part of the website is hard to use,{' '}
        {BUSINESS.phoneHref
          ? <>call us at <a href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a> and we’ll help you over the phone, or use</>
          : <>let us know through</>}{' '}
        our <Link to="/contact#quote">contact form</Link> and we’ll help you another way.
      </p>
    ),
  },
  {
    id: 'feedback',
    title: 'Feedback',
    body: (
      <>
        <p>
          If you run into an accessibility barrier, please let us know. Tell us the page, what you were trying
          to do and the device or assistive technology you were using, and we’ll work to fix it.
        </p>
        <ContactList />
      </>
    ),
  },
];

export default function Accessibility() {
  return (
    <LegalPage
      title="Accessibility Statement"
      sub="How we make this website usable for everyone, and how to reach us if something gets in your way."
      sections={sections}
    />
  );
}
