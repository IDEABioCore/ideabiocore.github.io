import { Suspense, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import Dna from './Dna';
import Cells from './Cells';
import ReactorStage from './ReactorStage';
import DataNetwork from './DataNetwork';
import { ACTS, cycleT, actIndexAt, smoothstep } from './timeline';
import './dbtl.css';

// IDEA Bio's --accent / --accent-press (see src/styles/global.css:20-21).
// Three.js scenes run outside CSS, so the tokens are mirrored here as plain
// hex — keep these two in sync if the palette in global.css ever changes.
const ACCENT = '#6D4AFF';
const ACCENT_PRESS = '#4A2FE0';

// Camera keyframes. The last must equal the first so the loop is seamless.
const CAM = [
  // Act 1 holds a wide framing so the whole helix stays in shot; the push-in
  // to the cut site only begins once Build starts (t = 0.22).
  { t: 0.0, pos: [0.5, 0.15, 11.2], look: [0, 0, 0] },
  { t: 0.24, pos: [1.2, 0.4, 9.6], look: [0, 0.1, 0] },
  { t: 0.35, pos: [2.7, 0.8, 4.8], look: [0.3, 0.4, 0] },
  { t: 0.5, pos: [0.0, 4.6, 4.9], look: [0, 0, 0] },
  { t: 0.62, pos: [0.0, 1.4, 5.2], look: [0, -0.2, 0] },
  { t: 0.72, pos: [0.0, 1.0, 6.6], look: [0, 0.1, 0] },
  { t: 0.82, pos: [0.2, 1.2, 8.4], look: [0, 0.3, 0] },
  { t: 0.92, pos: [0.0, 2.2, 8.6], look: [0, 0.8, 0] },
  { t: 1.0, pos: [0.5, 0.15, 11.2], look: [0, 0, 0] },
];

const vPos = new THREE.Vector3();
const vLook = new THREE.Vector3();
const vA = new THREE.Vector3();
const vB = new THREE.Vector3();

function Rig({ onAct, progressRef }) {
  const actRef = useRef(-1);

  useFrame((state) => {
    const t = cycleT(state.clock.elapsedTime);

    let i = 0;
    while (i < CAM.length - 2 && t >= CAM[i + 1].t) i++;
    const a = CAM[i];
    const b = CAM[i + 1];
    const k = smoothstep((t - a.t) / (b.t - a.t));

    vA.fromArray(a.pos);
    vB.fromArray(b.pos);
    vPos.lerpVectors(vA, vB, k);
    vA.fromArray(a.look);
    vB.fromArray(b.look);
    vLook.lerpVectors(vA, vB, k);

    state.camera.position.copy(vPos);
    state.camera.lookAt(vLook);

    // Drive the progress bar straight through the DOM — no re-render per frame.
    if (progressRef.current) progressRef.current.style.width = `${t * 100}%`;

    const idx = actIndexAt(t);
    if (idx !== actRef.current) {
      actRef.current = idx;
      onAct(idx);
    }
  });

  return null;
}

export default function StrainEngineering() {
  const [act, setAct] = useState(0);
  const progressRef = useRef(null);

  return (
    <div className="dbtl">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0.4, 0.5, 7.4], fov: 42, near: 0.1, far: 60 }}
        gl={{ alpha: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 6, 4]} intensity={1.1} />
        <pointLight position={[-3.2, 1.6, 2.4]} intensity={26} distance={16} color={ACCENT} />
        <pointLight position={[3.4, -1.4, 2.0]} intensity={20} distance={16} color={ACCENT_PRESS} />
        <pointLight position={[0, 2.6, -4]} intensity={14} distance={20} color={ACCENT_PRESS} />

        <Suspense fallback={null}>
          {/* Procedural environment — gives the DNA/cell materials real
              reflections without fetching an HDRI, so the embed stays
              dependency-free (no external CDN; same fix as BioreactorCanvas). */}
          <Environment resolution={256} environmentIntensity={0.35}>
            <Lightformer form="rect" intensity={2} position={[0, 4, 3]} scale={8} color="#ffffff" />
            <Lightformer form="rect" intensity={1.1} position={[-5, 1, 2]} scale={6} color={ACCENT} />
            <Lightformer form="circle" intensity={1.2} position={[4, -1, 3]} scale={5} color={ACCENT_PRESS} />
          </Environment>
          <Dna />
          <Cells />
          <ReactorStage />
          <DataNetwork />
        </Suspense>

        <Rig onAct={setAct} progressRef={progressRef} />
      </Canvas>

      <div className="dbtl__hud">
        <div className="dbtl__acts">
          {ACTS.map((a, i) => (
            <span key={a.key} className={`dbtl__act ${i === act ? 'is-active' : ''}`}>
              <i>{a.n}</i>
              {a.label}
            </span>
          ))}
        </div>
        <div className="dbtl__progress">
          <span ref={progressRef} />
        </div>
      </div>
    </div>
  );
}
