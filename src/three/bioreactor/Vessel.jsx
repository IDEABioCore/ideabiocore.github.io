import { useMemo } from 'react';
import * as THREE from 'three';
import {
  BASE_RADIUS,
  ROD_COUNT,
  ROD_RADIUS,
  ROD_CIRCLE_RADIUS,
  HEADPLATE_RADIUS,
  STEEL,
  STEEL_DARK,
} from './config';

const GRADUATIONS = [
  ['0.25', 0.075],
  ['0.5', 0.125],
  ['0.75', 0.175],
  ['1.0', 0.225],
];

// drei's <Text> (troika-three-text) lazily fetches font-fallback metadata
// from cdn.jsdelivr.net the first time it needs to shape a glyph — that's an
// external CDN call this site doesn't allow. These labels are four short
// numbers, so a small canvas-drawn texture does the same job with zero
// network requests and no extra dependency.
function useLabelTexture(text) {
  return useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    ctx.font = '600 34px system-ui, sans-serif';
    ctx.fillStyle = '#8a8a8a';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 124, 26);
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }, [text]);
}

function GraduationLabel({ label, position }) {
  const texture = useLabelTexture(label);
  return (
    <sprite position={position} scale={[0.024, 0.009, 1]}>
      <spriteMaterial map={texture} transparent depthWrite={false} />
    </sprite>
  );
}

function GraduationMarks() {
  return (
    <group>
      {GRADUATIONS.map(([label, y]) => (
        <group key={label}>
          <GraduationLabel label={label} position={[-0.024, y, 0.0905]} />
          <mesh position={[0.012, y, 0.0895]}>
            <boxGeometry args={[0.014, 0.0012, 0.0008]} />
            <meshBasicMaterial color="#8a8a8a" />
          </mesh>
          {[1, 2, 3].map((step) => (
            <mesh key={step} position={[0.010, y - step * 0.0125, 0.0895]}>
              <boxGeometry args={[0.008, 0.0008, 0.0008]} />
              <meshBasicMaterial color="#8a8a8a" />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

export default function Vessel() {
  const rodPositions = Array.from({ length: ROD_COUNT }, (_, i) => {
    const angle = (i / ROD_COUNT) * Math.PI * 2;
    return [ROD_CIRCLE_RADIUS * Math.cos(angle), 0.168, ROD_CIRCLE_RADIUS * Math.sin(angle)];
  });

  const standoffAngles = Array.from({ length: 6 }, (_, i) => (i / 6) * Math.PI * 2 + 0.26);

  return (
    <group>
      {/* Base disc */}
      <mesh position={[0, 0.006, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[BASE_RADIUS, BASE_RADIUS, 0.012, 64]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]} castShadow>
        <torusGeometry args={[0.109, 0.006, 12, 64]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {/* Support rods */}
      {rodPositions.map((pos, i) => (
        <mesh key={i} position={pos} castShadow>
          <cylinderGeometry args={[ROD_RADIUS, ROD_RADIUS, 0.312, 16]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}

      {/* Glass vessel wall */}
      <mesh position={[0, 0.185, 0]}>
        <cylinderGeometry args={[0.088, 0.088, 0.27, 64, 1, true]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.008}
          roughness={0.05}
          ior={1.5}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.2}
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Glass rounded bottom (dome) */}
      <mesh position={[0, 0.05, 0]} scale={[1, 0.34, 1]}>
        <sphereGeometry args={[0.088, 64, 24, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshPhysicalMaterial
          transmission={1}
          thickness={0.008}
          roughness={0.05}
          ior={1.5}
          metalness={0}
          clearcoat={1}
          clearcoatRoughness={0.1}
          envMapIntensity={1.2}
          color="#ffffff"
          side={THREE.DoubleSide}
        />
      </mesh>

      <GraduationMarks />

      {/* Headplate: lower flange + upper plate */}
      <mesh position={[0, 0.328, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[HEADPLATE_RADIUS, HEADPLATE_RADIUS, 0.008, 64]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
      <mesh position={[0, 0.348, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[HEADPLATE_RADIUS, HEADPLATE_RADIUS, 0.008, 64]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {/* Standoffs between the two plate discs */}
      {standoffAngles.map((angle, i) => (
        <mesh key={i} position={[0.11 * Math.cos(angle), 0.338, 0.11 * Math.sin(angle)]} castShadow>
          <cylinderGeometry args={[0.003, 0.003, 0.012, 8]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}

      {/* Clamp collar bridging glass to headplate */}
      <mesh position={[0, 0.322, 0]} castShadow>
        <cylinderGeometry args={[0.092, 0.092, 0.008, 64]} />
        <meshStandardMaterial {...STEEL_DARK} />
      </mesh>
    </group>
  );
}
