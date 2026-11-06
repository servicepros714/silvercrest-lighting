import { useEffect } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { BOOKING } from './data/business.js';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import MobileBar from './components/MobileBar.jsx';
import BookingHeader from './components/BookingHeader.jsx';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import NotFound from './pages/NotFound.jsx';
import About from './pages/About.jsx';
import Contact from './pages/Contact.jsx';
import Privacy from './pages/legal/Privacy.jsx';
import Terms from './pages/legal/Terms.jsx';
import Cookies from './pages/legal/Cookies.jsx';
import Accessibility from './pages/legal/Accessibility.jsx';

const FOCUSED = ['/book', '/checkout', '/confirmation'];

/* Scroll to top on every route change; honor #hash links (home sections, legal page contents). */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const id = hash.slice(1);
      let tries = 0;
      const t = setInterval(() => {
        const el = document.getElementById(id);
        if (el || tries++ > 20) {
          clearInterval(t);
          if (el) el.scrollIntoView({ block: 'start' });
        }
      }, 50);
      return () => clearInterval(t);
    }
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    return undefined;
  }, [pathname, hash]);
  return null;
}

export default function App() {
  const { pathname } = useLocation();
  const focused = FOCUSED.some((p) => pathname.startsWith(p));

  return (
    <>
      <ScrollManager />
      <a className="skip" href="#main">Skip to content</a>
      {focused ? <BookingHeader /> : <Nav />}
      <main id="main" className={focused ? 'main main--focused' : 'main'}>
        <Routes>
          <Route path="/" element={<Home />} />
          {BOOKING.online ? (
            <>
              <Route path="/book" element={<Book />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/confirmation" element={<Confirmation />} />
            </>
          ) : (
            ['/book', '/checkout', '/confirmation'].map((p) => (
              <Route key={p} path={p} element={<Navigate to={{ pathname: '/contact', hash: '#quote' }} replace />} />
            ))
          )}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy-policy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/cookie-policy" element={<Cookies />} />
          <Route path="/accessibility" element={<Accessibility />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!focused && <Footer />}
      {!focused && <MobileBar />}
    </>
  );
}
