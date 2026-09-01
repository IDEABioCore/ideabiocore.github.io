import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { cycleT, ease } from './timeline';

const COUNT = 44;
const LINK_DIST = 1.5;
const T_RISE = [0.82, 0.9];
const T_LINKS = [0.86, 0.93];
const T_OUT = [0.94, 0.995];

const dummy = new THREE.Object3D();
const vTmp = new THREE.Vector3();

export default function DataNetwork() {
  const pointsRef = useRef();
  const linesRef = useRef();

  // Target lattice: a fibonacci shell, slightly flattened into a "model" cloud.
  const { targets, starts, links, linePositions } = useMemo(() => {
    const targets = [];
    const starts = [];
    const golden = Math.PI * (3 - Math.sqrt(5));
    for (let i = 0; i < COUNT; i++) {
      const y = 1 - (i / (COUNT - 1)) * 2;
      const r = Math.sqrt(Math.max(0, 1 - y * y));
      const a = i * golden;
      targets.push(new THREE.Vector3(Math.cos(a) * r * 2.3, y * 1.35 + 0.9, Math.sin(a) * r * 2.3));
      // rises out of the reactor mouth
      const sa = (i / COUNT) * Math.PI * 2;
      starts.push(new THREE.Vector3(Math.cos(sa) * 0.35, -2.2, Math.sin(sa) * 0.35));
    }

    const links = [];
    for (let i = 0; i < COUNT; i++) {
      for (let j = i + 1; j < COUNT; j++) {
        if (targets[i].distanceTo(targets[j]) < LINK_DIST) links.push(i, j);
      }
    }
    return {
      targets,
      starts,
      links,
      linePositions: new Float32Array((links.length / 2) * 6),
    };
  }, []);

  useFrame((state) => {
    const points = pointsRef.current;
    const lines = linesRef.current;
    if (!points || !lines) return;

    const t = cycleT(state.clock.elapsedTime);
    const clock = state.clock.elapsedTime;
    const out = 1 - ease(t, T_OUT[0], T_OUT[1]);
    const linkOpacity = ease(t, T_LINKS[0], T_LINKS[1]) * out;

    const live = [];
    for (let i = 0; i < COUNT; i++) {
      // staggered rise so the data "streams" upward out of the vessel
      const s0 = T_RISE[0] + (i / COUNT) * 0.045;
      const p = ease(t, s0, s0 + 0.07);
      const scale = p * out;

      vTmp.copy(starts[i]).lerp(targets[i], p);
      // gentle arc + drift once settled
      vTmp.y += Math.sin(p * Math.PI) * 0.5;
      vTmp.x += Math.sin(clock * 0.6 + i) * 0.02 * p;
      vTmp.z += Math.cos(clock * 0.5 + i) * 0.02 * p;
      live.push(vTmp.clone());

      dummy.position.copy(vTmp);
      dummy.scale.setScalar(0.055 * scale);
      dummy.updateMatrix();
      points.setMatrixAt(i, dummy.matrix);
    }
    points.instanceMatrix.needsUpdate = true;

    // rebuild the link segments from the live point positions
    const arr = lines.geometry.attributes.position.array;
    for (let k = 0; k < links.length; k += 2) {
      const a = live[links[k]];
      const b = live[links[k + 1]];
      const o = (k / 2) * 6;
      arr[o] = a.x;
      arr[o + 1] = a.y;
      arr[o + 2] = a.z;
      arr[o + 3] = b.x;
      arr[o + 4] = b.y;
      arr[o + 5] = b.z;
    }
    lines.geometry.attributes.position.needsUpdate = true;
    lines.material.opacity = linkOpacity * 0.45;
    lines.visible = linkOpacity > 0.01;
  });

  return (
    <group>
      <instancedMesh ref={pointsRef} args={[null, null, COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial color="#d8b4fe" toneMapped={false} />
      </instancedMesh>

      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={linePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#a855f7" transparent opacity={0} toneMapped={false} />
      </lineSegments>
    </group>
  );
}
