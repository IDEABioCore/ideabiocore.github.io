import { Suspense, lazy, useEffect, useState } from 'react';

// Same idle-defer pattern as IdleBioreactor.jsx: the heavy three.js chunk is
// only imported (and only then fetched over the network) once the browser
// reports it has spare idle time, so it never competes with this page's own
// text and nav for bandwidth or main-thread time on first load.
const StrainEngineering = lazy(() => import('./StrainEngineering.jsx'));

export default function IdleStrainEngineering() {
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
      <StrainEngineering />
    </Suspense>
  );
}
