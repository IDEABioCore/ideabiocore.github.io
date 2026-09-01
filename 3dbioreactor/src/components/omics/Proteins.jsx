import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import './labels.css';

// Alpha helices, the secondary structure everyone recognises as "protein".
const TURNS = 3.4;
const HELIX_R = 0.17;
const HELIX_RISE = 0.72;

const MOTIFS = [
  { pos: [2.55, 1.05, 0.6], rot: [0.5, 0.4, 0.7], scale: 1.05, spin: 0.28, label: 'α-helix' },
  { pos: [-2.7, -0.5, 0.9], rot: [-0.4, 1.1, -0.5], scale: 0.9, spin: -0.22, label: 'Enzyme fold' },
  { pos: [0.6, -2.1, -1.3], rot: [1.0, 0.2, 0.3], scale: 0.85, spin: 0.19 },
  { pos: [-1.1, 2.15, -1.2], rot: [0.2, -0.7, 1.2], scale: 0.78, spin: -0.3, label: 'β-strand' },
];

function useHelixGeometry() {
  return useMemo(() => {
    const pts = [];
    const steps = 90;
    for (let i = 0; i <= steps; i++) {
      const u = i / steps;
      const a = u * Math.PI * 2 * TURNS;
      pts.push(new THREE.Vector3(Math.cos(a) * HELIX_R, (u - 0.5) * HELIX_RISE, Math.sin(a) * HELIX_R));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 120, 0.045, 8, false);
  }, []);
}

/** A short beta strand — a flattened, slightly twisted ribbon. */
function useStrandGeometry() {
  return useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const u = i / 20;
      pts.push(new THREE.Vector3(Math.sin(u * Math.PI * 2) * 0.06, (u - 0.5) * 0.62, u * 0.1));
    }
    const curve = new THREE.CatmullRomCurve3(pts);
    return new THREE.TubeGeometry(curve, 60, 0.038, 6, false);
  }, []);
}

export default function Proteins({ accent, accent2, speed, showLabels = true }) {
  const helix = useHelixGeometry();
  const strand = useStrandGeometry();
  const refs = useRef([]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;
    refs.current.forEach((g, i) => {
      if (!g) return;
      const m = MOTIFS[i];
      g.rotation.y = m.rot[1] + t * m.spin;
      g.position.y = m.pos[1] + Math.sin(t * 0.5 + i * 1.7) * 0.12;
    });
  });

  return (
    <group>
      {MOTIFS.map((m, i) => (
        <group
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={m.pos}
          rotation={m.rot}
          scale={m.scale}
        >
          {/* helix, flattened slightly so it reads as a ribbon */}
          <mesh geometry={helix} scale={[1, 1, 0.62]}>
            <meshStandardMaterial
              color={i % 2 === 0 ? accent : accent2}
              emissive={i % 2 === 0 ? accent : accent2}
              emissiveIntensity={0.35}
              roughness={0.3}
              metalness={0.25}
            />
          </mesh>
          {/* a paired strand alongside it */}
          <mesh geometry={strand} position={[0.3, 0, -0.12]} rotation={[0, 0, 0.25]}>
            <meshStandardMaterial
              color={accent2}
              emissive={accent2}
              emissiveIntensity={0.25}
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
          {showLabels && m.label && (
            <Html position={[0.35, 0.3, 0]} zIndexRange={[9, 0]} style={{ pointerEvents: 'none' }}>
              <span className="omics-label">{m.label}</span>
            </Html>
          )}
        </group>
      ))}
    </group>
  );
}
