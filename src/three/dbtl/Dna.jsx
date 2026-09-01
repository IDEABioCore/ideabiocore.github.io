import { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { cycleT, ease, bump } from './timeline';

const N = 46; // base pairs — sized so the whole helix fits the frame
const RISE = 0.15; // vertical spacing per base pair
const HELIX_R = 0.85;
const TWIST = (Math.PI * 2) / 10.5; // B-DNA: ~10.5 bp per turn
const PLASMID_R = (N * RISE) / (Math.PI * 2); // circumference matches helix length
const TUBE_R = HELIX_R * 0.45;

const GENE_START = 19;
const GENE_END = 27;
const GENE_MID = (GENE_START + GENE_END) / 2;
const GENE_Y = (GENE_MID - (N - 1) / 2) * RISE;

// Timeline windows
const T_HIGHLIGHT = [0.08, 0.18];
const T_OPEN = [0.24, 0.32];
const T_CUT = [0.3, 0.37];
const T_OUT = [0.32, 0.385]; // old gene leaves
const T_IN = [0.395, 0.46]; // new cassette arrives
const T_CLOSE = [0.44, 0.49];
const T_MORPH = [0.46, 0.57]; // linear helix → circular plasmid
const T_SHRINK = [0.56, 0.63]; // plasmid enters the cell
const T_RETURN = [0.93, 1.0]; // helix reappears to close the loop

const dummy = new THREE.Object3D();
const pA = new THREE.Vector3();
const pB = new THREE.Vector3();
const mid = new THREE.Vector3();
const dir = new THREE.Vector3();
const UP = new THREE.Vector3(0, 1, 0);

const C_BASE = new THREE.Color('#8fa6cf');
const C_GENE_OLD = new THREE.Color('#e0765f');
const C_GENE_NEW = new THREE.Color('#c98bff');
const C_BACKBONE = new THREE.Color('#efe8ff');
const C_BACKBONE_GENE = new THREE.Color('#b678f5');
const cTmp = new THREE.Color();

const lerp = THREE.MathUtils.lerp;

/** Strand A/B world positions for base pair `i`, morphed between helix and plasmid. */
function strandPositions(i, morph, open) {
  const ang = i * TWIST;
  const linY = (i - (N - 1) / 2) * RISE;
  const r = HELIX_R * (1 + open);
  const ax = Math.cos(ang) * r;
  const az = Math.sin(ang) * r;

  const big = (i / N) * Math.PI * 2;
  const cx = Math.cos(big) * PLASMID_R;
  const cz = Math.sin(big) * PLASMID_R;
  const rx = Math.cos(big);
  const rz = Math.sin(big);
  const tr = TUBE_R * (1 + open);
  const offR = Math.cos(ang) * tr;
  const offY = Math.sin(ang) * tr;

  pA.set(
    lerp(ax, cx + rx * offR, morph),
    lerp(linY, offY, morph),
    lerp(az, cz + rz * offR, morph)
  );
  pB.set(
    lerp(-ax, cx - rx * offR, morph),
    lerp(linY, -offY, morph),
    lerp(-az, cz - rz * offR, morph)
  );
}

export default function Dna() {
  const groupRef = useRef();
  const rungsRef = useRef();
  const backboneRef = useRef();
  const flashRef = useRef();

  // Deterministic drift direction for the excised gene fragment.
  const geneDrift = useMemo(() => new THREE.Vector3(2.6, 1.1, 0.7), []);

  useFrame((state) => {
    const t = cycleT(state.clock.elapsedTime);
    const rungs = rungsRef.current;
    const backbone = backboneRef.current;
    if (!rungs || !backbone) return;

    const morph = ease(t, T_MORPH[0], T_MORPH[1]);
    const openPhase = ease(t, T_OPEN[0], T_OPEN[1]) * (1 - ease(t, T_CLOSE[0], T_CLOSE[1]));
    const highlight = ease(t, T_HIGHLIGHT[0], T_HIGHLIGHT[1]);
    const outP = ease(t, T_OUT[0], T_OUT[1]);
    const inP = ease(t, T_IN[0], T_IN[1]);

    // Whole-assembly envelope: present through Build, shrinks into the cell,
    // then returns at the very end so the loop is seamless.
    const shrink = 1 - ease(t, T_SHRINK[0], T_SHRINK[1]);
    const back = ease(t, T_RETURN[0], T_RETURN[1]);
    const vis = t < 0.7 ? shrink : back;

    const g = groupRef.current;
    g.visible = vis > 0.001;
    g.scale.setScalar(vis);
    g.rotation.y = state.clock.elapsedTime * 0.22;
    // drop toward the cell as it shrinks away
    g.position.y = (1 - shrink) * -0.6 * (t < 0.7 ? 1 : 0);

    for (let i = 0; i < N; i++) {
      const inGene = i >= GENE_START && i < GENE_END;

      // local unzip falloff around the cut site
      const d = (i - GENE_MID) / 7;
      const open = openPhase * 0.85 * Math.exp(-d * d);

      strandPositions(i, morph, open);

      let sx = 1;
      let ox = 0;
      let oy = 0;
      let oz = 0;
      let color = C_BASE;

      if (inGene) {
        if (inP > 0.001) {
          // new cassette flies in from the opposite side
          const k = 1 - inP;
          ox = -geneDrift.x * k;
          oy = geneDrift.y * k;
          oz = -geneDrift.z * k;
          sx = inP;
          color = C_GENE_NEW;
        } else {
          // original gene drifts out after the cut
          ox = geneDrift.x * outP;
          oy = geneDrift.y * outP;
          oz = geneDrift.z * outP;
          sx = 1 - outP;
          cTmp.copy(C_BASE).lerp(C_GENE_OLD, highlight);
          color = cTmp;
        }
      }

      // ---- rung (base pair) ----
      mid.addVectors(pA, pB).multiplyScalar(0.5);
      dir.subVectors(pB, pA);
      const len = dir.length();
      dir.normalize();

      dummy.position.set(mid.x + ox, mid.y + oy, mid.z + oz);
      dummy.quaternion.setFromUnitVectors(UP, dir);
      dummy.scale.set(sx, len * sx, sx);
      dummy.updateMatrix();
      rungs.setMatrixAt(i, dummy.matrix);
      rungs.setColorAt(i, color);

      // ---- backbone spheres (one per strand) ----
      const bc = inGene ? (inP > 0.001 ? C_BACKBONE_GENE : C_BACKBONE) : C_BACKBONE;

      dummy.position.set(pA.x + ox, pA.y + oy, pA.z + oz);
      dummy.quaternion.identity();
      dummy.scale.setScalar(0.075 * sx);
      dummy.updateMatrix();
      backbone.setMatrixAt(i * 2, dummy.matrix);
      backbone.setColorAt(i * 2, bc);

      dummy.position.set(pB.x + ox, pB.y + oy, pB.z + oz);
      dummy.updateMatrix();
      backbone.setMatrixAt(i * 2 + 1, dummy.matrix);
      backbone.setColorAt(i * 2 + 1, bc);
    }

    rungs.instanceMatrix.needsUpdate = true;
    backbone.instanceMatrix.needsUpdate = true;
    if (rungs.instanceColor) rungs.instanceColor.needsUpdate = true;
    if (backbone.instanceColor) backbone.instanceColor.needsUpdate = true;

    // ---- cut flash ----
    const flash = flashRef.current;
    const f = bump(t, T_CUT[0], T_CUT[1]);
    flash.visible = f > 0.01;
    flash.scale.setScalar(0.8 + f * 1.5);
    flash.material.opacity = f;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh ref={rungsRef} args={[null, null, N]} frustumCulled={false}>
        <cylinderGeometry args={[0.038, 0.038, 1, 8]} />
        <meshStandardMaterial
          roughness={0.35}
          metalness={0.1}
          emissive="#3c1d63"
          emissiveIntensity={0.35}
        />
      </instancedMesh>

      <instancedMesh ref={backboneRef} args={[null, null, N * 2]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshStandardMaterial
          roughness={0.25}
          metalness={0.2}
          emissive="#4a2673"
          emissiveIntensity={0.4}
        />
      </instancedMesh>

      {/* CRISPR cut flash at the target site */}
      <mesh ref={flashRef} position={[0, GENE_Y, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.05, 0.018, 8, 48]} />
        <meshBasicMaterial color="#e9d5ff" transparent opacity={0} toneMapped={false} />
      </mesh>
    </group>
  );
}
