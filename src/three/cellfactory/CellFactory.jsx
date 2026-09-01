import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import Cell from './Cell';
import Outputs from './Outputs';
import './cellfactory.css';

/**
 * IDEA Bio — "Cell Factory".
 *
 * A designed cell taking up feedstock, running it through an engineered
 * pathway, and emitting product that fans out into the portfolio categories.
 *
 * Self-contained and drop-in: transparent background, no external assets
 * fetched at runtime (the environment is built from Lightformers, not an HDRI),
 * and every colour is a prop so it can be matched to brand.
 */
export default function CellFactory({
  accent = '#4ade80',
  accent2 = '#22d3ee',
  membrane = '#dff3ff',
  speed = 1,
  interactive = false,
  showLabels = true,
  className = '',
  style,
}) {
  return (
    <div className={`cellfactory ${className}`} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0.6, 0.9, 8.6], fov: 40, near: 0.1, far: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[4, 5, 5]} intensity={1.6} />
        <pointLight position={[-4, 1, 3]} intensity={18} distance={18} color={accent2} />
        <pointLight position={[4, -2, 2]} intensity={14} distance={18} color={accent} />

        <Suspense fallback={null}>
          {/* Procedural environment — gives the membrane real reflections
              without fetching an HDRI, so the embed stays dependency-free. */}
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={2.2} position={[0, 4, 3]} scale={8} color="#ffffff" />
            <Lightformer form="rect" intensity={1.4} position={[-5, 1, 2]} scale={6} color={accent2} />
            <Lightformer form="circle" intensity={1.6} position={[4, -2, 3]} scale={5} color={accent} />
            <Lightformer form="rect" intensity={0.8} position={[0, -3, -3]} scale={7} color="#ffffff" />
          </Environment>

          <group position={[-1.1, 0.35, 0]}>
            <Cell accent={accent} accent2={accent2} membrane={membrane} speed={speed} />
            <Outputs accent={accent} accent2={accent2} speed={speed} showLabels={showLabels} />
          </group>
        </Suspense>

        {interactive && (
          <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.08} />
        )}
      </Canvas>

    </div>
  );
}
