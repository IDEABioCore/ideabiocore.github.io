import './landing.css';

export default function Nav() {
  return (
    <nav className="nav">
      <a className="nav__brand" href="#top">
        <span className="nav__mark" />
        VITRIA
      </a>
      <div className="nav__links">
        <a href="#mission">Mission</a>
        <a href="#technology">Technology</a>
        <a href="#specs">Specs</a>
      </div>
      <a className="btn btn--sm" href="#twin">
        Launch twin
      </a>
    </nav>
  );
}
