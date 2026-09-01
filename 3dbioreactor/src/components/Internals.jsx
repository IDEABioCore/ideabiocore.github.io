import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { PROBE_ROD_COUNT, STEEL, STEEL_KNURLED, STEEL_DARK } from '../config';

// Parts that dip into the liquid must draw after it (the liquid material has
// depthWrite disabled, see Fluid.jsx) so they aren't hidden behind its near
// surface, while keeping normal depth-testing so real solids like the
// headplate still occlude them correctly from any angle.
const SUBMERGED_RENDER_ORDER = 1;

function AngledPort({ position, yaw }) {
  return (
    <group position={position} rotation={[0, yaw, 0]}>
      <mesh position={[0, 0.009, 0]} castShadow>
        <cylinderGeometry args={[0.0055, 0.0055, 0.018, 16]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0.016, 0.036, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.0055, 0.0055, 0.055, 16]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0.030, 0.058, 0]} rotation={[0, 0, -0.6]} castShadow>
        <cylinderGeometry args={[0.0045, 0.006, 0.014, 12]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
    </group>
  );
}

function KnurledCap({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.008, 0]} castShadow>
        <cylinderGeometry args={[0.013, 0.013, 0.016, 32]} />
        <meshStandardMaterial {...STEEL_KNURLED} />
      </mesh>
      <mesh position={[0, 0.014, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.013, 0.0025, 8, 32]} />
        <meshStandardMaterial {...STEEL_KNURLED} />
      </mesh>
    </group>
  );
}

function RushtonImpeller({ y }) {
  const blades = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2);
  return (
    <group position={[0, y, 0]}>
      <mesh castShadow renderOrder={SUBMERGED_RENDER_ORDER}>
        <cylinderGeometry args={[0.009, 0.009, 0.016, 24]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh castShadow renderOrder={SUBMERGED_RENDER_ORDER}>
        <cylinderGeometry args={[0.028, 0.028, 0.0025, 48]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      {blades.map((a, i) => (
        <mesh
          key={i}
          position={[0.028 * Math.cos(a), 0, -0.028 * Math.sin(a)]}
          rotation={[0, a, 0]}
          castShadow
          renderOrder={SUBMERGED_RENDER_ORDER}
        >
          <boxGeometry args={[0.019, 0.015, 0.0018]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
    </group>
  );
}

export default function Internals({ rpm }) {
  const spinRef = useRef();

  useFrame((_, delta) => {
    if (spinRef.current) {
      spinRef.current.rotation.y += (rpm / 60) * Math.PI * 2 * delta;
    }
  });

  const knurledPositions = [
    [0.09, 0.352, 0],
    [0.045, 0.352, 0.0779],
    [0, 0.352, 0.09],
    [-0.045, 0.352, 0.0779],
    [-0.09, 0.352, 0],
  ];

  const rimBoltAngles = Array.from({ length: 12 }, (_, i) => (i / 12) * Math.PI * 2);

  const probeAngles = [0.524, 2.618, 3.665, 5.76];

  return (
    <group>
      {/* Central drive housing */}
      <group>
        {[0.3595, 0.3755, 0.3915].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} castShadow>
            <cylinderGeometry args={[0.03, 0.03, 0.015, 48]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        ))}
        <mesh position={[0, 0.408, 0]} castShadow>
          <cylinderGeometry args={[0.012, 0.012, 0.018, 24]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        <mesh position={[0, 0.428, 0]} castShadow>
          <cylinderGeometry args={[0.007, 0.016, 0.022, 24]} />
          <meshStandardMaterial {...STEEL_KNURLED} />
        </mesh>
        <mesh position={[0.006, 0.444, 0]} rotation={[0, 0, 0.35]} castShadow>
          <cylinderGeometry args={[0.004, 0.004, 0.014, 12]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      </group>

      {/* Angled tube ports (10 o'clock, 2 o'clock) */}
      <AngledPort position={[-0.0476, 0.352, -0.0275]} yaw={2.618} />
      <AngledPort position={[0.0476, 0.352, -0.0275]} yaw={0.524} />

      {/* Twin-barb gas fitting (8 o'clock) */}
      <group position={[-0.0606, 0.352, 0.035]}>
        <mesh position={[0, 0.013, 0]} castShadow>
          <cylinderGeometry args={[0.009, 0.009, 0.026, 24]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        <mesh position={[0.006, 0.032, 0]} castShadow>
          <cylinderGeometry args={[0.0035, 0.0035, 0.016, 10]} />
          <meshStandardMaterial {...STEEL_KNURLED} />
        </mesh>
        <mesh position={[-0.006, 0.032, 0]} castShadow>
          <cylinderGeometry args={[0.0035, 0.0035, 0.016, 10]} />
          <meshStandardMaterial {...STEEL_KNURLED} />
        </mesh>
      </group>

      {/* Knurled sensor-port caps */}
      {knurledPositions.map((pos, i) => (
        <KnurledCap key={i} position={pos} />
      ))}

      {/* Rectangular block port (4 o'clock) */}
      <group>
        <mesh position={[0.065, 0.361, 0.0375]} rotation={[0, -0.524, 0]} castShadow>
          <boxGeometry args={[0.03, 0.018, 0.022]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        <mesh position={[0.065, 0.377, 0.0375]} castShadow>
          <cylinderGeometry args={[0.006, 0.006, 0.01, 16]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      </group>

      {/* Rim bolts */}
      {rimBoltAngles.map((angle, i) => (
        <mesh key={i} position={[0.115 * Math.cos(angle), 0.3545, 0.115 * Math.sin(angle)]} castShadow>
          <cylinderGeometry args={[0.0035, 0.0035, 0.005, 12]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
      ))}

      {/* Static probe/dip-tube rods */}
      {probeAngles.slice(0, PROBE_ROD_COUNT).map((a, i) => (
        <mesh
          key={i}
          position={[0.05 * Math.sin(a), 0.206, -0.05 * Math.cos(a)]}
          castShadow
          renderOrder={SUBMERGED_RENDER_ORDER}
        >
          <cylinderGeometry args={[0.0035, 0.0035, 0.292, 12]} />
          <meshStandardMaterial {...STEEL_DARK} />
        </mesh>
      ))}

      {/* Rotating group: agitator shaft + impellers */}
      <group ref={spinRef}>
        <mesh position={[0, 0.1995, 0]} castShadow renderOrder={SUBMERGED_RENDER_ORDER}>
          <cylinderGeometry args={[0.005, 0.005, 0.289, 16]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        <RushtonImpeller y={0.075} />
        <RushtonImpeller y={0.19} />
      </group>
    </group>
  );
}
