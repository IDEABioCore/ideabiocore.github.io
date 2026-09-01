import { Suspense, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment } from '@react-three/drei';
import Dna from './Dna';
import Cells from './Cells';
import ReactorStage from './ReactorStage';
import DataNetwork from './DataNetwork';
import { ACTS, cycleT, actIndexAt, smoothstep } from './timeline';
import './dbtl.css';

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
  const current = ACTS[act];

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
        <pointLight position={[-3.2, 1.6, 2.4]} intensity={26} distance={16} color="#a855f7" />
        <pointLight position={[3.4, -1.4, 2.0]} intensity={20} distance={16} color="#d946ef" />
        <pointLight position={[0, 2.6, -4]} intensity={14} distance={20} color="#4c1d95" />

        <Suspense fallback={null}>
          <Environment preset="studio" environmentIntensity={0.35} />
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
        <div className="dbtl__caption" key={current.key}>
          {current.caption}
        </div>
        <div className="dbtl__progress">
          <span ref={progressRef} />
        </div>
      </div>
    </div>
  );
}
