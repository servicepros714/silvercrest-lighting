/* Checkout — shared "Luna Glow" layout: crumbs, centered heading, pay card (Express
   Checkout + Payment Element, $149 deposit applied to the final invoice) beside the order
   summary, and "I'll pay at the visit" as a plain text link at the bottom. */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
// '/pure' only loads Stripe.js when loadStripe() runs (i.e. on checkout with a real key),
// instead of injecting it on every page at import time.
import { loadStripe } from '@stripe/stripe-js/pure';
import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { BUSINESS } from '../data/business.js';
import { useDraft } from '../lib/draft.jsx';
import { createPaymentIntent } from '../lib/api.js';
import { finishBooking } from '../lib/finish.js';
import { estimate } from '../lib/pricing.js';
import { fmtLong } from '../lib/time.js';
import { CheckIcon, LockIcon, ShieldIcon } from '../components/Icons.jsx';

const PK = String(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '').trim();
const stripeReady = /^pk_(test|live)_/.test(PK) && !/REPLACE/i.test(PK);
const stripePromise = stripeReady ? loadStripe(PK) : null;

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#001E3F',
    colorText: '#00152C',
    colorDanger: '#B42318',
    fontFamily: 'Lexend, system-ui, sans-serif',
    borderRadius: '12px',
    spacingUnit: '4px',
  },
  rules: {
    '.Input': { borderColor: '#C9CDD4', boxShadow: 'none' },
    '.Input:focus': { borderColor: '#D89401', boxShadow: '0 0 0 3px rgba(249,185,1,.25)' },
    '.Tab--selected': { borderColor: '#001E3F' },
  },
};

export const isComplete = (d) => d.type && d.pkg && d.stories && d.date && d.time && d.name && d.phone && d.email && d.address;

