import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const LOOP_PARTICLES = 54;
const INTAKE_PARTICLES = 26;
const MODULE_COUNT = 5;

const dummy = new THREE.Object3D();
const vTmp = new THREE.Vector3();

// Entry point on the membrane where substrate is taken up.
export const INTAKE_POINT = new THREE.Vector3(-1.42, 0.12, 0.35);

/** The engineered pathway: a closed circuit routed inside the cell. */
function usePathway() {
  return useMemo(() => {
    const pts = [
      new THREE.Vector3(-1.0, 0.1, 0.3),
      new THREE.Vector3(-0.45, 0.62, -0.42),
      new THREE.Vector3(0.35, 0.5, -0.6),
      new THREE.Vector3(0.92, -0.02, -0.12),
      new THREE.Vector3(0.62, -0.55, 0.5),
      new THREE.Vector3(-0.3, -0.62, 0.55),
    ];
    const curve = new THREE.CatmullRomCurve3(pts, true, 'catmullrom', 0.5);
    const modules = Array.from({ length: MODULE_COUNT }, (_, i) => {
      const u = (i + 0.5) / MODULE_COUNT;
      return { u, pos: curve.getPointAt(u) };
    });
    return { curve, modules };
  }, []);
}

export default function Cell({ accent, accent2, membrane, speed }) {
  const { curve, modules } = usePathway();
  const loopRef = useRef();
  const intakeRef = useRef();
  const moduleRefs = useRef([]);
  const groupRef = useRef();

  // Deterministic per-particle offsets.
  const loopOffsets = useMemo(
    () => Array.from({ length: LOOP_PARTICLES }, (_, i) => i / LOOP_PARTICLES),
    []
  );
  const intakeOffsets = useMemo(
    () =>
      Array.from({ length: INTAKE_PARTICLES }, (_, i) => ({
        u: i / INTAKE_PARTICLES,
        spread: new THREE.Vector3(0, Math.sin(i * 2.4) * 0.28, Math.cos(i * 1.7) * 0.28),
      })),
    []
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;

    if (groupRef.current) groupRef.current.rotation.y = Math.sin(t * 0.12) * 0.22;

    // ---- substrate flowing in from outside the membrane ----
    const intake = intakeRef.current;
    if (intake) {
      for (let i = 0; i < INTAKE_PARTICLES; i++) {
        const o = intakeOffsets[i];
        const p = (o.u + t * 0.16) % 1;
        // travel from far left into the intake point, fading as it is absorbed
        vTmp.set(-4.4 + p * (INTAKE_POINT.x + 4.4), 0, 0).add(o.spread.clone().multiplyScalar(1 - p));
        vTmp.y += INTAKE_POINT.y * p;
        vTmp.z += INTAKE_POINT.z * p;
        const s = 0.05 * Math.min(1, (1 - p) * 3.2);
        dummy.position.copy(vTmp);
        dummy.scale.setScalar(s);
        dummy.updateMatrix();
        intake.setMatrixAt(i, dummy.matrix);
      }
      intake.instanceMatrix.needsUpdate = true;
    }

    // ---- metabolites circulating through the pathway ----
    const loop = loopRef.current;
    if (loop) {
      for (let i = 0; i < LOOP_PARTICLES; i++) {
        const u = (loopOffsets[i] + t * 0.055) % 1;
        curve.getPointAt(u, vTmp);
        dummy.position.copy(vTmp);
        dummy.scale.setScalar(0.052);
        dummy.updateMatrix();
        loop.setMatrixAt(i, dummy.matrix);
      }
      loop.instanceMatrix.needsUpdate = true;
    }

    // ---- modules light up as the wave of flux reaches them ----
    moduleRefs.current.forEach((m, i) => {
      if (!m) return;
      const phase = Math.sin((t * 0.35 - modules[i].u) * Math.PI * 2);
      const lit = Math.max(0, phase);
      m.material.emissiveIntensity = 0.25 + lit * 2.4;
      const s = 1 + lit * 0.14;
      m.scale.setScalar(s);
    });
  });

  return (
    <group ref={groupRef}>
      {/* membrane */}
      <mesh scale={[1, 0.87, 0.95]}>
        <sphereGeometry args={[1.55, 64, 48]} />
        <meshPhysicalMaterial
          color={membrane}
          transmission={0.94}
          thickness={0.9}
          roughness={0.16}
          ior={1.35}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.25}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* pathway conduit */}
      <mesh>
        <tubeGeometry args={[curve, 200, 0.032, 10, true]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.5}
          roughness={0.4}
          metalness={0.1}
        />
      </mesh>

      {/* engineered enzyme modules */}
      {modules.map((m, i) => (
        <mesh
          key={i}
          ref={(el) => (moduleRefs.current[i] = el)}
          position={m.pos}
          rotation={[i * 0.7, i * 1.1, 0]}
        >
          <octahedronGeometry args={[0.17, 0]} />
          <meshStandardMaterial
            color={accent2}
            emissive={accent2}
            emissiveIntensity={0.4}
            roughness={0.25}
            metalness={0.3}
          />
        </mesh>
      ))}

      {/* metabolites on the circuit */}
      <instancedMesh ref={loopRef} args={[null, null, LOOP_PARTICLES]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive={accent2}
          emissiveIntensity={0.9}
          roughness={0.2}
        />
      </instancedMesh>

      {/* substrate entering (CO2 / feedstock) */}
      <instancedMesh ref={intakeRef} args={[null, null, INTAKE_PARTICLES]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshStandardMaterial color="#9fb4c8" emissive="#4a6b86" emissiveIntensity={0.5} roughness={0.4} />
      </instancedMesh>
    </group>
  );
}
