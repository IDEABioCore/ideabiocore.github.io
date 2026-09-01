import { useReveal } from '../../hooks/useReveal';
import './landing.css';

export default function Footer() {
  const ref = useReveal();

  return (
    <footer className="footer" ref={ref}>
      <div className="container">
        <h2 className="footer__cta reveal">
          Put a window
          <br />
          on your process.
        </h2>
        <div className="footer__actions reveal">
          <a className="btn" href="#twin">
            Open the twin
          </a>
          <span className="footer__note">Benchtop units ship with the twin included.</span>
        </div>

        <div className="footer__bar reveal">
          <span className="nav__brand">
            <span className="nav__mark" />
            VITRIA
          </span>
          <span>Concept project — built with React Three Fiber</span>
        </div>
      </div>
    </footer>
  );
}
