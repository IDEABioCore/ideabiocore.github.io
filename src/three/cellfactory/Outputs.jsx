import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';

const PER_LANE = 13;
const EXIT = new THREE.Vector3(1.35, -0.05, 0.2); // where product leaves the membrane

// The five portfolio categories, fanned out to the right of the cell.
export const PRODUCTS = [
  { key: 'molecules', label: 'Molecules', pos: [3.5, 1.45, -0.35] },
  { key: 'materials', label: 'Materials', pos: [3.9, 0.62, 0.5] },
  { key: 'fuels', label: 'Fuels', pos: [4.05, -0.28, -0.2] },
  { key: 'therapeutics', label: 'Therapeutics', pos: [3.85, -1.15, 0.45] },
  { key: 'foods', label: 'Foods', pos: [3.4, -1.95, -0.3] },
];

const dummy = new THREE.Object3D();
const vTmp = new THREE.Vector3();
const vCtrl = new THREE.Vector3();

function ProductForm({ index, color }) {
  switch (index) {
    case 0: // molecules — a small cluster
      return (
        <group>
          <mesh>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
          </mesh>
          {[
            [0.19, 0.1, 0],
            [-0.17, 0.13, 0.08],
            [0.02, -0.2, -0.1],
          ].map((p, i) => (
            <mesh key={i} position={p}>
              <sphereGeometry args={[0.085, 14, 14]} />
              <meshStandardMaterial color={color} roughness={0.3} metalness={0.2} />
            </mesh>
          ))}
        </group>
      );
    case 1: // materials — a lattice cell
      return (
        <mesh rotation={[0.5, 0.6, 0]}>
          <boxGeometry args={[0.3, 0.3, 0.3]} />
          <meshStandardMaterial color={color} roughness={0.25} metalness={0.4} wireframe={false} />
        </mesh>
      );
    case 2: // fuels — a droplet
      return (
        <mesh rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.17, 0.42, 20]} />
          <meshStandardMaterial color={color} roughness={0.12} metalness={0.1} />
        </mesh>
      );
    case 3: // therapeutics — a capsule
      return (
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <capsuleGeometry args={[0.11, 0.24, 6, 16]} />
          <meshStandardMaterial color={color} roughness={0.3} metalness={0.15} />
        </mesh>
      );
    default: // foods — a grain
      return (
        <mesh rotation={[0.3, 0, 0.5]} scale={[1, 0.62, 0.62]}>
          <sphereGeometry args={[0.2, 20, 16]} />
          <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} />
        </mesh>
      );
  }
}

export default function Outputs({ accent, accent2, speed, showLabels = true }) {
  const streamRef = useRef();
  const markerRefs = useRef([]);

  const targets = useMemo(() => PRODUCTS.map((p) => new THREE.Vector3(...p.pos)), []);
  const offsets = useMemo(
    () =>
      Array.from({ length: PRODUCTS.length * PER_LANE }, (_, i) => ({
        lane: i % PRODUCTS.length,
        u: (Math.floor(i / PRODUCTS.length) + (i % PRODUCTS.length) * 0.13) / PER_LANE,
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;

    const stream = streamRef.current;
    if (stream) {
      for (let i = 0; i < offsets.length; i++) {
        const o = offsets[i];
        const target = targets[o.lane];
        const p = (o.u + t * 0.19) % 1;

        // quadratic bezier from the exit port out to the product, so the
        // streams visibly fan apart instead of running in straight lines
        vCtrl.set(EXIT.x + 1.1, EXIT.y + (target.y - EXIT.y) * 0.15, EXIT.z);
        const inv = 1 - p;
        vTmp.set(
          inv * inv * EXIT.x + 2 * inv * p * vCtrl.x + p * p * target.x,
          inv * inv * EXIT.y + 2 * inv * p * vCtrl.y + p * p * target.y,
          inv * inv * EXIT.z + 2 * inv * p * vCtrl.z + p * p * target.z
        );

        dummy.position.copy(vTmp);
        // fade in leaving the cell, fade out on arrival
        dummy.scale.setScalar(0.05 * Math.min(1, p * 5) * Math.min(1, (1 - p) * 6));
        dummy.updateMatrix();
        stream.setMatrixAt(i, dummy.matrix);
      }
      stream.instanceMatrix.needsUpdate = true;
    }

    // markers breathe, and pulse as their lane delivers
    markerRefs.current.forEach((m, i) => {
      if (!m) return;
      const pulse = Math.max(0, Math.sin((t * 0.19 - i * 0.13) * Math.PI * 2));
      m.scale.setScalar(1 + pulse * 0.12);
      m.rotation.y = t * 0.25 + i;
    });
  });

  return (
    <group>
      <instancedMesh ref={streamRef} args={[null, null, offsets.length]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={accent2}
          emissiveIntensity={0.8}
          roughness={0.2}
        />
      </instancedMesh>

      {PRODUCTS.map((p, i) => (
        <group key={p.key} position={p.pos}>
          <group ref={(el) => (markerRefs.current[i] = el)}>
            <ProductForm index={i} color={i % 2 === 0 ? accent : accent2} />
          </group>
          {showLabels && (
            <Html
              position={[0.42, 0, 0]}
              center={false}
              distanceFactor={9}
              zIndexRange={[10, 0]}
              style={{ pointerEvents: 'none', userSelect: 'none' }}
            >
              <span className="cellfactory__label">{p.label}</span>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
