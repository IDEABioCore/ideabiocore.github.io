import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import Vessel from './Vessel';
import Internals from './Internals';
import Fluid from './Fluid';
import { TARGET_Y } from '../config';

// Shared scene used by both the hero (auto-rotating, not user-driven) and the
// live demo section (drag to orbit). Zoom stays disabled in both so the wheel
// always scrolls the page instead of being captured by the camera.
export default function BioreactorCanvas({
  volume,
  rpm,
  aeration,
  growthState,
  running,
  interactive = false,
  autoRotate = true,
  cameraPosition = [0.38, 0.3, 0.6],
}) {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: cameraPosition, fov: 40, near: 0.01, far: 10 }}
      gl={{ alpha: true }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.35} />
      <directionalLight
        position={[0.6, 1.0, 0.4]}
        intensity={2.0}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-0.4}
        shadow-camera-right={0.4}
        shadow-camera-top={0.5}
        shadow-camera-bottom={-0.1}
        shadow-camera-near={0.1}
        shadow-camera-far={3}
        shadow-bias={-0.0002}
      />
      {/* Violet rim lights tie the reactor to the page palette */}
      <pointLight position={[-0.45, 0.28, -0.3]} intensity={2.2} color="#a855f7" distance={2} />
      <pointLight position={[0.45, 0.12, 0.35]} intensity={1.4} color="#d946ef" distance={2} />

      <Suspense fallback={null}>
        <Environment preset="studio" />
        <Vessel />
        <Internals rpm={rpm} />
        <Fluid volume={volume} aeration={aeration} growthState={growthState} running={running} />
      </Suspense>

      <ContactShadows
        position={[0, 0.001, 0]}
        scale={0.8}
        opacity={0.5}
        blur={2.4}
        far={0.4}
        resolution={1024}
        frames={1}
        color="#2a0b45"
      />

      <OrbitControls
        target={[0, TARGET_Y, 0]}
        enableZoom={false}
        enablePan={false}
        enableRotate={interactive}
        autoRotate={autoRotate}
        autoRotateSpeed={0.6}
        enableDamping
        dampingFactor={0.08}
        maxPolarAngle={Math.PI * 0.52}
      />
    </Canvas>
  );
}
