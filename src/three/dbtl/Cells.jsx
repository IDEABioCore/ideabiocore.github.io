import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { cycleT, ease } from './timeline';

const COUNT = 14;
const T_FADE_OUT = [0.75, 0.81];
const GOLDEN = Math.PI * (3 - Math.sqrt(5));

const dummy = new THREE.Object3D();

export default function Cells() {
  const meshRef = useRef();

  // Deterministic division tree: cell 0 is the transformant, each generation
  // doubles and spreads a little further out.
  const cells = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => {
        const gen = Math.floor(Math.log2(i + 1));
        const a = i * GOLDEN;
        const rad = gen === 0 ? 0 : 0.34 + gen * 0.3;
        return {
          birth: 0.585 + gen * 0.035,
          x: Math.cos(a) * rad,
          y: Math.sin(a * 1.7) * 0.26,
          z: Math.sin(a) * rad,
          rx: Math.sin(a) * 0.7,
          ry: a,
          rz: Math.cos(a * 0.7) * 0.5,
          phase: i * 0.83,
        };
      }),
    []
  );

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = cycleT(state.clock.elapsedTime);
    const clock = state.clock.elapsedTime;
    const fade = 1 - ease(t, T_FADE_OUT[0], T_FADE_OUT[1]);

    let visible = 0;
    for (let i = 0; i < COUNT; i++) {
      const c = cells[i];
      const born = ease(t, c.birth, c.birth + 0.028);
      const s = born * fade;
      if (s > 0.001) visible = i + 1;

      // Newly divided cells stretch then settle — reads as binary fission.
      const stretch = 1 + (1 - born) * 0.9;
      const drift = Math.sin(clock * 0.7 + c.phase) * 0.035;

      dummy.position.set(c.x + drift, c.y + Math.cos(clock * 0.5 + c.phase) * 0.03, c.z);
      dummy.rotation.set(c.rx, c.ry + clock * 0.08, c.rz);
      dummy.scale.set(s, s * stretch, s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.count = visible;
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[null, null, COUNT]} frustumCulled={false}>
      <capsuleGeometry args={[0.17, 0.4, 6, 16]} />
      <meshStandardMaterial
        color="#c9a7f5"
        roughness={0.3}
        metalness={0.05}
        emissive="#7c3aed"
        emissiveIntensity={0.55}
        transparent
        opacity={0.92}
      />
    </instancedMesh>
  );
}
