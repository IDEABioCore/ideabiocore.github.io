import { useRef } from 'react';
import BioreactorCanvas from './BioreactorCanvas';

// The hero's live digital twin: a 1L benchtop bioreactor mid-batch, always
// growing, auto-rotating until a visitor drags it. This is the only wiring
// this component owns — see BioreactorCanvas for the actual 3D scene.
export default function BioreactorScene() {
  // useRef (not useState): growth is read/written every frame inside the
  // Three.js render loop, so it must not trigger a React re-render.
  const growthState = useRef({ time: 55, biomass: 0.35 }).current;

  return (
    <BioreactorCanvas
      volume={0.68}
      rpm={130}
      aeration={0.55}
      growthState={growthState}
      running
      interactive
      autoRotate
      cameraPosition={[0.34, 0.26, 0.56]}
    />
  );
}
