import { useReveal } from '../../hooks/useReveal';
import './landing.css';

const STATS = [
  { value: '1 L', label: 'Total vessel volume' },
  { value: '400', label: 'Max agitation (rpm)' },
  { value: '12', label: 'Impeller blades' },
  { value: '5', label: 'Instrumented ports' },
];

const ROWS = [
  ['Vessel', 'Borosilicate 3.3, domed base, 1.7:1 aspect'],
  ['Headplate', '316L stainless, dual-flange, 12-bolt clamp ring'],
  ['Agitation', 'Top-drive shaft, 2 × six-blade Rushton turbine'],
  ['Instrumentation', 'pH, DO, temperature, sampling, harvest'],
  ['Telemetry', 'Streaming setpoints to the twin at frame rate'],
];

export default function Specs() {
  const ref = useReveal({ stagger: 80 });

  return (
    <section className="section specs" id="specs" ref={ref}>
      <div className="container">
        <p className="eyebrow reveal">Specifications</p>
        <h2 className="section__title reveal">Built to be believed.</h2>

        <div className="stats">
          {STATS.map((s) => (
            <div className="stat reveal" key={s.label}>
              <div className="stat__value">{s.value}</div>
              <div className="stat__label">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="spec-table reveal">
          {ROWS.map(([k, v]) => (
            <div className="spec-row" key={k}>
              <span className="spec-row__key">{k}</span>
              <span className="spec-row__val">{v}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
