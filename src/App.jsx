import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Nav from './components/Nav.jsx';
import Footer from './components/Footer.jsx';
import MobileBar from './components/MobileBar.jsx';
import BookingHeader from './components/BookingHeader.jsx';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import NotFound from './pages/NotFound.jsx';

const FOCUSED = ['/book', '/checkout', '/confirmation'];

/* Scroll to top on every route change; on the home page honor #hash links. */
function ScrollManager() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (pathname === '/' && hash) {
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
          <Route path="/book" element={<Book />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!focused && <Footer />}
      {!focused && <MobileBar />}
    </>
  );
}
