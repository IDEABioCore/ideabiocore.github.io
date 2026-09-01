import { useRef } from 'react';
import { useControls, button, monitor } from 'leva';
import BioreactorCanvas from '../BioreactorCanvas';
import { useReveal } from '../../hooks/useReveal';
import './landing.css';

export default function LiveDemo() {
  const ref = useReveal();

  const { volume, rpm, aeration } = useControls('Process', {
    volume: { value: 0.65, min: 0.05, max: 1.0, step: 0.01, label: 'Volume' },
    rpm: { value: 150, min: 0, max: 400, step: 5, label: 'RPM' },
    aeration: { value: 0.5, min: 0, max: 1.0, step: 0.01, label: 'Aeration' },
  });

  // Shared mutable object (not React state) so the growth clock, updated every
  // frame inside the Canvas, can be read by the leva monitor without
  // triggering a React re-render each frame.
  const growthState = useRef({ time: 0, biomass: 0 }).current;

  const { running } = useControls('Culture', () => ({
    running: { value: true, label: 'Running' },
    biomass: monitor(() => growthState.biomass, { graph: true, interval: 150 }),
    Reset: button(() => {
      growthState.time = 0;
    }),
  }));

  return (
    <section className="section twin" id="twin" ref={ref}>
      <div className="container">
        <p className="eyebrow reveal">Live digital twin</p>
        <h2 className="section__title reveal">
          Drag it. Drive it.
          <br />
          Watch it grow.
        </h2>
        <p className="lede reveal twin__lede">
          This is the real twin, not a video. Drag to orbit the vessel, then use the panel to set
          working volume, agitation and gas flow. Leave the culture running and turbidity will
          climb through its growth curve over the next few minutes.
        </p>
      </div>

      <div className="twin__stage reveal">
        <div className="twin__canvas">
          <BioreactorCanvas
            volume={volume}
            rpm={rpm}
            aeration={aeration}
            growthState={growthState}
            running={running}
            interactive
            autoRotate={false}
          />
        </div>
        <div className="twin__hint">Drag to orbit</div>
      </div>
    </section>
  );
}
