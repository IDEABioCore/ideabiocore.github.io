import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import {
  LIQUID_RADIUS,
  LIQUID_BASE_Y,
  LIQUID_MAX_HEIGHT,
  BUBBLE_MAX,
  BUBBLE_REGION_RADIUS,
  BIOMASS_MAX,
  BIOMASS_REGION_RADIUS,
  GROWTH_T_MID,
  GROWTH_K,
  LIQUID_COLOR_FRESH,
  LIQUID_COLOR_TURBID,
  LIQUID_ROUGHNESS_FRESH,
  LIQUID_ROUGHNESS_TURBID,
} from '../config';

const dummy = new THREE.Object3D();
const colorFresh = new THREE.Color(LIQUID_COLOR_FRESH);
const colorTurbid = new THREE.Color(LIQUID_COLOR_TURBID);

function Bubbles({ volume, aeration }) {
  const meshRef = useRef();

  const { x0, z0, speed, phase, size, wobblePhase } = useMemo(() => {
    const x0 = new Float32Array(BUBBLE_MAX);
    const z0 = new Float32Array(BUBBLE_MAX);
    const speed = new Float32Array(BUBBLE_MAX);
    const phase = new Float32Array(BUBBLE_MAX);
    const size = new Float32Array(BUBBLE_MAX);
    const wobblePhase = new Float32Array(BUBBLE_MAX);
    for (let i = 0; i < BUBBLE_MAX; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radial = Math.sqrt(Math.random()) * BUBBLE_REGION_RADIUS;
      x0[i] = radial * Math.cos(angle);
      z0[i] = radial * Math.sin(angle);
      speed[i] = 0.02 + Math.random() * 0.03;
      phase[i] = Math.random();
      size[i] = 0.0012 + Math.random() * 0.0022;
      wobblePhase[i] = Math.random() * Math.PI * 2;
    }
    return { x0, z0, speed, phase, size, wobblePhase };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const liquidH = volume * LIQUID_MAX_HEIGHT;
    const active = Math.round(aeration * BUBBLE_MAX);
    const speedMult = 0.5 + 1.5 * aeration;
    const travel = Math.max(liquidH - 0.012, 0.001);

    for (let i = 0; i < active; i++) {
      const y = 0.03 + ((phase[i] * travel + t * speed[i] * speedMult) % travel);
      dummy.position.set(
        x0[i] + Math.sin(t * 2 + wobblePhase[i]) * 0.002,
        y,
        z0[i]
      );
      dummy.scale.setScalar(size[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.count = active;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Bubbles sit inside the liquid volume; the liquid material has
  // depthWrite disabled (see below) so it never blocks them, while normal
  // depth-testing here still lets real solids (headplate, base, rods)
  // occlude them correctly from any viewing angle.
  return (
    <instancedMesh ref={meshRef} args={[null, null, BUBBLE_MAX]} frustumCulled={false} renderOrder={2}>
      <sphereGeometry args={[1, 8, 8]} />
      <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0} envMapIntensity={1} />
    </instancedMesh>
  );
}

// Suspended culture biomass: unlike bubbles, these drift gently in place
// throughout the liquid's current volume rather than rising — the visible
// "count" grows with the logistic growth curve driven by growthRef.biomass.
function BiomassParticles({ volume, growthRef }) {
  const meshRef = useRef();

  const { x0, y0Frac, z0, size, jitterPhase, jitterSpeed } = useMemo(() => {
    const x0 = new Float32Array(BIOMASS_MAX);
    const y0Frac = new Float32Array(BIOMASS_MAX); // fraction of current liquid height
    const z0 = new Float32Array(BIOMASS_MAX);
    const size = new Float32Array(BIOMASS_MAX);
    const jitterPhase = new Float32Array(BIOMASS_MAX);
    const jitterSpeed = new Float32Array(BIOMASS_MAX);
    for (let i = 0; i < BIOMASS_MAX; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radial = Math.sqrt(Math.random()) * BIOMASS_REGION_RADIUS;
      x0[i] = radial * Math.cos(angle);
      z0[i] = radial * Math.sin(angle);
      y0Frac[i] = 0.06 + Math.random() * 0.88;
      size[i] = 0.0007 + Math.random() * 0.0011;
      jitterPhase[i] = Math.random() * Math.PI * 2;
      jitterSpeed[i] = 0.3 + Math.random() * 0.5;
    }
    return { x0, y0Frac, z0, size, jitterPhase, jitterSpeed };
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;
    const liquidH = volume * LIQUID_MAX_HEIGHT;
    const active = Math.round(growthRef.biomass * BIOMASS_MAX);

    for (let i = 0; i < active; i++) {
      const y = 0.03 + y0Frac[i] * Math.max(liquidH - 0.03, 0.001);
      dummy.position.set(
        x0[i] + Math.sin(t * jitterSpeed[i] + jitterPhase[i]) * 0.0025,
        y + Math.cos(t * jitterSpeed[i] * 0.8 + jitterPhase[i]) * 0.0025,
        z0[i] + Math.cos(t * jitterSpeed[i] + jitterPhase[i] * 1.3) * 0.0025
      );
      dummy.scale.setScalar(size[i]);
      dummy.updateMatrix();
      meshRef.current.setMatrixAt(i, dummy.matrix);
    }
    meshRef.current.count = active;
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  // Same reasoning as the bubbles: relies on the liquid's depthWrite={false}
  // below, plus normal depth-testing here, for correct layering.
  return (
    <instancedMesh ref={meshRef} args={[null, null, BIOMASS_MAX]} frustumCulled={false} renderOrder={3}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshStandardMaterial color="#d8c79a" roughness={0.6} metalness={0} envMapIntensity={0.6} />
    </instancedMesh>
  );
}

export default function Fluid({ volume, aeration, growthState, running }) {
  const height = volume * LIQUID_MAX_HEIGHT;
  const liquidMatRef = useRef();
  const lerpedColor = useRef(new THREE.Color());

  useFrame((_, delta) => {
    if (running) {
      growthState.time += delta;
    }
    // Logistic growth curve: lag phase, exponential phase, then plateau.
    growthState.biomass = 1 / (1 + Math.exp(-GROWTH_K * (growthState.time - GROWTH_T_MID)));

    if (liquidMatRef.current) {
      lerpedColor.current.copy(colorFresh).lerp(colorTurbid, growthState.biomass);
      liquidMatRef.current.color.copy(lerpedColor.current);
      liquidMatRef.current.roughness =
        LIQUID_ROUGHNESS_FRESH + (LIQUID_ROUGHNESS_TURBID - LIQUID_ROUGHNESS_FRESH) * growthState.biomass;
    }
  });

  return (
    <group>
      {/* depthWrite disabled: this mesh sits between the camera and objects
          (bubbles, stirrer, probe rods) genuinely embedded inside it. If it
          wrote depth, those would always fail the z-test and disappear —
          instead they draw after it (higher renderOrder) with normal
          depth-testing, so real solids like the headplate still occlude
          them correctly while the liquid itself does not. */}
      <mesh position={[0, LIQUID_BASE_Y + height / 2, 0]} scale={[1, height, 1]}>
        <cylinderGeometry args={[LIQUID_RADIUS, LIQUID_RADIUS, 1, 48]} />
        <meshStandardMaterial
          ref={liquidMatRef}
          color={LIQUID_COLOR_FRESH}
          roughness={LIQUID_ROUGHNESS_FRESH}
          metalness={0}
          envMapIntensity={0.8}
          depthWrite={false}
        />
      </mesh>
      <Bubbles volume={volume} aeration={aeration} />
      <BiomassParticles volume={volume} growthRef={growthState} />
    </group>
  );
}
