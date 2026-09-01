import { Suspense, lazy, useEffect, useState } from 'react';

// The heavy chunk (three.js + @react-three/fiber + @react-three/drei, ~300KB
// gzipped) is the actual cost, not React itself. `lazy()` code-splits it into
// its own file that Vite only fetches once this component's `import()` call
// runs — and that call is gated behind requestIdleCallback below, so it
// competes for bandwidth/CPU only after the rest of the page (text, nav,
// buttons) has already painted and gone interactive.
const BioreactorScene = lazy(() => import('./BioreactorScene.jsx'));

export default function IdleBioreactor() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = requestIdleCallback(() => setReady(true), { timeout: 2500 });
      return () => cancelIdleCallback(id);
    }
    // Safari has no requestIdleCallback — fall back to a short fixed delay.
    const id = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(id);
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
      <BioreactorScene />
    </Suspense>
  );
}
