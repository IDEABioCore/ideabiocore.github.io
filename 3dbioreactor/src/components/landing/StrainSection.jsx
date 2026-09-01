import StrainEngineering from '../dbtl/StrainEngineering';
import { useReveal } from '../../hooks/useReveal';
import './landing.css';

export default function StrainSection() {
  const ref = useReveal();

  return (
    <section className="section strain" id="strain" ref={ref}>
      <div className="container">
        <p className="eyebrow reveal">Strain engineering</p>
        <h2 className="section__title reveal">
          Design. Build.
          <br />
          Test. Learn.
        </h2>
        <p className="lede reveal strain__lede">
          Every strain that reaches the vessel has already been around this loop — a target gene
          excised and replaced, the construct circularised into a plasmid, transformed into a host,
          grown out, fermented and measured. The data closes the loop and the next design begins.
        </p>
      </div>

      <div className="strain__stage reveal">
        <StrainEngineering />
      </div>
    </section>
  );
}
