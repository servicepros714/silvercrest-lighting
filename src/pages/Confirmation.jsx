/* Confirmation. Also finishes redirect-based payments (Stripe returns here with
   ?payment_intent=…&redirect_status=…). */
import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BUSINESS } from '../data/business.js';
import { readLastBooking, useDraft } from '../lib/draft.jsx';
import { finishBooking } from '../lib/finish.js';
import { fmtLong } from '../lib/time.js';
import { isComplete } from './Checkout.jsx';
import { CheckIcon, Lantern, PhoneIcon } from '../components/Icons.jsx';

export default function Confirmation() {
  const [params] = useSearchParams();
  const { draft, reset } = useDraft();
  const piId = params.get('payment_intent');
  const status = params.get('redirect_status');
  const ref = params.get('ref');
  const [booking, setBooking] = useState(() => (piId ? null : readLastBooking()));
  const [state, setState] = useState(piId ? 'finishing' : 'done');
  const [error, setError] = useState('');
  const ran = useRef(false);

  useEffect(() => {
    if (!piId || ran.current) return;
    ran.current = true;
    if (status && status !== 'succeeded' && status !== 'processing') {
      setState('failed');
      return;
    }
    const last = readLastBooking();
    if (!isComplete(draft) || (ref && draft.ref !== ref)) {
      // Already saved (page refreshed) — show the last booking.
      setBooking(last);
      setState('done');
      return;
    }
    finishBooking(draft, reset, { paymentIntentId: piId })
      .then(() => { setBooking(readLastBooking()); setState('done'); })
      .catch((e) => { setError(e.message); setState('error'); });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (state === 'finishing') {
    return <div className="confirm"><div className="container confirm__card"><p className="confirm__loading">Confirming your payment…</p></div></div>;
  }

  if (state === 'failed') {
    return (
      <div className="confirm"><div className="container confirm__card">
        <h1 className="confirm__title">Your payment didn’t go through</h1>
        <p className="confirm__sub">No booking was made. Try again or reserve and pay at the visit.</p>
        <div className="confirm__btns"><Link to="/checkout" className="btn btn--gold">Back to checkout</Link></div>
      </div></div>
    );
  }

  if (state === 'error') {
    return (
      <div className="confirm"><div className="container confirm__card">
        <h1 className="confirm__title">Payment received — one more step</h1>
        <p className="confirm__sub">We couldn’t save your booking automatically ({error}). Please call {BUSINESS.phoneDisplay} and we’ll lock in your window. Your deposit is safe.</p>
        <div className="confirm__btns"><a href={BUSINESS.phoneHref} className="btn btn--gold"><PhoneIcon /> Call now</a></div>
      </div></div>
    );
  }

  if (!booking) {
    return (
      <div className="confirm"><div className="container confirm__card">
        <h1 className="confirm__title">No recent booking found</h1>
        <p className="confirm__sub">Start a new booking or give us a call.</p>
        <div className="confirm__btns">
          <Link to="/book" className="btn btn--gold">Book Online</Link>
          <a href={BUSINESS.phoneHref} className="btn btn--outline"><PhoneIcon /> Call</a>
        </div>
      </div></div>
    );
  }

  const paid = booking.paymentStatus === 'Paid';
  return (
    <div className="confirm">
      <div className="container confirm__card">
        <div className="confirm__lamp" aria-hidden="true"><Lantern /></div>
        <p className="confirm__badge"><CheckIcon /> Booking confirmed</p>
        <h1 className="confirm__title">You’re on the install calendar, {booking.name.split(' ')[0]}.</h1>
        <p className="confirm__sub">
          {paid
            ? `Your ${BUSINESS.depositLabel} deposit is paid and will be applied to your final invoice.`
            : 'You chose to pay at the visit — nothing is due today.'}
        </p>
        {booking.conflict && (
          <p className="confirm__warn">That window filled up while you were paying. Your deposit is safe — we’ll call you to confirm a new time.</p>
        )}
        <dl className="confirm__list">
          <div><dt>Booking ID</dt><dd>{booking.id}</dd></div>
          <div><dt>Install</dt><dd>{fmtLong(booking.date)} · {booking.time}</dd></div>
          <div><dt>Lighting</dt><dd>{booking.type} · {booking.package}</dd></div>
          <div><dt>Home</dt><dd>{[booking.stories, ...(booking.addons || []).map((a) => `+${a}`)].join(' · ')}</dd></div>
          <div><dt>Address</dt><dd>{booking.address}</dd></div>
          <div><dt>Payment</dt><dd>{booking.paymentStatus}</dd></div>
        </dl>
        <p className="confirm__next">Next: we’ll reach out before your window to confirm the design visit. Questions? Call {BUSINESS.phoneDisplay}.</p>
        <div className="confirm__btns">
          <Link to="/" className="btn btn--navy">Back to home</Link>
          <a href={BUSINESS.phoneHref} className="btn btn--outline"><PhoneIcon /> {BUSINESS.phoneDisplay}</a>
        </div>
      </div>
    </div>
  );
}
