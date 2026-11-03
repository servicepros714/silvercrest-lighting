import { Link } from 'react-router-dom';
import { Lantern } from '../components/Icons.jsx';

export default function NotFound() {
  return (
    <section className="section notfound">
      <div className="container notfound__inner">
        <Lantern className="notfound__lamp" />
        <p className="eyebrow">404</p>
        <h1 className="h2">This trail doesn’t go anywhere.</h1>
        <p className="shead__sub">The page you’re looking for moved or never existed.</p>
        <Link to="/" className="btn btn--gold">Back to the trailhead</Link>
      </div>
    </section>
  );
}
