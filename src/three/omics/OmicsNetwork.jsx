import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer, OrbitControls } from '@react-three/drei';
import Network from './Network';
import Proteins from './Proteins';
import './labels.css';

/**
 * IDEA Bio — omics network.
 *
 * A metabolite / protein interaction network in 3D: clustered nodes wired by
 * their nearest neighbours, signal pulsing along the edges, one pathway
 * lighting up at a time, with alpha-helix motifs drifting through it.
 *
 * Drop-in and brand-agnostic: transparent background, every colour a prop,
 * and nothing fetched at runtime (the environment is built from Lightformers
 * rather than an HDRI).
 */
export default function OmicsNetwork({
  accent = '#a855f7',
  accent2 = '#d946ef',
  node = '#c4b5fd',
  speed = 1,
  interactive = false,
  showLabels = true,
  showLegend = true,
  className = '',
  style,
}) {
  return (
    <div
      className={`omics ${className}`}
      style={{ position: 'relative', width: '100%', height: '100%', ...style }}
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 7.6], fov: 42, near: 0.1, far: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.55} />
        <directionalLight position={[4, 5, 5]} intensity={1.2} />
        <pointLight position={[-4, 1.5, 3]} intensity={22} distance={20} color={accent} />
        <pointLight position={[4, -2, 2]} intensity={16} distance={20} color={accent2} />

        <Suspense fallback={null}>
          <Environment resolution={256}>
            <Lightformer form="rect" intensity={1.8} position={[0, 4, 3]} scale={8} color="#ffffff" />
            <Lightformer form="rect" intensity={1.6} position={[-5, 1, 2]} scale={6} color={accent} />
            <Lightformer form="circle" intensity={1.8} position={[4, -2, 3]} scale={5} color={accent2} />
          </Environment>

          <Network
            node={node}
            accent={accent}
            accent2={accent2}
            speed={speed}
            showLabels={showLabels}
          />
          <Proteins accent={accent} accent2={accent2} speed={speed} showLabels={showLabels} />
        </Suspense>

        {interactive && (
          <OrbitControls enableZoom={false} enablePan={false} enableDamping dampingFactor={0.08} />
        )}
      </Canvas>

      {showLegend && (
        <div className="omics-legend">
          <div className="omics-legend__item">
            <span className="omics-legend__dot" style={{ background: node }} />
            <span>
              <span className="omics-legend__name">Metabolomics</span>{' '}
              <span className="omics-legend__desc">— metabolite pathways, measured flux</span>
            </span>
          </div>
          <div className="omics-legend__item">
            <span className="omics-legend__dot" style={{ background: accent2 }} />
            <span>
              <span className="omics-legend__name">Proteomics</span>{' '}
              <span className="omics-legend__desc">— the enzymes that run them</span>
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
