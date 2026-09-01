import { useReveal } from '../../hooks/useReveal';
import './landing.css';

const MARQUEE = [
  'Precision fermentation',
  'Cultivated proteins',
  'Enzyme production',
  'Strain development',
  'Bioprocess telemetry',
];

export default function Mission() {
  const ref = useReveal();

  return (
    <section className="section mission" id="mission" ref={ref}>
      <div className="container">
        <p className="eyebrow reveal">The mission</p>
        <h2 className="mission__statement reveal">
          Fermentation still runs <em>blind</em>. Operators trust a probe reading and a cloudy
          window. We think you should <em>see</em> the process.
        </h2>
        <div className="mission__grid">
          <p className="lede reveal">
            Every batch that fails late costs weeks of feedstock, labour and cleanroom time. The
            data exists — dissolved oxygen, agitation, biomass — but it lives in spreadsheets and
            trend lines that nobody can picture.
          </p>
          <p className="lede reveal">
            VITRIA renders the vessel itself. The twin reads the same telemetry your PLC does and
            turns it into something a scientist can read at a glance, from the bench or from
            anywhere.
          </p>
        </div>
      </div>

      <div className="marquee reveal">
        <div className="marquee__track">
          {[...MARQUEE, ...MARQUEE].map((item, i) => (
            <span key={i}>
              {item} <i>✦</i>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
