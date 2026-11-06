/* Quote request form, submitted to Netlify Forms (form name "quote").
   A matching hidden static copy lives in index.html so Netlify detects the form at deploy time —
   keep the field names in both places in sync. Submissions appear under Netlify → Forms.
   Sending a request does NOT create a booking; the copy says so. */
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ADDONS, LIGHT_TYPES, PACKAGES, STORY_OPTIONS } from '../data/business.js';
import { useDraft } from '../lib/draft.jsx';
import { CheckIcon } from './Icons.jsx';

const FORM_NAME = 'quote';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const encode = (data) => new URLSearchParams(data).toString();

function validate(v) {
  if (!v.name.trim()) return { field: 'name', msg: 'Please enter your name.' };
  if (!EMAIL_RE.test(v.email.trim())) return { field: 'email', msg: 'Please enter a valid email address so we can reply.' };
  if (v.phone.trim() && v.phone.replace(/\D/g, '').length < 10) return { field: 'phone', msg: 'Please enter a 10-digit phone number, or leave it blank.' };
  if (!v.location.trim()) return { field: 'location', msg: 'Please tell us the city or ZIP code of the home.' };
  return null;
}

export default function QuoteForm() {
  const { draft, update } = useDraft();
  const [v, setV] = useState({
    name: '', email: '', phone: '', location: '',
    lighting: '', package: '', stories: '', message: '', 'bot-field': '',
  });
  const [addons, setAddons] = useState(() => (Array.isArray(draft.addons) ? draft.addons : []));
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error
  const [err, setErr] = useState(null);
  const refs = useRef({});
  const doneRef = useRef(null);

  const set = (k) => (e) => { setV((s) => ({ ...s, [k]: e.target.value })); if (err && err.field === k) setErr(null); };
  const toggle = (id) => setAddons((a) => (a.includes(id) ? a.filter((x) => x !== id) : [...a, id]));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (status === 'sending') return;
    const problem = validate(v);
    if (problem) {
      setErr(problem);
      const el = refs.current[problem.field];
      if (el) el.focus();
      return;
    }
    setErr(null);
    setStatus('sending');
    try {
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': FORM_NAME, ...v, addons: addons.join(', ') }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus('sent');
      update({ addons: [] });
      setTimeout(() => doneRef.current && doneRef.current.focus(), 30);
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div className="qform qform--done" role="status">
        <span className="qform__check" aria-hidden="true"><CheckIcon /></span>
        <h3 className="h3" tabIndex={-1} ref={doneRef}>Thanks{v.name.trim() ? `, ${v.name.trim().split(' ')[0]}` : ''}. Your request was sent.</h3>
        <p>
          This is a quote request, not a booking. Nothing has been scheduled or charged. We’ll contact you at{' '}
          <b>{v.email.trim()}</b>{v.phone.trim() ? <> or <b>{v.phone.trim()}</b></> : null} to talk through your home and set up a design visit.
        </p>
      </div>
    );
  }

  const field = (k, label, props = {}) => (
    <div className={`field ${props.wide ? 'field--wide' : ''}`}>
      <label htmlFor={`q-${k}`}>{label}{props.optional && <span className="field__opt"> (optional)</span>}</label>
      <input
        id={`q-${k}`}
        name={k}
        ref={(el) => { refs.current[k] = el; }}
        type={props.type || 'text'}
        autoComplete={props.auto}
        inputMode={props.inputMode}
        placeholder={props.place}
        value={v[k]}
        onChange={set(k)}
        aria-invalid={err && err.field === k ? 'true' : undefined}
        aria-describedby={err && err.field === k ? 'q-error' : undefined}
      />
    </div>
  );

  const select = (k, label, options) => (
    <div className="field">
      <label htmlFor={`q-${k}`}>{label}</label>
      <select id={`q-${k}`} name={k} value={v[k]} onChange={set(k)}>
        <option value="">Not sure yet</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );

  return (
    <form className="qform" name={FORM_NAME} method="POST" data-netlify="true" netlify-honeypot="bot-field" onSubmit={onSubmit} noValidate>
      <input type="hidden" name="form-name" value={FORM_NAME} />
      <p className="qform__hp" aria-hidden="true">
        <label>Leave this empty <input name="bot-field" tabIndex={-1} autoComplete="off" value={v['bot-field']} onChange={set('bot-field')} /></label>
      </p>

      <div className="form">
        {field('name', 'Full name', { auto: 'name', place: 'First and last name' })}
        {field('email', 'Email', { type: 'email', auto: 'email', place: 'you@example.com' })}
        {field('phone', 'Phone', { type: 'tel', auto: 'tel', inputMode: 'tel', place: '10-digit number', optional: true })}
        {field('location', 'City or ZIP of the home', { auto: 'postal-code', place: 'e.g. Anaheim or 92807' })}
        {select('lighting', 'Lighting type', LIGHT_TYPES.map((t) => ({ value: t.name, label: t.name })))}
        {select('package', 'Package', PACKAGES.map((p) => ({ value: p.name, label: `${p.name} — ${p.coverage.toLowerCase()}` })))}
        {select('stories', 'Home height', STORY_OPTIONS.map((s) => ({ value: s.name, label: s.name })))}
      </div>

      <fieldset className="qform__addons">
        <legend>Add-ons you’re interested in <span className="field__opt">(optional)</span></legend>
        <div className="qform__chips">
          {ADDONS.map((a) => {
            const on = addons.includes(a.id);
            return (
              <label key={a.id} className={`chip ${on ? 'is-on' : ''}`}>
                <input type="checkbox" className="choice__input" checked={on} onChange={() => toggle(a.id)} />
                <span className="chip__box" aria-hidden="true">{on && <CheckIcon />}</span>
                {a.name}
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="field field--wide">
        <label htmlFor="q-message">Anything else we should know? <span className="field__opt">(optional)</span></label>
        <textarea id="q-message" name="message" rows={4} value={v.message} onChange={set('message')}
          placeholder="Roofline details, colors you like, dates you’re hoping for…" />
      </div>

      {err && <p id="q-error" className="qform__err" role="alert">{err.msg}</p>}
      {status === 'error' && (
        <p className="qform__err" role="alert">Your request couldn’t be sent. Please check your connection and try again.</p>
      )}

      <div className="qform__foot">
        <p className="qform__note">
          Sending this form doesn’t book or charge anything. We use your details only to reply about your quote —
          see our <Link to="/privacy-policy">Privacy Policy</Link>.
        </p>
        <button type="submit" className="btn btn--gold btn--lg" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send quote request'}
        </button>
      </div>
    </form>
  );
}
