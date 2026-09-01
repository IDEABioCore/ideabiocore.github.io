import { useRef, useMemo, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import './labels.css';

const NODES = 230;
const CLUSTERS = 7;

// One real pathway per cluster — named so the lit cluster reads as a
// measured pathway rather than an abstract blob.
export const PATHWAYS = [
  'Glycolysis',
  'TCA cycle',
  'Pentose phosphate',
  'Fatty acid synthesis',
  'Amino acid biosynthesis',
  'Terpenoid backbone',
  'Nucleotide metabolism',
];

// A few metabolites annotated by name, the way an omics map is labelled.
const METABOLITES = [
  { node: 12, name: 'ATP' },
  { node: 47, name: 'NADH' },
  { node: 96, name: 'Acetyl-CoA' },
  { node: 158, name: 'Pyruvate' },
  { node: 201, name: 'α-ketoglutarate' },
];
const PULSES = 60;
const NEIGHBOURS = 3;
const CLUSTER_PERIOD = 3.4; // seconds each pathway stays lit

const dummy = new THREE.Object3D();
const vTmp = new THREE.Vector3();
const cTmp = new THREE.Color();

/** Deterministic PRNG so the network is identical on every load. */
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildNetwork() {
  const rnd = mulberry32(20260831);

  // Cluster centres spread over a shell — these read as pathways / complexes.
  const centres = [];
  for (let c = 0; c < CLUSTERS; c++) {
    const y = 1 - (c / (CLUSTERS - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const a = c * 2.399963;
    centres.push(new THREE.Vector3(Math.cos(a) * r * 2.15, y * 1.5, Math.sin(a) * r * 2.15));
  }

  const positions = [];
  const cluster = [];
  for (let i = 0; i < NODES; i++) {
    const c = i % CLUSTERS;
    const centre = centres[c];
    // gaussian-ish scatter around the cluster centre
    const spread = 0.55 + rnd() * 0.5;
    const th = rnd() * Math.PI * 2;
    const ph = Math.acos(2 * rnd() - 1);
    positions.push(
      new THREE.Vector3(
        centre.x + Math.sin(ph) * Math.cos(th) * spread,
        centre.y + Math.sin(ph) * Math.sin(th) * spread * 0.9,
        centre.z + Math.cos(ph) * spread
      )
    );
    cluster.push(c);
  }

  // Link each node to its nearest neighbours; keeps the graph organic.
  const edgeSet = new Set();
  const edges = [];
  for (let i = 0; i < NODES; i++) {
    const d = [];
    for (let j = 0; j < NODES; j++) {
      if (i === j) continue;
      d.push([positions[i].distanceTo(positions[j]), j]);
    }
    d.sort((a, b) => a[0] - b[0]);
    for (let k = 0; k < NEIGHBOURS; k++) {
      const j = d[k][1];
      const key = i < j ? `${i}_${j}` : `${j}_${i}`;
      if (edgeSet.has(key)) continue;
      edgeSet.add(key);
      edges.push([i, j]);
    }
  }

  return { positions, cluster, edges, centres, sizes: positions.map(() => 0.028 + rnd() * 0.042) };
}

/**
 * Names the pathway that is currently lit. Holds its own state and polls a
 * shared ref, so the label updating never re-renders the network itself.
 */
function ActivePathwayLabel({ centroids, activeRef }) {
  const [active, setActive] = useState(0);
  useFrame(() => {
    if (activeRef.current !== active) setActive(activeRef.current);
  });
  return (
    <Html position={centroids[active]} zIndexRange={[10, 0]} style={{ pointerEvents: 'none' }}>
      <span className="omics-label omics-label--pathway">{PATHWAYS[active]}</span>
    </Html>
  );
}

export default function Network({ node, accent, accent2, speed, showLabels = true }) {
  const activeRef = useRef(0);
  const nodesRef = useRef();
  const linesRef = useRef();
  const pulsesRef = useRef();
  const groupRef = useRef();

  const { positions, cluster, edges, centres, sizes, linePositions, pulses } = useMemo(() => {
    const net = buildNetwork();
    const linePositions = new Float32Array(net.edges.length * 6);
    net.edges.forEach(([a, b], i) => {
      const o = i * 6;
      linePositions[o] = net.positions[a].x;
      linePositions[o + 1] = net.positions[a].y;
      linePositions[o + 2] = net.positions[a].z;
      linePositions[o + 3] = net.positions[b].x;
      linePositions[o + 4] = net.positions[b].y;
      linePositions[o + 5] = net.positions[b].z;
    });

    const rnd = mulberry32(7);
    const pulses = Array.from({ length: PULSES }, (_, i) => ({
      edge: Math.floor(rnd() * net.edges.length),
      offset: rnd(),
      rate: 0.28 + rnd() * 0.4,
    }));

    return { ...net, linePositions, pulses };
  }, []);

  const baseColor = useMemo(() => new THREE.Color(node), [node]);
  const litColor = useMemo(() => new THREE.Color(accent2), [accent2]);

  useFrame((state) => {
    const t = state.clock.elapsedTime * speed;

    if (groupRef.current) {
      groupRef.current.rotation.y = t * 0.075;
      groupRef.current.rotation.x = Math.sin(t * 0.11) * 0.12;
    }

    // ---- nodes: the active pathway brightens and swells ----
    const mesh = nodesRef.current;
    if (mesh) {
      const active = Math.floor(t / CLUSTER_PERIOD) % CLUSTERS;
      activeRef.current = active;
      const phase = (t % CLUSTER_PERIOD) / CLUSTER_PERIOD;
      const envelope = Math.sin(phase * Math.PI); // fade in and out

      for (let i = 0; i < NODES; i++) {
        const lit = cluster[i] === active ? envelope : 0;
        const breathe = 1 + Math.sin(t * 1.4 + i) * 0.06;

        dummy.position.copy(positions[i]);
        dummy.scale.setScalar(sizes[i] * breathe * (1 + lit * 0.85));
        dummy.updateMatrix();
        mesh.setMatrixAt(i, dummy.matrix);

        cTmp.copy(baseColor).lerp(litColor, lit);
        mesh.setColorAt(i, cTmp);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    }

    // ---- signal travelling along the edges ----
    const pulseMesh = pulsesRef.current;
    if (pulseMesh) {
      for (let i = 0; i < PULSES; i++) {
        const p = pulses[i];
        const prog = (p.offset + t * p.rate) % 1;
        const [a, b] = edges[p.edge];
        vTmp.copy(positions[a]).lerp(positions[b], prog);

        dummy.position.copy(vTmp);
        // fade at both ends of the hop
        dummy.scale.setScalar(0.03 * Math.sin(prog * Math.PI));
        dummy.updateMatrix();
        pulseMesh.setMatrixAt(i, dummy.matrix);
      }
      pulseMesh.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={groupRef}>
      <lineSegments ref={linesRef} frustumCulled={false}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[linePositions, 3]}
            count={linePositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial color={accent} transparent opacity={0.22} toneMapped={false} />
      </lineSegments>

      <instancedMesh ref={nodesRef} args={[null, null, NODES]} frustumCulled={false}>
        <sphereGeometry args={[1, 14, 14]} />
        <meshStandardMaterial roughness={0.28} metalness={0.25} emissive={accent} emissiveIntensity={0.32} />
      </instancedMesh>

      <instancedMesh ref={pulsesRef} args={[null, null, PULSES]} frustumCulled={false}>
        <sphereGeometry args={[1, 8, 8]} />
        <meshBasicMaterial color={accent2} toneMapped={false} />
      </instancedMesh>

      {showLabels && (
        <>
          <ActivePathwayLabel centroids={centres} activeRef={activeRef} />
          {METABOLITES.map((m) => (
            <Html
              key={m.name}
              position={positions[m.node]}
              zIndexRange={[9, 0]}
              style={{ pointerEvents: 'none' }}
            >
              <span className="omics-label omics-label--metabolite">{m.name}</span>
            </Html>
          ))}
        </>
      )}
    </group>
  );
}
