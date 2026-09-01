import { useRef } from 'react';
import BioreactorCanvas from '../BioreactorCanvas';
import './landing.css';

export default function Hero() {
  // The hero reactor runs its own clock, always growing, never paused.
  const heroGrowth = useRef({ time: 55, biomass: 0.35 }).current;

  return (
    <header className="hero" id="top">
      <div className="hero__glow hero__glow--a" />
      <div className="hero__glow hero__glow--b" />

      <div className="hero__canvas">
        <BioreactorCanvas
          volume={0.68}
          rpm={130}
          aeration={0.55}
          growthState={heroGrowth}
          running
          interactive={false}
          autoRotate
          cameraPosition={[0.46, 0.36, 0.78]}
        />
      </div>

      <div className="hero__content container">
        <p className="eyebrow reveal is-visible">Precision fermentation systems</p>
        <h1 className="hero__title">
          <span className="reveal is-visible">See inside</span>
          <span className="reveal is-visible hero__title--accent">the culture.</span>
        </h1>
        <p className="hero__lede reveal is-visible">
          VITRIA pairs a 1&nbsp;L benchtop bioreactor with a live digital twin — every impeller
          rotation, every bubble, every gram of biomass, rendered in real time.
        </p>
        <div className="hero__actions reveal is-visible">
          <a className="btn" href="#twin">
            Explore the twin
          </a>
          <a className="btn btn--ghost" href="#mission">
            Why it matters
          </a>
        </div>
      </div>

      <div className="hero__scroll">
        <span>Scroll</span>
        <div className="hero__scroll-line" />
      </div>
    </header>
  );
}
