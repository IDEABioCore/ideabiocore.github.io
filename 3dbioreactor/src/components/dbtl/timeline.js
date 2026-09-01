// One full Design → Build → Test → Learn cycle, in seconds.
export const CYCLE_SECONDS = 30;

export const ACTS = [
  { key: 'design', n: '01', label: 'Design', caption: 'Target the pathway', start: 0.0, end: 0.22 },
  { key: 'build', n: '02', label: 'Build', caption: 'Cut, insert, circularize', start: 0.22, end: 0.54 },
  { key: 'test', n: '03', label: 'Test', caption: 'Transform, grow, ferment', start: 0.54, end: 0.8 },
  { key: 'learn', n: '04', label: 'Learn', caption: 'Measure, model, iterate', start: 0.8, end: 1.0 },
];

export const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);

export const smoothstep = (v) => {
  const x = clamp01(v);
  return x * x * (3 - 2 * x);
};

/** Linear 0→1 progress of `t` across the window [a, b]. */
export const range = (t, a, b) => clamp01((t - a) / (b - a));

/** Eased 0→1 progress of `t` across the window [a, b]. */
export const ease = (t, a, b) => smoothstep(range(t, a, b));

/** 0→1→0 pulse across the window [a, b]. */
export const bump = (t, a, b) => Math.sin(range(t, a, b) * Math.PI);

// Dev-only scrub hook: in `npm run dev`, call window.__dbtlSeek(0.35) from the
// console to freeze the cycle at that point, or __dbtlSeek(null) to resume.
let seek = null;
if (import.meta.env.DEV && typeof window !== 'undefined') {
  window.__dbtlSeek = (v) => {
    seek = v;
  };
}

/** Normalised cycle position from the r3f clock. */
export const cycleT = (elapsed) => seek ?? (elapsed % CYCLE_SECONDS) / CYCLE_SECONDS;

export const actIndexAt = (t) => {
  const i = ACTS.findIndex((a) => t >= a.start && t < a.end);
  return i === -1 ? ACTS.length - 1 : i;
};