function PayForm({ draft, onPaid, setError, busy, setBusy }) {
  const stripe = useStripe();
  const elements = useElements();
  const returnUrl = `${window.location.origin}/confirmation?ref=${encodeURIComponent(draft.ref)}`;

  const confirm = async () => {
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: returnUrl,
        payment_method_data: { billing_details: { name: draft.name, email: draft.email, phone: draft.phone } },
      },
      redirect: 'if_required',
    });
    if (error) throw new Error(error.message || 'Your payment didn’t go through.');
    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      await onPaid(paymentIntent.id);
    } else {
      throw new Error('Your payment needs another step. Please try again.');
    }
  };

  const payCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || busy) return;
    setBusy(true); setError('');
    try {
      const { error: submitError } = await elements.submit();
      if (submitError) throw new Error(submitError.message);
      await confirm();
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  };

  // Wallet sheet already collected + confirmed details, so skip elements.submit().
  const payExpress = async () => {
    if (!stripe || !elements) return;
    setBusy(true); setError('');
    try { await confirm(); } catch (err) { setError(err.message); setBusy(false); }
  };

  return (
    <form onSubmit={payCard} className="payform">
      <ExpressCheckoutElement onConfirm={payExpress} options={{ buttonHeight: 48 }} />
      <p className="payform__or"><span>or pay by card</span></p>
      <PaymentElement options={{ layout: 'tabs', fields: { billingDetails: { name: 'never', email: 'never', phone: 'never' } } }} />
      <button type="submit" className="btn btn--gold btn--lg btn--block" disabled={!stripe || busy}>
        <LockIcon /> {busy ? 'Processing…' : `Pay ${BUSINESS.depositLabel} deposit`}
      </button>
    </form>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const { draft, reset } = useDraft();
  const [clientSecret, setClientSecret] = useState('');
  const [piError, setPiError] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const finishing = useRef(false);
  const est = estimate(draft);

  useEffect(() => {
    if (!stripeReady || !draft.ref || !isComplete(draft)) return;
    let alive = true;
    createPaymentIntent(draft.ref)
      .then((r) => { if (alive) setClientSecret(r.clientSecret); })
      .catch((e) => { if (alive) setPiError(e.message); });
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft.ref]);

  const options = useMemo(() => (clientSecret ? { clientSecret, appearance } : null), [clientSecret]);

  if (!isComplete(draft) && !finishing.current) return <Navigate to="/book" replace />;

  const complete = async (paymentIntentId) => {
    finishing.current = true;
    try {
      await finishBooking(draft, reset, { paymentIntentId });
      navigate('/confirmation', { replace: true });
    } catch (err) {
      finishing.current = false;
      throw err;
    }
  };

  const onPaid = async (piId) => {
    try { await complete(piId); } catch (err) {
      setBusy(false);
      setError(`Your payment went through, but we couldn’t save the booking (${err.message}). Please call ${BUSINESS.phoneDisplay} — your deposit is safe.`);
    }
  };

  const payLater = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try { await complete(undefined); } catch (err) {
      setBusy(false);
      setError(err.message);
    }
  };

  const slotProblem = /window|taken|available/i.test(error) && !/payment went through/i.test(error);

  return (
    <div className="checkout">
      <div className="container">
        <ol className="crumbs" aria-label="Progress">
          <li className="is-done"><CheckIcon /> Package</li>
          <li className="is-done"><CheckIcon /> Details</li>
          <li className="is-current" aria-current="step">Payment</li>
          <li>Confirmed</li>
        </ol>
        <header className="checkout__head">
          <h1 className="checkout__title">Reserve your install</h1>
          <p className="checkout__sub">A {BUSINESS.depositLabel} deposit holds your window and is applied to your final invoice.</p>
        </header>

        {error && (
          <div className="checkout__error" role="alert">
            <span>{error}</span>
            {slotProblem && <Link className="btn btn--navy btn--sm" to="/book?step=3">Choose another window</Link>}
          </div>
        )}

        <div className="checkout__grid">
          <section className="paycard" aria-labelledby="pay-title">
            <h2 id="pay-title" className="paycard__title">Payment</h2>
            <p className="paycard__amount"><span>Due today</span><b>{BUSINESS.depositLabel}.00</b></p>

            {!stripeReady && (
              <p className="paycard__note">Online card payment isn’t switched on yet. You can still reserve your window and pay at the visit below.</p>
            )}
            {stripeReady && piError && <p className="paycard__note paycard__note--err">{piError} You can still reserve below and pay at the visit.</p>}
            {stripeReady && !piError && !options && <p className="paycard__loading">Loading secure payment…</p>}
            {stripeReady && options && (
              <Elements stripe={stripePromise} options={options} key={clientSecret}>
                <PayForm draft={draft} onPaid={onPaid} setError={setError} busy={busy} setBusy={setBusy} />
              </Elements>
            )}

            <p className="paycard__secure"><ShieldIcon /> Payments are processed securely by Stripe. We never see your card number.</p>
            <p className="paycard__later">
              <button type="button" className="textlink" onClick={payLater} disabled={busy}>I’ll pay at the visit</button>
            </p>
          </section>

          <aside className="summary" aria-labelledby="sum-title">
            <h2 id="sum-title" className="summary__title">Your install</h2>
            <dl className="summary__list">
              <div><dt>Lighting</dt><dd>{draft.type}</dd></div>
              <div><dt>Package</dt><dd>{draft.pkg}</dd></div>
              <div><dt>Home</dt><dd>{draft.stories}</dd></div>
              <div><dt>Add-ons</dt><dd>{draft.addons.length ? draft.addons.join(', ') : 'None'}</dd></div>
              <div><dt>Date</dt><dd>{fmtLong(draft.date)}</dd></div>
              <div><dt>Window</dt><dd>{draft.time}</dd></div>
              <div><dt>Name</dt><dd>{draft.name}</dd></div>
              <div><dt>Address</dt><dd>{draft.address}</dd></div>
            </dl>
            <div className="summary__totals">
              <div><span>Starting estimate</span><b>{est.label}</b></div>
              <div><span>Deposit today</span><b>{BUSINESS.depositLabel}</b></div>
            </div>
            <p className="summary__fine">Final price is confirmed at the on-site visit. Your deposit is applied to the final invoice.</p>
            <Link to="/book" className="summary__edit">Edit booking</Link>
          </aside>
        </div>
      </div>
    </div>
  );
}
