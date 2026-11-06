import Hero from '../sections/Hero.jsx';
import Gallery from '../sections/Gallery.jsx';
import HowItWorks from '../sections/HowItWorks.jsx';
import Packages from '../sections/Packages.jsx';
import Season from '../sections/Season.jsx';
import Reviews from '../sections/Reviews.jsx';
import ServiceArea from '../sections/ServiceArea.jsx';
import FAQ from '../sections/FAQ.jsx';
import FinalCTA from '../sections/FinalCTA.jsx';
import useReveal from '../lib/useReveal.js';
import { BOOKING } from '../data/business.js';

/* Section order: Hero → Gallery → How it works → Packages → Season → Reviews →
   Service area → FAQ → Final CTA */
export default function Home() {
  useReveal([]);
  return (
    <>
      <Hero />
      <Gallery />
      <HowItWorks />
      <Packages />
      {BOOKING.online && <Season />}
      <Reviews />
      <ServiceArea />
      <FAQ />
      <FinalCTA />
    </>
  );
}
