import { Suspense, lazy, useEffect, useState } from 'react';

// IDEA Bio's --accent / --accent-press / --accent-text (dark-mode values —
// this scene always renders on a forced-dark section, see
// src/pages/projects.astro). Mirrored as plain hex because Three.js scenes
// run outside CSS; keep in sync with global.css if the palette changes.
const ACCENT = '#8B78FF';
const ACCENT_PRESS = '#7358FF';
const ACCENT_LIGHT = '#AC9DFF';

// Same idle-defer pattern as IdleBioreactor.jsx / IdleStrainEngineering.jsx.
const OmicsNetwork = lazy(() => import('./OmicsNetwork.jsx'));

export default function IdleOmicsNetwork() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      {/* OmicsNetwork takes every colour as a prop (no hardcoded hex inside
          it) — these are IDEA Bio's tokens, not the component's own
          VITRIA-purple defaults. */}
      <OmicsNetwork accent={ACCENT} accent2={ACCENT_PRESS} node={ACCENT_LIGHT} interactive />
    </Suspense>
  );
}
