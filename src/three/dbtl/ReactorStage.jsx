import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import Vessel from '../bioreactor/Vessel';
import Internals from '../bioreactor/Internals';
import Fluid from '../bioreactor/Fluid';
import { cycleT, ease } from './timeline';

const SCALE = 13; // the reactor is modelled in metres; this scene works in ~units of 1
const T_IN = [0.69, 0.755];
const T_OUT = [0.87, 0.93];
// Sweeps the logistic growth model in Fluid across a full run during the act.
const T_GROWTH = [0.72, 0.88];
const GROWTH_SECONDS = 150;

export default function ReactorStage() {
  const groupRef = useRef();
  // Fluid derives biomass from growthState.time, so we scrub that clock
  // directly instead of letting it run in real time.
  const growthState = useRef({ time: 0, biomass: 0 }).current;

  useFrame((state) => {
    const t = cycleT(state.clock.elapsedTime);
    growthState.time = ease(t, T_GROWTH[0], T_GROWTH[1]) * GROWTH_SECONDS;

    const g = groupRef.current;
    if (!g) return;
    const vis = ease(t, T_IN[0], T_IN[1]) * (1 - ease(t, T_OUT[0], T_OUT[1]));
    g.visible = vis > 0.002;
    g.scale.setScalar(SCALE * vis);
    g.rotation.y = state.clock.elapsedTime * 0.16;
  });

  return (
    <group ref={groupRef} position={[0, -2.6, 0]} scale={0.001}>
      <Vessel />
      <Internals rpm={190} />
      <Fluid volume={0.66} aeration={0.6} growthState={growthState} running={false} />
    </group>
  );
}
