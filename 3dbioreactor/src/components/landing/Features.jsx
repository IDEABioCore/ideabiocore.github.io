import { useReveal } from '../../hooks/useReveal';
import './landing.css';

const FEATURES = [
  {
    n: '01',
    title: 'Twin Rushton agitation',
    body: 'Two six-blade turbines on a single shaft, mirrored in the twin at true RPM. Shear profile and mixing time update as you dial the drive from 0 to 400 rpm.',
  },
  {
    n: '02',
    title: 'Sparged aeration',
    body: 'Gas flow is rendered as it behaves: bubble density and rise velocity scale with the sparger setpoint, so oxygen transfer stops being an abstraction.',
  },
  {
    n: '03',
    title: 'Working volume',
    body: 'From 50 mL to a full 1 L charge. The twin tracks the liquid line against the vessel graduations, and flags when the upper impeller breaks the surface.',
  },
  {
    n: '04',
    title: 'Live growth modelling',
    body: 'A logistic culture model drives turbidity and suspended biomass through lag, exponential and stationary phase — the whole run, visible in one glance.',
  },
];

export default function Features() {
  const ref = useReveal({ stagger: 110 });

  return (
    <section className="section features" id="technology" ref={ref}>
      <div className="container">
        <p className="eyebrow reveal">The technology</p>
        <h2 className="section__title reveal">
          Four control axes.
          <br />
          One living picture.
        </h2>

        <div className="features__grid">
          {FEATURES.map((f) => (
            <article className="card reveal" key={f.n}>
              <span className="card__n">{f.n}</span>
              <h3 className="card__title">{f.title}</h3>
              <p className="card__body">{f.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
